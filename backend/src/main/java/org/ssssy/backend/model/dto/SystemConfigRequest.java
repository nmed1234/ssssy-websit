package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SystemConfigRequest {
  private String configKey;
  private String configValue;
  private String configGroup;
  private String configType;
  private String description;
  private Boolean isEncrypted;
}
