package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAccountResponse {
  private UUID id;
  private UUID userId;
  private String emailAddress;
  private String username;
  private String displayName;
  private Long quotaBytes;
  private Long usedBytes;
  private Boolean isActive;
  private Boolean isVerified;
  private Boolean autoReplyEnabled;
  private String autoReplySubject;
  private String autoReplyBody;
  private String forwardTo;
  private Boolean forwardKeepCopy;
  private String signature;
  private LocalDateTime lastSyncAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
