package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter @Builder
public class GalleryAiResponse {

  private String altText;
  private List<String> tags;
  private String smartCrop;
  private String message;
}
