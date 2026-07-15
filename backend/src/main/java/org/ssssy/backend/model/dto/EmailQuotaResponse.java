package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailQuotaResponse {
  private Long quotaBytes;
  private Long usedBytes;
  private Double usagePercent;
  private Boolean isQuotaExceeded;
  private LocalDateTime lastSyncAt;
}
