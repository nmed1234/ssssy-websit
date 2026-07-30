package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Response DTO for a content type definition (includes its field list). */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeDefinitionResponse {

  private UUID id;
  private String name;
  private String labelEn;
  private String labelAr;
  private String description;
  private String icon;
  private UUID workflowId;
  private String workflowName;
  private Boolean allowComments;
  private Boolean allowMemberSubmit;
  private Boolean requiresApproval;
  private Boolean isActive;
  private Integer sortOrder;
  private String createdByUsername;
  private long entryCount;
  private List<ContentTypeFieldResponse> fields;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
