package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class GalleryPasswordAuthResponse {

  private String accessToken;
  private boolean authenticated;
}
