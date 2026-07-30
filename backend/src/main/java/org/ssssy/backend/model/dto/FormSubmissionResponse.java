package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSubmissionResponse {
  private UUID id;
  private UUID formId;
  private String formTitle;
  private UUID userId;
  private String submitterName;
  private String submitterEmail;
  private String data;
  private String ipAddress;
  private String status;
  private String adminNotes;
  private LocalDateTime createdAt;
}
