package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IconPackResponse {
    private String packId;
    private String packName;
    private String description;
    private int iconCount;
    private String license;
    private String homepage;
    private List<String> categories;
}
