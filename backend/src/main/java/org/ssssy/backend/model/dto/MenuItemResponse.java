package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItemResponse {
  private UUID id;
  private UUID menuId;
  private UUID parentId;
  private String labelAr;
  private String labelEn;
  private String url;
  private String target;
  private String icon;
  private UUID pageId;
  private Integer sortOrder;
  private Boolean isActive;
  private LocalDateTime createdAt;
}
