package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThemeResponse {
    private UUID id;
    private String nameEn;
    private String nameAr;
    private String themeJson;
    private Boolean isActive;
    private Boolean isSystem;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
