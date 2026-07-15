package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {
  private UUID id;
  private String type;
  private String title;
  private String body;
  private String link;
  private UUID referenceId;
  private String referenceType;
  private Boolean isRead;
  private LocalDateTime createdAt;
}
