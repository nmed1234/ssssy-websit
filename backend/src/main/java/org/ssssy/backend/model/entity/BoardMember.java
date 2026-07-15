package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BoardMember {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(name = "position_ar", nullable = false, length = 255)
  private String positionAr;

  @Column(name = "position_en", length = 255)
  private String positionEn;

  @Column(name = "term_start")
  private LocalDate termStart;

  @Column(name = "term_end")
  private LocalDate termEnd;

  @Column(columnDefinition = "TEXT")
  private String bio;

  @Column(name = "photo_url", length = 500)
  private String photoUrl;

  @Column(name = "sort_order")
  private Integer sortOrder;

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
    if (sortOrder == null) sortOrder = 0;
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
