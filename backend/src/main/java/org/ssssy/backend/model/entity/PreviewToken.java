package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Short-lived token that grants unauthenticated read access to a page's
 * layout snapshot for preview purposes.
 *
 * Token: 32 random bytes hex-encoded → 64 ASCII characters (CHAR(64)).
 * Tokens expire 1 hour after creation.
 *
 * Requirements: 8.4, 8.5
 */
@Entity
@Table(name = "preview_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PreviewToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "page_id", nullable = false)
    private UUID pageId;

    /**
     * 64-character hex string derived from 32 random bytes.
     * Must be unique across all preview_tokens rows.
     */
    @Column(name = "token", nullable = false, unique = true, length = 64,
            columnDefinition = "CHAR(64)")
    private String token;

    /**
     * Snapshot of the layout JSON at the moment the preview was requested.
     * This is what the preview renderer displays — not the live saved version.
     */
    @Column(name = "layout_json", nullable = false, columnDefinition = "TEXT")
    private String layoutJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
