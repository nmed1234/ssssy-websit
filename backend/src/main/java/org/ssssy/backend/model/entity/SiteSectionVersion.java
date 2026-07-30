package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "site_section_versions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"section_id", "version_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSectionVersion {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "section_id", nullable = false)
  private UUID sectionId;

  @Column(name = "version_number", nullable = false)
  private Integer versionNumber;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String data;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String config;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String styling;

  @Column(name = "published_by", length = 255)
  private String publishedBy;

  @Column(name = "change_summary", length = 500)
  private String changeSummary;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (data == null) data = "{}";
    if (config == null) config = "{}";
    if (styling == null) styling = "{}";
  }
}
