package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FormSubmissionRequest {
  /** JSON object: {"fieldName":"value", ...} */
  private String data;
  /** Optional: resolved from field named "name" or "full_name" if present */
  private String submitterName;
  /** Optional: resolved from field named "email" if present */
  private String submitterEmail;
}
