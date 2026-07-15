package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/preview/pages/{id}.
 *
 * Requirements: 8.4, 8.5
 */
@Data
public class GeneratePreviewRequest {

    @NotBlank
    private String layoutJson;
}
