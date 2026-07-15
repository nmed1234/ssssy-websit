package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "publications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "title_en", nullable = false, length = 500)
    private String titleEn;

    @Column(name = "title_ar", length = 500)
    private String titleAr;

    @Column(unique = true, nullable = false, length = 550)
    private String slug;

    @Column(name = "abstract_en", columnDefinition = "TEXT")
    private String abstractEn;

    @Column(name = "abstract_ar", columnDefinition = "TEXT")
    private String abstractAr;

    @Column(length = 500)
    private String authors;

    @Column
    private Integer year;

    @Column(length = 100)
    private String category;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "file_size_kb")
    private Integer fileSizeKb;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) isActive = true;
        if (sortOrder == null) sortOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
