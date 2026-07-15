package org.ssssy.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeSettingResponse {

  private UUID id;
  private String settingKey;
  private String settingValue;
  private String settingType;
  private String groupName;
  private String label;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
