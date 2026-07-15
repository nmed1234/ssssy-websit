package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workflows")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Workflow {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "content_type", nullable = false, unique = true, length = 50)
  private String contentType;

  @Column(name = "name_ar", nullable = false, length = 255)
  private String nameAr;

  @Column(name = "name_en", nullable = false, length = 255)
  private String nameEn;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
