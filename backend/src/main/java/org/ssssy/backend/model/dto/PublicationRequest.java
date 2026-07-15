package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PublicationRequest {

    @NotBlank
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
}
