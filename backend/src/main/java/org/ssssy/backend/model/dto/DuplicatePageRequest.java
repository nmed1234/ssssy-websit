package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DuplicatePageRequest {
    private String newTitle;
    private String newSlug;
}
