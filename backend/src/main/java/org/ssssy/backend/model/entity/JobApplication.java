package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobApplication {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "job_vacancy_id", nullable = false)
  private JobVacancy jobVacancy;

  @Column(name = "first_name", nullable = false, length = 100)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 100)
  private String lastName;

  @Column(nullable = false, length = 320)
  private String email;

  @Column(length = 50)
  private String phone;

  @Column(name = "cover_letter", columnDefinition = "TEXT")
  private String coverLetter;

  @Column(name = "cv_file_path", length = 500)
  private String cvFilePath;

  @Column(length = 30)
  private String status;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (status == null) status = "PENDING";
  }
}
