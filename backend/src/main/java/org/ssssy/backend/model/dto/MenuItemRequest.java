package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MenuItemRequest {
  private UUID menuId;

  /**
   * parentId is nullable (null = top-level item).
   * clearParent is a companion boolean: the frontend sets this to true when the
   * user explicitly wants to remove the parent (move item to top level).
   * This avoids the ambiguity between "parentId not sent" vs "parentId sent as null".
   */
  private UUID parentId;

  /** When true, the item's parent will be set to null regardless of parentId value. */
  private boolean clearParent = false;

  private String labelAr;
  private String labelEn;
  private String url;
  private String target;
  private String icon;
  private UUID pageId;
  private Integer sortOrder;
  private Boolean isActive;
}
