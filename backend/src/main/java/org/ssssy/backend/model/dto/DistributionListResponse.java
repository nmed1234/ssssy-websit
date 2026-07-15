package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DistributionListResponse {
  private UUID id;
  private String name;
  private String emailAddress;
  private String description;
  private String listType;
  private Boolean isPublic;
  private Boolean allowExternal;
  private UUID moderatorId;
  private Boolean requiresModeration;
  private UUID createdById;
  private Integer memberCount;
  private LocalDateTime createdAt;
}
