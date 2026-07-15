package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailQuotaLogResponse {
  private UUID id;
  private UUID accountId;
  private String emailAddress;
  private Long usedBytesBefore;
  private Long usedBytesAfter;
  private Long changeBytes;
  private String operation;
  private UUID messageId;
  private LocalDateTime createdAt;
}
