package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "site_sections")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSection {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(unique = true, length = 250)
  private String slug;

  @Column(name = "component_type", nullable = false, length = 100)
  private String componentType;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String config;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String data;

  @Column(columnDefinition = "jsonb", nullable = false)
  @JdbcTypeCode(SqlTypes.JSON)
  private String styling;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(length = 50)
  private String location;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "events_json", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String eventsJson;

  @Column(name = "conditions_json", columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String conditionsJson;

  @Column(name = "version")
  private Integer version;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (config == null) config = "{}";
    if (data == null) data = "{}";
    if (styling == null) styling = "{}";
    if (isActive == null) isActive = true;
    if (sortOrder == null) sortOrder = 0;
    if (location == null) location = "general";
    if (eventsJson == null) eventsJson = "{}";
    if (conditionsJson == null) conditionsJson = "{}";
    if (version == null) version = 1;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
