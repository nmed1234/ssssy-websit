package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommentResponse {
  private UUID id;
  private UUID contentItemId;
  private UUID parentId;
  private String authorName;
  private String authorPhoto;
  private String body;
  private Boolean isApproved;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private List<CommentResponse> replies;
}
