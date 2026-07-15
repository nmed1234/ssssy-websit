package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "component_presets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComponentPreset {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "name_ar", length = 200)
  private String nameAr;

  @Column(name = "name_en", length = 200)
  private String nameEn;

  @Column(name = "component_type", nullable = false, length = 100)
  private String componentType;

  @Column(name = "config_json", columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String configJson;

  @Column(name = "data_json", columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String dataJson;

  @Column(name = "styling_json", columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String stylingJson;

  @Column(name = "is_system")
  private Boolean isSystem;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by")
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (configJson == null) configJson = "{}";
    if (dataJson == null) dataJson = "{}";
    if (stylingJson == null) stylingJson = "{}";
    if (isSystem == null) isSystem = false;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
