package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MenuRequest {
  private String name;
  private String location;
  private Boolean isActive;
  /** Visual dropdown template: classic | mega | minimal | modern */
  private String menuTemplate;
  /** Framer-motion animation style: fade | slide | scale | flip */
  private String dropdownStyle;
  /** Whether this menu's style is the site-wide default */
  private Boolean isDefaultStyle;
  /** Freeform JSON colour overrides e.g. {"bgColor":"#fff","textColor":"#333"} */
  private String styleConfig;
}
