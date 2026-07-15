package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Persists HTTP redirects created automatically whenever a published page's
 * slug is changed, so that old URLs continue to work.
 *
 * Requirements: 6.7
 */
@Entity
@Table(name = "url_redirects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UrlRedirect {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The old slug path (e.g. "/about-us"). */
    @Column(name = "from_path", nullable = false, length = 500)
    private String fromPath;

    /** The new slug path the client should be redirected to. */
    @Column(name = "to_path", nullable = false, length = 500)
    private String toPath;

    /**
     * HTTP status code for the redirect.
     * Defaults to 301 (permanent) for slug changes on published pages.
     */
    @Column(name = "redirect_type", nullable = false)
    private Integer redirectType;

    /**
     * Optional reference back to the page that triggered this redirect.
     * Nullable — the page may have been deleted after the redirect was created.
     */
    @Column(name = "page_id")
    private UUID pageId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (redirectType == null) redirectType = 301;
    }
}
