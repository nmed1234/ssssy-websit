package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class MediaFolderResponse {

  private UUID id;
  private String name;
  private UUID parentId;
  private String parentName;
  private Long fileCount;
  private LocalDateTime createdAt;

  public MediaFolderResponse() {}
}
