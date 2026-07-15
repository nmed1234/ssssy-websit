package org.ssssy.backend.model.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardStatsResponse {
  private long totalMembers;
  private long publishedArticles;
  private long draftArticles;
  private long pendingReviews;
  private long totalContent;
  private long totalCategories;
  private long totalTags;
  private long totalMediaFiles;
  private long storageUsedBytes;
}
