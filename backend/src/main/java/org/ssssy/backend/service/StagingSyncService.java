package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.dto.StagingStatusResponse;
import org.ssssy.backend.model.entity.SystemConfig;
import org.ssssy.backend.repository.SystemConfigRepository;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * StagingSyncService — manages staging mode toggle and sync-to-production.
 *
 * In a full multi-schema deployment this would copy rows from a staging schema
 * to the production schema atomically. Here we persist staging state via SystemConfig
 * and log sync actions.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StagingSyncService {

    private final SystemConfigRepository systemConfigRepository;

    private static final String STAGING_MODE_KEY = "staging_mode_enabled";
    private static final String LAST_SYNC_KEY    = "staging_last_sync_at";

    public StagingStatusResponse getStatus() {
        return StagingStatusResponse.builder()
                .stagingEnabled(isStagingEnabled())
                .lastSyncAt(readValue(LAST_SYNC_KEY))
                .pendingChanges(0)
                .message(isStagingEnabled() ? "Staging mode active" : "Staging mode inactive")
                .build();
    }

    public boolean isStagingEnabled() {
        return "true".equalsIgnoreCase(readValue(STAGING_MODE_KEY));
    }

    @Transactional
    public void enableStaging() {
        writeValue(STAGING_MODE_KEY, "true", "staging", "Whether staging mode is active");
        log.info("Staging mode enabled");
    }

    @Transactional
    public void disableStaging() {
        writeValue(STAGING_MODE_KEY, "false", "staging", "Whether staging mode is active");
        log.info("Staging mode disabled");
    }

    @Transactional
    public StagingStatusResponse syncToProduction(UUID operatorId) {
        log.info("Staging sync to production initiated by user {}", operatorId);
        String now = LocalDateTime.now().toString();
        writeValue(LAST_SYNC_KEY, now, "staging", "Last staging sync timestamp");
        log.info("Staging sync completed at {}", now);
        return StagingStatusResponse.builder()
                .stagingEnabled(isStagingEnabled())
                .lastSyncAt(now)
                .pendingChanges(0)
                .message("Sync completed at " + now)
                .build();
    }

    public String generatePreviewToken(String slug, int expiryDays) {
        String token = "prev_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        log.info("Preview token {} generated for slug={} expiryDays={}", token, slug, expiryDays);
        return token;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String readValue(String key) {
        return systemConfigRepository.findByConfigKey(key)
                .map(SystemConfig::getConfigValue)
                .orElse(null);
    }

    private void writeValue(String key, String value, String group, String description) {
        SystemConfig cfg = systemConfigRepository.findByConfigKey(key)
                .orElse(SystemConfig.builder()
                        .configKey(key)
                        .configGroup(group)
                        .configType("text")
                        .description(description)
                        .isEncrypted(false)
                        .build());
        cfg.setConfigValue(value);
        systemConfigRepository.save(cfg);
    }
}
