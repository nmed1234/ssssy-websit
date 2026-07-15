package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailRule {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id")
  private EmailAccount account;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(name = "order_index")
  private Integer orderIndex;

  @Column(name = "is_enabled")
  private Boolean isEnabled;

  @Column(name = "stop_processing")
  private Boolean stopProcessing;

  @Column(name = "match_all")
  private Boolean matchAll;

  @Column(columnDefinition = "JSONB NOT NULL DEFAULT '[]'::jsonb")
  private String conditions;

  @Column(columnDefinition = "JSONB NOT NULL DEFAULT '[]'::jsonb")
  private String actions;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isEnabled == null) isEnabled = true;
    if (stopProcessing == null) stopProcessing = false;
    if (matchAll == null) matchAll = false;
    if (orderIndex == null) orderIndex = 0;
    if (conditions == null) conditions = "[]";
    if (actions == null) actions = "[]";
  }
}
