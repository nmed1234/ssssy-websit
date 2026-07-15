package org.ssssy.backend.model.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter @Builder
public class GalleryAnalyticsSummaryResponse {

  private long totalViews;
  private long totalDownloads;
  private long totalShares;
  private long totalPrints;
  private Map<String, Long> eventTypeBreakdown;
  private Map<String, Long> dailyViews;
}
