package org.ssssy.backend.model.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailMessageRequest {
  @NotBlank
  private String subject;
  private String bodyHtml;
  private String bodyText;
  private String priority;
  private Boolean isDraft;
  private LocalDateTime scheduledSendAt;
  @NotBlank
  private String senderEmail;
  private String senderName;
  private List<String> toRecipients;
  private List<String> ccRecipients;
  private List<String> bccRecipients;
}
