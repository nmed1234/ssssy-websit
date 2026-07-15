package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThemeRequest {
    private String nameEn;
    private String nameAr;
    private String themeJson;
    private Boolean isSystem;
}
