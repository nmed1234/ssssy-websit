package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Column(nullable = false, unique = true, length = 255)
  private String email;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @Column(name = "first_name_ar", length = 100)
  private String firstNameAr;

  @Column(name = "last_name_ar", length = 100)
  private String lastNameAr;

  @Column(name = "first_name_en", length = 100)
  private String firstNameEn;

  @Column(name = "last_name_en", length = 100)
  private String lastNameEn;

  @Column(length = 50)
  private String phone;

  @Column(name = "avatar_url", length = 500)
  private String avatarUrl;

  @Column(length = 200)
  private String institution;

  @Column(length = 200)
  private String department;

  @Column(length = 200)
  private String position;

  @Column(length = 200)
  private String specialization;

  @Column(columnDefinition = "TEXT")
  private String biography;

  @Column(length = 500)
  private String address;

  @Column(length = 100)
  private String city;

  @Column(length = 100)
  private String country;

  @Column(name = "two_factor_enabled")
  private Boolean twoFactorEnabled;

  @Column(name = "two_factor_secret", length = 255)
  private String twoFactorSecret;

  @Column(name = "preferred_language", length = 10)
  private String preferredLanguage;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "role_id", nullable = false)
  private Role role;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "is_email_verified")
  private Boolean isEmailVerified;

  @Column(name = "email_verified_at")
  private LocalDateTime emailVerifiedAt;

  @Column(name = "last_login_at")
  private LocalDateTime lastLoginAt;

  @Column(name = "failed_login_attempts")
  private Integer failedLoginAttempts;

  @Column(name = "account_locked_until")
  private LocalDateTime accountLockedUntil;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
    if (isEmailVerified == null) isEmailVerified = false;
    if (failedLoginAttempts == null) failedLoginAttempts = 0;
    if (twoFactorEnabled == null) twoFactorEnabled = false;
    if (preferredLanguage == null) preferredLanguage = "en";
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
