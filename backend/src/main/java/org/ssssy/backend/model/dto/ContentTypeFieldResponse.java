package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

/** Response DTO for a single content type field. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeFieldResponse {

  private UUID id;
  private String fieldName;
  private String fieldLabelEn;
  private String fieldLabelAr;
  private String fieldType;
  private Boolean isRequired;
  private Boolean isSearchable;
  private Boolean isListed;
  private String placeholderEn;
  private String placeholderAr;
  private String helpTextEn;
  private String helpTextAr;
  private String optionsJson;
  private String validationJson;
  private Integer sortOrder;
  private LocalDateTime createdAt;
}
