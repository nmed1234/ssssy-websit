package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * A recursive tree node for the folder-tree response at
 * GET /api/admin/media-folders.
 *
 * Each node contains its direct children (which in turn contain their children),
 * forming a fully recursive tree structure.
 *
 * Requirements: 16.2
 */
@Getter @Setter @AllArgsConstructor @Builder
public class MediaFolderTreeNode {

  private UUID id;
  private String name;
  private UUID parentId;
  private Long fileCount;
  private LocalDateTime createdAt;

  /** Recursively-populated child folders (empty list for leaf nodes). */
  private List<MediaFolderTreeNode> children;

  public MediaFolderTreeNode() {}
}
