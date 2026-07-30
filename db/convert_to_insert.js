const fs = require('fs');
const content = fs.readFileSync('db/fullBakupfinal.sql', 'utf8');
const lines = content.split('\n');
const out = [];
let inCopy = false;
let cols = [];
let tableName = '';
let skippedOwner = 0;
let convertedCopy = 0;
let totalRows = 0;

function escapeVal(v) {
  if (v === '\\N') return 'NULL';
  // Escape backslashes first, then single quotes
  v = v.replace(/\\/g, '\\\\');
  v = v.replace(/'/g, "''");
  return "'" + v + "'";
}

function tabRowToInsert(table, colList, row) {
  const vals = row.split('\t');
  const escaped = vals.map(escapeVal);
  return 'INSERT INTO public.' + table + ' (' + colList.join(', ') + ') VALUES (' + escaped.join(', ') + ');';
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  // Skip ALTER ... OWNER TO ssssy lines
  if (/^ALTER (TABLE|SEQUENCE|TYPE|SCHEMA|VIEW|FUNCTION|AGGREGATE) .+ OWNER TO ssssy/.test(trimmed)) {
    skippedOwner++;
    continue;
  }

  // Detect COPY block start
  if (!inCopy && /^COPY public\.\S+.*FROM stdin/.test(trimmed)) {
    const m = trimmed.match(/COPY public\.(\S+)\s*\(([^)]+)\)/);
    if (m) {
      tableName = m[1];
      cols = m[2].split(',').map(c => c.trim());
      inCopy = true;
      convertedCopy++;
      continue; // skip the COPY line itself
    }
  }

  // Inside COPY block
  if (inCopy) {
    if (trimmed === '\\.') {
      // End of COPY block
      inCopy = false;
      cols = [];
      tableName = '';
      continue;
    }
    if (trimmed !== '') {
      out.push(tabRowToInsert(tableName, cols, line));
      totalRows++;
    }
    continue;
  }

  // Pass through everything else (DDL, sequences, constraints, etc.)
  out.push(line);
}

fs.writeFileSync('db/fullBakupfinal_insert.sql', out.join('\n'), 'utf8');
const sizeKB = fs.statSync('db/fullBakupfinal_insert.sql').size / 1024;
console.log('Done!');
console.log('COPY blocks converted:', convertedCopy);
console.log('Data rows as INSERTs:', totalRows);
console.log('OWNER lines removed:', skippedOwner);
console.log('Output size:', sizeKB.toFixed(1), 'KB');

// Verify
const result = fs.readFileSync('db/fullBakupfinal_insert.sql', 'utf8');
const copyLeft = (result.match(/^COPY /mg) || []).length;
console.log('COPY statements remaining:', copyLeft);
const ownerLeft = (result.match(/OWNER TO ssssy/g) || []).length;
console.log('ssssy OWNER refs remaining:', ownerLeft);
const arabicChars = (result.match(/[\u0600-\u06FF]/g) || []).length;
console.log('Arabic characters preserved:', arabicChars);
