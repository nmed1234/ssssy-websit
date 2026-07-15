package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailStorageReportResponse {
  private UUID accountId;
  private String emailAddress;
  private String displayName;
  private Long quotaBytes;
  private Long usedBytes;
  private Double usagePercent;
}
