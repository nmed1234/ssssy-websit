package org.ssssy.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThemeSettingRequest {

  @NotBlank
  private String settingKey;

  @NotBlank
  private String settingValue;

  private String settingType;

  private String groupName;

  private String label;
}
