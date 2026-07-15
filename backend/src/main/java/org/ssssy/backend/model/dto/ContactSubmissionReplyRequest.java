package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ContactSubmissionReplyRequest {

  @NotBlank
  private String replyBody;
}
