package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailRecipientResponse {
  private UUID id;
  private UUID messageId;
  private String recipientType;
  private String address;
  private String name;
  private Boolean isInternal;
}
