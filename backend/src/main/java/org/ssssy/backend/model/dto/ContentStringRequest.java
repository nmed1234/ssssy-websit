package org.ssssy.backend.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ContentStringRequest {
  private String stringKey;
  private String valueEn;
  private String valueAr;
  private String stringGroup;
  private String description;
}
