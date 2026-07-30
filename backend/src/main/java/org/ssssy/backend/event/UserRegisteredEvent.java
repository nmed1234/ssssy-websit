package org.ssssy.backend.event;

import java.util.UUID;

/**
 * Fired when a new user account is successfully created and registered.
 */
public class UserRegisteredEvent extends CmsEvent {

  private final UUID userId;
  private final String email;
  private final String username;
  private final String role;

  public UserRegisteredEvent(UUID userId, String email, String username, String role) {
    super(userId);
    this.userId = userId;
    this.email = email;
    this.username = username;
    this.role = role;
  }

  @Override
  public String getEventType() { return "USER_REGISTERED"; }

  public UUID getUserId() { return userId; }
  public String getEmail() { return email; }
  public String getUsername() { return username; }
  public String getRole() { return role; }
}
