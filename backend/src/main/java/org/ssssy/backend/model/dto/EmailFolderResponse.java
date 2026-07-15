package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailFolderResponse {
  private UUID id;
  private UUID accountId;
  private UUID parentId;
  private String name;
  private String folderType;
  private Boolean systemFolder;
  private Integer sortOrder;
  private Integer unreadCount;
  private Integer totalCount;
  private LocalDateTime createdAt;
}
