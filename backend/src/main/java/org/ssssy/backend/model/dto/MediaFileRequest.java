package org.ssssy.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter @Setter
public class MediaFileRequest {

  private String altTextAr;
  private String altTextEn;
  private String captionEn;
  private String captionAr;
  private String tags;
  private UUID folderId;
}
