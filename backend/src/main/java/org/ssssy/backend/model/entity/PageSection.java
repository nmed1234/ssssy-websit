package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "page_sections")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageSection {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "page_id", nullable = false)
  private Page page;

  @Column(name = "component_type", nullable = false, length = 100)
  private String componentType;

  @Column(columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String config;

  @Column(columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String data;

  @Column(columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private String styling;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(length = 20)
  private String visibility;

  @Column(name = "is_animated")
  private Boolean isAnimated;

  @Column(name = "animation_type", length = 50)
  private String animationType;

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
    if (sortOrder == null) sortOrder = 0;
    if (visibility == null) visibility = "ALWAYS";
    if (isAnimated == null) isAnimated = false;
    if (eventsJson == null) eventsJson = "{}";
    if (conditionsJson == null) conditionsJson = "{}";
    if (version == null) version = 1;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
