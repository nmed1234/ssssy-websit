package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.ssssy.backend.model.entity.GalleryAnalyticsEvent;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GalleryAnalyticsEventRepository extends JpaRepository<GalleryAnalyticsEvent, UUID> {

  long countByAlbumIdAndEventType(UUID albumId, String eventType);

  long countByAlbumIdAndEventTypeAndCreatedAtAfter(UUID albumId, String eventType, LocalDateTime after);

  @Query("SELECT FUNCTION('date_trunc', 'day', e.createdAt) as day, COUNT(e) as cnt " +
         "FROM GalleryAnalyticsEvent e WHERE e.album.id = :albumId AND e.eventType = :eventType " +
         "GROUP BY FUNCTION('date_trunc', 'day', e.createdAt) ORDER BY day")
  List<Object[]> countByAlbumIdAndEventTypeGroupByDay(@Param("albumId") UUID albumId, @Param("eventType") String eventType);

  @Query("SELECT e.eventType, COUNT(e) FROM GalleryAnalyticsEvent e WHERE e.album.id = :albumId GROUP BY e.eventType")
  List<Object[]> countByAlbumIdGroupByEventType(@Param("albumId") UUID albumId);

  List<GalleryAnalyticsEvent> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
}
