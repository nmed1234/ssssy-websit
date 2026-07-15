package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemConfigResponse {
  private UUID id;
  private String configKey;
  private String configValue;
  private String configGroup;
  private String configType;
  private Boolean isEncrypted;
  private String description;
  private String updatedByName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
