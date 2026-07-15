package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactSubmissionResponse {
  private UUID id;
  private String name;
  private String email;
  private String phone;
  private String subject;
  private String message;
  private Boolean isRead;
  private UUID readBy;
  private LocalDateTime repliedAt;
  private LocalDateTime createdAt;
}
