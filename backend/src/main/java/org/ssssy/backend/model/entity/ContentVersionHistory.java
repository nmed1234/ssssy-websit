package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_version_history",
    uniqueConstraints = @UniqueConstraint(columnNames = {"content_type", "content_id", "version_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentVersionHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "content_type", nullable = false, length = 100)
  private String contentType;

  @Column(name = "content_id", nullable = false)
  private UUID contentId;

  @Column(name = "version_number", nullable = false)
  private Integer versionNumber;

  @Column(name = "data_snapshot", nullable = false, columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String dataSnapshot;

  @Column(name = "change_description", columnDefinition = "TEXT")
  private String changeDescription;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
