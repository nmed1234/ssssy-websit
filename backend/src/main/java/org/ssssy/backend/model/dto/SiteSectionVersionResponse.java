package org.ssssy.backend.model.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SiteSectionVersionResponse {

  private UUID id;
  private UUID sectionId;
  private Integer versionNumber;
  private String data;
  private String config;
  private String styling;
  private String publishedBy;
  private String changeSummary;
  private LocalDateTime createdAt;
}
