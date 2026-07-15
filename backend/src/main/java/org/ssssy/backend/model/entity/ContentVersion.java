package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_versions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentVersion {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "content_id", nullable = false)
  private ContentItem content;

  @Column(nullable = false)
  private Integer version;

  @Column(name = "title_ar", length = 500)
  private String titleAr;

  @Column(name = "title_en", length = 500)
  private String titleEn;

  @Column(columnDefinition = "TEXT")
  private String excerpt;

  @Column(columnDefinition = "jsonb")
  private String body;

  @Column(length = 30)
  private String status;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "changed_by", nullable = false)
  private User changedBy;

  @Column(name = "change_summary", length = 500)
  private String changeSummary;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
