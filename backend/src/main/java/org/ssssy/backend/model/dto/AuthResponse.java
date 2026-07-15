package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class AuthResponse {

  private String accessToken;
  private String refreshToken;
  private UUID userId;
  private String username;
  private String email;
  private String role;
  private String tokenType;

  public AuthResponse() {
    this.tokenType = "Bearer";
  }
}
