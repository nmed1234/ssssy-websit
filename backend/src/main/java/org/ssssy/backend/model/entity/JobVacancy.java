package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_vacancies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobVacancy {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "title_ar", nullable = false, length = 500)
  private String titleAr;

  @Column(name = "title_en", length = 500)
  private String titleEn;

  @Column(nullable = false, unique = true, length = 550)
  private String slug;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(columnDefinition = "TEXT")
  private String requirements;

  @Column(length = 500)
  private String location;

  @Column(name = "job_type", length = 50)
  private String jobType;

  @Column(length = 200)
  private String department;

  @Column(name = "deadline")
  private LocalDate deadline;

  @Column(name = "is_published")
  private Boolean isPublished;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", nullable = false)
  private User createdBy;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
    if (isPublished == null) isPublished = false;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
