package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PublicationResponse {

    private UUID id;
    private String titleEn;
    private String titleAr;
    private String slug;
    private String abstractEn;
    private String abstractAr;
    private String authors;
    private Integer year;
    private String category;
    private String coverImageUrl;
    private String pdfUrl;
    private Integer fileSizeKb;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
