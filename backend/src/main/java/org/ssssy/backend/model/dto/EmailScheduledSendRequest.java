package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailScheduledSendRequest {
  private String status;
  private LocalDateTime scheduledAt;
}
