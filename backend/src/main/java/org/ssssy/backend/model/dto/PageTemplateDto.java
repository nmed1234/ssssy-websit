package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Read-only DTO returned by GET /api/admin/page-templates.
 * Intentionally omits layoutJson to keep the list response lean.
 *
 * Requirements: 20.3
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageTemplateDto {

    private UUID id;
    private String name;
    private String category;
    private String description;
    private String thumbnailUrl;
    private Integer usageCount;
    private LocalDateTime createdAt;
}
