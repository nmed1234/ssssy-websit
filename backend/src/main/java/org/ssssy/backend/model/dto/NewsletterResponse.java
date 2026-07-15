package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NewsletterResponse {
  private UUID id;
  private String email;
  private String name;
  private Boolean isActive;
  private LocalDateTime subscribedAt;
  private LocalDateTime unsubscribedAt;
}
