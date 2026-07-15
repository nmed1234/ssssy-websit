package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NewsletterSubscribeRequest {
  private String email;
  private String name;
}
