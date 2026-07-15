package org.ssssy.backend.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminNotificationResponse {
    private UUID id;
    private String title;
    private String body;
    private String type;
    private String relatedEntityType;
    private UUID relatedEntityId;
    private Boolean isRead;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}