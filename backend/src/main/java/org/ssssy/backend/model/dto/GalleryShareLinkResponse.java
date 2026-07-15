package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Builder
public class GalleryShareLinkResponse {

  private UUID id;
  private UUID albumId;
  private String albumTitle;
  private String token;
  private String shareUrl;
  private LocalDateTime expiresAt;
  private Integer maxViews;
  private Integer currentViews;
  private Boolean isActive;
  private String createdByName;
  private LocalDateTime createdAt;
}
