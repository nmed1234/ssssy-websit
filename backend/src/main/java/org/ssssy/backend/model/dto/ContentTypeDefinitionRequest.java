package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

/** Request to create or update a content type definition. */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentTypeDefinitionRequest {

  private String name;          // "research-paper"
  private String labelEn;
  private String labelAr;
  private String description;
  private String icon;
  private UUID workflowId;
  private Boolean allowComments;
  private Boolean allowMemberSubmit;
  private Boolean requiresApproval;
  private Boolean isActive;
  private Integer sortOrder;

  /** Full field list — replaces existing fields on PUT. */
  private List<ContentTypeFieldRequest> fields;
}
