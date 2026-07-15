package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @AllArgsConstructor @Builder
public class MediaFileResponse {

  private UUID id;
  private String filename;
  private String originalFilename;
  private String mimeType;
  private Long sizeBytes;
  private String url;
  private String thumbnailUrl;
  private Integer width;
  private Integer height;
  private String altTextAr;
  private String altTextEn;
  private String captionEn;
  private String captionAr;
  private String tags;
  private UUID uploaderId;
  private String uploaderDisplayName;
  private UUID folderId;
  private String folderName;
  private UUID userId;
  private String userName;
  private LocalDateTime createdAt;

  public MediaFileResponse() {}
}
