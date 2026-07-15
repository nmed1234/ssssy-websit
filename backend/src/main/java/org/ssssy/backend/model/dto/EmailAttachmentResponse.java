package org.ssssy.backend.model.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailAttachmentResponse {
  private UUID id;
  private UUID messageId;
  private String filename;
  private String mimeType;
  private Integer sizeBytes;
  private String storagePath;
  private Boolean isInline;
}
