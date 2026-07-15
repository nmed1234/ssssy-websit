package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_quota_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailQuotaLog {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private EmailAccount account;

  @Column(name = "used_bytes_before", nullable = false)
  private Long usedBytesBefore;

  @Column(name = "used_bytes_after", nullable = false)
  private Long usedBytesAfter;

  @Column(name = "change_bytes", nullable = false)
  private Long changeBytes;

  @Column(nullable = false, length = 50)
  private String operation;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "message_id")
  private EmailMessage message;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
