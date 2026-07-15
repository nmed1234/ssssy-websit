package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_distribution_lists")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DistributionList {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(name = "email_address", length = 320, nullable = false, unique = true)
  private String emailAddress;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "list_type", length = 50, nullable = false)
  private String listType;

  @Column(name = "is_public")
  private Boolean isPublic;

  @Column(name = "allow_external")
  private Boolean allowExternal;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "moderator_id")
  private User moderator;

  @Column(name = "requires_moderation")
  private Boolean requiresModeration;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isPublic == null) isPublic = true;
    if (allowExternal == null) allowExternal = false;
    if (requiresModeration == null) requiresModeration = false;
  }
}
