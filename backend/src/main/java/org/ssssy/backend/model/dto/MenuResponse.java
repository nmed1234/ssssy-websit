package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuResponse {
  private UUID id;
  private String name;
  private String location;
  private Boolean isActive;
  private int itemCount;
  private List<MenuItemResponse> items;
  private LocalDateTime createdAt;
  /** Visual dropdown template: classic | mega | minimal | modern */
  private String menuTemplate;
  /** Framer-motion animation style: fade | slide | scale | flip */
  private String dropdownStyle;
  /** Whether this menu's style is the site-wide default */
  private Boolean isDefaultStyle;
  /** Freeform JSON colour overrides */
  private String styleConfig;
}
