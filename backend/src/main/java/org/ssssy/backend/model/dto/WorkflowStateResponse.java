package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkflowStateResponse {
  private UUID id;
  private UUID workflowId;
  private String name;
  private String labelAr;
  private String labelEn;
  private String color;
  private Boolean isInitial;
  private Boolean isFinal;
  private Integer sortOrder;
}
