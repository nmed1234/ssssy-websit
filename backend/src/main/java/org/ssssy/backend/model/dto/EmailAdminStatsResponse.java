package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAdminStatsResponse {
  private long totalAccounts;
  private long activeAccounts;
  private long totalUsedBytes;
}
