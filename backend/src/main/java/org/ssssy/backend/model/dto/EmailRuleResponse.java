package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailRuleResponse {
  private UUID id;
  private UUID accountId;
  private String name;
  private Integer orderIndex;
  private Boolean isEnabled;
  private Boolean stopProcessing;
  private Boolean matchAll;
  private String conditions;
  private String actions;
  private LocalDateTime createdAt;
}
