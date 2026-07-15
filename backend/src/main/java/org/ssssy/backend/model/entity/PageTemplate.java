package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Reusable page layout templates that pre-populate the block tree when
 * creating a new page.
 *
 * Requirements: 20.2
 */
@Entity
@Table(name = "page_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    /**
     * One of: Layout, Landing, About, Contact, Blog.
     * Enforced by a CHECK constraint in the migration.
     */
    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 500)
    private String description;

    /**
     * Full block tree JSON in the canonical {"version":"1","blocks":[...]} format.
     */
    @Column(name = "layout_json", nullable = false, columnDefinition = "TEXT")
    private String layoutJson;

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    /**
     * Incremented each time a page is created from this template.
     */
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usageCount == null) usageCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
