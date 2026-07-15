package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "component_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComponentTemplate {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 255)
  private String name;

  @Column(nullable = false, length = 50)
  private String category;

  @Column(name = "component_type", nullable = false, unique = true, length = 100)
  private String componentType;

  @Column(name = "thumbnail_url", length = 500)
  private String thumbnailUrl;

  @Column(name = "default_config", columnDefinition = "jsonb", nullable = false)
  private String defaultConfig;

  @Column(name = "default_data", columnDefinition = "jsonb", nullable = false)
  private String defaultData;

  @Column(name = "default_styling", columnDefinition = "jsonb", nullable = false)
  private String defaultStyling;

  @Column(name = "is_system")
  private Boolean isSystem;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (defaultConfig == null) defaultConfig = "{}";
    if (defaultData == null) defaultData = "{}";
    if (defaultStyling == null) defaultStyling = "{}";
    if (isSystem == null) isSystem = false;
    if (sortOrder == null) sortOrder = 0;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
