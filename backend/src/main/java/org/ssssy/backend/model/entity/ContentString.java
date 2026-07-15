package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_strings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContentString {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "string_key", nullable = false, unique = true, length = 255)
  private String stringKey;

  @Column(name = "value_en", nullable = false, columnDefinition = "TEXT")
  private String valueEn;

  @Column(name = "value_ar", nullable = false, columnDefinition = "TEXT")
  private String valueAr;

  @Column(name = "string_group", nullable = false, length = 100)
  private String stringGroup;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
