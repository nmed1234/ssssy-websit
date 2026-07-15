package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailFolderCountsResponse {
  private UUID folderId;
  private String folderName;
  private Integer totalCount;
  private Integer unreadCount;
}
