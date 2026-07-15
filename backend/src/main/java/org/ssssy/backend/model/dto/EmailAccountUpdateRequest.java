package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailAccountUpdateRequest {
  private Boolean isActive;
  private Long quotaBytes;
  private String displayName;
  private String forwardTo;
  private Boolean forwardKeepCopy;
  private String signature;
  private Boolean autoReplyEnabled;
  private String autoReplySubject;
  private String autoReplyBody;
}
