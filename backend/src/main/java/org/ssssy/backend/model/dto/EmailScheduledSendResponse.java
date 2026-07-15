package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailScheduledSendResponse {
  private UUID id;
  private UUID messageId;
  private String subject;
  private UUID accountId;
  private String senderAddress;
  private LocalDateTime scheduledAt;
  private String status;
  private String errorMessage;
  private LocalDateTime createdAt;
  private LocalDateTime processedAt;
}
