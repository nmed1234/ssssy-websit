package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SeoMetadataRequest {
  @Size(max = 200)
  private String metaTitle;

  @Size(max = 500)
  private String metaDescription;

  @Size(max = 200)
  private String ogTitle;

  @Size(max = 500)
  private String ogDescription;

  @Size(max = 500)
  private String ogImageUrl;

  @Size(max = 1000)
  private String canonicalUrl;

  @Size(max = 100)
  private String robots;
}
