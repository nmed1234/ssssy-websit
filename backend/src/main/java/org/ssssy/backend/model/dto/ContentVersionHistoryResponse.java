package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentVersionHistoryResponse {

  private UUID id;
  private String contentType;
  private UUID contentId;
  private Integer versionNumber;
  private String dataSnapshot;
  private String changeDescription;
  private UUID createdById;
  private String createdByName;
  private LocalDateTime createdAt;
}
