const fs = require('fs');

const input = 'backup-db.sql';
const output = 'backup-db-insert.sql';

// Read as buffer then decode as UTF-8 (strips BOM if present)
let content = fs.readFileSync(input);
// Strip UTF-8 BOM (EF BB BF) if present
if (content[0] === 0xEF && content[1] === 0xBB && content[2] === 0xBF) {
  content = content.slice(3);
}
content = content.toString('utf8');
// Fix owner references inline
content = content.replace(/OWNER TO ssssy/g, 'OWNER TO neondb_owner')
                 .replace(/TO ssssy;/g, 'TO neondb_owner;')
                 .replace(/BY ssssy/g, 'BY neondb_owner');
const lines = content.split('\n');

const result = [];
let inCopy = false;
let columns = [];
let tableName = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect COPY statement
  const copyMatch = line.match(/^COPY\s+([\w.]+)\s*\(([^)]+)\)\s+FROM stdin;/);
  if (copyMatch) {
    inCopy = true;
    tableName = copyMatch[1];
    columns = copyMatch[2].split(',').map(c => c.trim());
    continue;
  }

  // End of COPY data block
  if (inCopy && line.trim() === '\\.') {
    inCopy = false;
    tableName = '';
    columns = [];
    continue;
  }

  // Inside COPY data block - convert to INSERT
  if (inCopy) {
    if (line.trim() === '') continue;

    const values = line.split('\t');
    const escaped = values.map(v => {
      if (v === '\\N') return 'NULL';
      // Escape single quotes
      const s = v.replace(/\\/g, '\\').replace(/'/g, "''");
      return `'${s}'`;
    });

    result.push(`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${escaped.join(', ')});`);
    continue;
  }

  // Skip SET ROLE and ALTER ... OWNER lines that might cause issues
  if (line.match(/^SET ROLE|^REVOKE ALL ON SCHEMA|^GRANT .* TO ssssy/)) {
    continue;
  }

  result.push(line);
}

// Write as UTF-8 without BOM
fs.writeFileSync(output, result.join('\n'), { encoding: 'utf8' });

const stats = fs.statSync(output);
console.log(`Done! Output: ${output} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Lines processed: ${result.length}`);
