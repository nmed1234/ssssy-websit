package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_aliases")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAlias {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id")
  private EmailAccount account;

  @Column(name = "alias_address", length = 320, nullable = false, unique = true)
  private String aliasAddress;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
  }
}
