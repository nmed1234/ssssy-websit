package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StagingStatusResponse {
    private boolean stagingEnabled;
    private String lastSyncAt;
    private int pendingChanges;
    private String message;
}
