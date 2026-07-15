package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsletterSendRequest {
  @NotBlank
  private String fromAddress;
  @NotBlank
  private String subject;
  private String bodyHtml;
  private String bodyText;
}
