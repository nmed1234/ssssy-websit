package org.ssssy.backend.migration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

/**
 * One-time server-side migration runner that converts legacy {@code page_sections} rows
 * into the new {@code layout_json} format on the {@code pages} table.
 *
 * <p>Activation: set {@code migration.legacy-sections.enabled=true} in application config
 * and restart the application. The script runs once on startup, then the flag should be
 * reverted to {@code false} to prevent re-execution.
 *
 * <p>Requirements: 3.1–3.9
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "migration.legacy-sections.enabled", havingValue = "true")
@RequiredArgsConstructor
public class MigrateLegacySectionsScript implements ApplicationRunner {

    // ── Legacy component_type registry ────────────────────────────────────────

    private static final Set<String> LEGACY_SECTION_TYPES = Set.of(
            "about-hero-banner",
            "about-overview-section",
            "about-vision-mission-section",
            "about-organizational-chart-section",
            "about-timeline-section",
            "about-documents-section",
            "about-gallery-section",
            "board-hero-banner",
            "board-members-intro-grid",
            "board-members-grid",
            "board-term-information-section",
            "contact-hero-banner",
            "contact-form-section",
            "newsletter-hero-banner",
            "president-message-hero-banner",
            "president-message-content-section",
            "publications-hero-banner",
            "news-list-section",
            "events-list-section",
            "jobs-list-section",
            "members-list-section",
            "publications-list-section",
            "board-list-section"
    );

    // ── SQL ────────────────────────────────────────────────────────────────────

    private static final String SQL_BACKUP =
            "INSERT INTO page_sections_backup SELECT * FROM page_sections";

    private static final String SQL_DISTINCT_PAGES =
            "SELECT DISTINCT page_id FROM page_sections WHERE component_type = ANY(?)";

    private static final String SQL_SECTIONS_FOR_PAGE =
            "SELECT id, component_type, data::text, config::text, styling::text, sort_order, visibility " +
            "FROM page_sections " +
            "WHERE page_id = ? AND component_type = ANY(?) " +
            "ORDER BY sort_order ASC";

    private static final String SQL_UPDATE_SECTION =
            "UPDATE page_sections SET data = ?::jsonb, config = '{}'::jsonb, styling = '{}'::jsonb, " +
            "updated_at = NOW() WHERE id = ?";

    private static final String SQL_UPDATE_PAGE_LAYOUT =
            "UPDATE pages SET layout_json = ?, updated_at = NOW() WHERE id = ?";

    private static final String SQL_READ_LAYOUT =
            "SELECT layout_json FROM pages WHERE id = ?";

    // ── Dependencies ──────────────────────────────────────────────────────────

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;

    @Value("${migration.legacy-sections.enabled:false}")
    private boolean enabled;

    // ── ApplicationRunner entry point ─────────────────────────────────────────

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!enabled) {
            log.info("[MigrateLegacySections] migration.legacy-sections.enabled=false — skipping migration.");
            return;
        }

        log.info("[MigrateLegacySections] Starting legacy section migration…");

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);

            // ── Step 1: Backup ────────────────────────────────────────────────
            log.info("[MigrateLegacySections] Step 1: backing up page_sections…");
            try (Statement stmt = conn.createStatement()) {
                stmt.executeUpdate(SQL_BACKUP);
            }
            conn.commit();
            log.info("[MigrateLegacySections] Backup complete.");

            // ── Step 2: Collect distinct page IDs ─────────────────────────────
            Array legacyTypesArray = conn.createArrayOf("text",
                    LEGACY_SECTION_TYPES.toArray(new String[0]));

            List<UUID> pageIds = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(SQL_DISTINCT_PAGES)) {
                ps.setArray(1, legacyTypesArray);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        pageIds.add(rs.getObject("page_id", UUID.class));
                    }
                }
            }
            log.info("[MigrateLegacySections] Found {} page(s) with legacy sections.", pageIds.size());

            // ── Step 3: Migrate per page (SAVEPOINT per page) ─────────────────
            List<UUID> successfulPages = new ArrayList<>();

            for (UUID pageId : pageIds) {
                String savepointName = "sp_page_" + pageId.toString().replace("-", "_");
                Savepoint savepoint = null;
                try {
                    savepoint = conn.setSavepoint(savepointName);
                    migratePage(conn, pageId, legacyTypesArray);
                    conn.releaseSavepoint(savepoint);
                    conn.commit();
                    successfulPages.add(pageId);
                    log.info("[MigrateLegacySections] Page {} migrated successfully.", pageId);
                } catch (Exception ex) {
                    log.error("[MigrateLegacySections] Failed to migrate page {}: {}. Rolling back savepoint.",
                            pageId, ex.getMessage(), ex);
                    if (savepoint != null) {
                        try {
                            conn.rollback(savepoint);
                        } catch (SQLException rollbackEx) {
                            log.error("[MigrateLegacySections] Rollback savepoint failed for page {}: {}",
                                    pageId, rollbackEx.getMessage());
                        }
                    }
                    // Continue with the next page
                }
            }

            // ── Step 4: Post-migration validation ─────────────────────────────
            log.info("[MigrateLegacySections] Step 4: validating {} migrated page(s)…", successfulPages.size());
            validateMigratedPages(conn, successfulPages);

            log.info("[MigrateLegacySections] Migration complete. Migrated {}/{} page(s).",
                    successfulPages.size(), pageIds.size());
        }
    }

    // ── Per-page migration ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private void migratePage(Connection conn, UUID pageId, Array legacyTypesArray) throws Exception {

        // Fetch all legacy sections for this page
        List<SectionRow> sections = new ArrayList<>();
        try (PreparedStatement ps = conn.prepareStatement(SQL_SECTIONS_FOR_PAGE)) {
            ps.setObject(1, pageId);
            ps.setArray(2, legacyTypesArray);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    SectionRow row = new SectionRow(
                            rs.getObject("id", UUID.class),
                            rs.getString("component_type"),
                            rs.getString(3),  // data::text
                            rs.getString(4),  // config::text
                            rs.getString(5),  // styling::text
                            rs.getInt("sort_order"),
                            rs.getString("visibility")
                    );
                    sections.add(row);
                }
            }
        }

        if (sections.isEmpty()) {
            log.warn("[MigrateLegacySections] No legacy sections found for page {} — skipping.", pageId);
            return;
        }

        // Layout blocks accumulator
        List<Map<String, Object>> blocks = new ArrayList<>();

        for (SectionRow sec : sections) {
            UUID sectionId       = sec.id();
            String componentType = sec.componentType();
            String beforeData    = sec.data();

            // Parse the three JSONB bags (null-safe)
            Map<String, Object> dataMap    = parseJsonMap(sec.data());
            Map<String, Object> configMap  = parseJsonMap(sec.config());
            Map<String, Object> stylingMap = parseJsonMap(sec.styling());

            // Flatten: styling < config < data (data wins)
            Map<String, Object> merged = new LinkedHashMap<>();
            merged.putAll(stylingMap);
            merged.putAll(configMap);
            merged.putAll(dataMap);

            // Detect "items" arrays — find first List<?> value, keep under its original key
            String itemsKey = null;
            for (Map.Entry<String, Object> entry : merged.entrySet()) {
                if (entry.getValue() instanceof List<?>) {
                    itemsKey = entry.getKey();
                    break;
                }
            }
            // merged IS the new props — items array is already present under its original key

            // Serialize merged props back to JSON
            String afterData = objectMapper.writeValueAsString(merged);

            // Update page_sections: data = mergedProps, config = {}, styling = {}
            try (PreparedStatement ps = conn.prepareStatement(SQL_UPDATE_SECTION)) {
                ps.setString(1, afterData);
                ps.setObject(2, sectionId);
                ps.executeUpdate();
            }

            log.info("[MigrateLegacySections] Section transformed: sectionId={}, componentType={}, " +
                     "beforeData={}, afterData={}",
                    sectionId, componentType, beforeData, afterData);

            // Build layout block
            Map<String, Object> block = new LinkedHashMap<>();
            block.put("id", sectionId.toString());
            block.put("type", componentType);
            block.put("props", merged);
            blocks.add(block);
        }

        // Build layout_json for the page
        Map<String, Object> layoutJson = new LinkedHashMap<>();
        layoutJson.put("version", "1");
        layoutJson.put("blocks", blocks);
        String layoutJsonStr = objectMapper.writeValueAsString(layoutJson);

        // Update pages.layout_json
        try (PreparedStatement ps = conn.prepareStatement(SQL_UPDATE_PAGE_LAYOUT)) {
            ps.setString(1, layoutJsonStr);
            ps.setObject(2, pageId);
            ps.executeUpdate();
        }
    }

    // ── Post-migration validation ─────────────────────────────────────────────

    private void validateMigratedPages(Connection conn, List<UUID> pageIds) {
        for (UUID pageId : pageIds) {
            try (PreparedStatement ps = conn.prepareStatement(SQL_READ_LAYOUT)) {
                ps.setObject(1, pageId);
                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        log.warn("[MigrateLegacySections] VALIDATION FAIL — page {} not found in DB.", pageId);
                        continue;
                    }
                    String layoutJsonStr = rs.getString("layout_json");
                    if (layoutJsonStr == null || layoutJsonStr.isBlank()) {
                        log.warn("[MigrateLegacySections] VALIDATION FAIL — page {} has NULL/empty layout_json.", pageId);
                        continue;
                    }
                    @SuppressWarnings("unchecked")
                    Map<String, Object> parsed = objectMapper.readValue(layoutJsonStr,
                            new TypeReference<Map<String, Object>>() {});
                    boolean hasVersion = parsed.containsKey("version");
                    boolean hasBlocks  = parsed.get("blocks") instanceof List<?>;
                    if (hasVersion && hasBlocks) {
                        log.info("[MigrateLegacySections] VALIDATION PASS — page {}.", pageId);
                    } else {
                        log.warn("[MigrateLegacySections] VALIDATION FAIL — page {} missing '{}'. layout_json={}",
                                pageId,
                                !hasVersion ? "version" : "blocks",
                                layoutJsonStr);
                    }
                }
            } catch (Exception ex) {
                log.error("[MigrateLegacySections] VALIDATION ERROR — page {}: {}", pageId, ex.getMessage(), ex);
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Parses a JSONB field (returned from JDBC as a plain {@code String}) into a
     * {@code Map<String, Object>}.  Returns an empty map on {@code null} / blank / parse error.
     */
    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isBlank() || json.equals("{}") || json.equals("null")) {
            return new LinkedHashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, Object>>() {});
        } catch (Exception ex) {
            log.warn("[MigrateLegacySections] Failed to parse JSON field '{}': {}", json, ex.getMessage());
            return new LinkedHashMap<>();
        }
    }

    // ── Internal record for section row data ──────────────────────────────────

    private record SectionRow(
            UUID id,
            String componentType,
            String data,
            String config,
            String styling,
            int sortOrder,
            String visibility
    ) {}
}
