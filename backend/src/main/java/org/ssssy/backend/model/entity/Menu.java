package org.ssssy.backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "menus", uniqueConstraints = {
  @UniqueConstraint(name = "uq_menus_location", columnNames = "location")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Menu {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 50)
  private String location;

  @Column(name = "is_active")
  private Boolean isActive;

  /** Visual dropdown template: classic | mega | minimal | modern */
  @Column(name = "menu_template", length = 50)
  private String menuTemplate;

  /** Framer-motion animation style: fade | slide | scale | flip */
  @Column(name = "dropdown_style", length = 50)
  private String dropdownStyle;

  /** When true this menu's style is used as the site-wide default */
  @Column(name = "is_default_style")
  private Boolean isDefaultStyle;

  /** Freeform JSON: optional colour overrides e.g. {"bgColor":"#fff","textColor":"#333"} */
  @Column(name = "style_config", columnDefinition = "text")
  private String styleConfig;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    if (isActive == null) isActive = true;
    if (menuTemplate == null) menuTemplate = "classic";
    if (dropdownStyle == null) dropdownStyle = "slide";
    if (isDefaultStyle == null) isDefaultStyle = false;
  }
}
