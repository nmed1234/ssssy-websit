package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItem {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "menu_id", nullable = false)
  private Menu menu;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id")
  private MenuItem parent;

  @Column(name = "label_ar", length = 255)
  private String labelAr;

  @Column(name = "label_en", length = 255)
  private String labelEn;

  @Column(length = 1000)
  private String url;

  @Column(length = 50)
  private String target;

  @Column(length = 100)
  private String icon;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "page_id")
  private Page page;

  @Column(name = "sort_order")
  private Integer sortOrder;

  @Column(name = "is_active")
  private Boolean isActive;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
    if (sortOrder == null) sortOrder = 0;
  }
}
