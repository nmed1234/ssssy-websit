package org.ssssy.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.dto.GalleryAnalyticsRequest;
import org.ssssy.backend.model.entity.GalleryAlbum;
import org.ssssy.backend.model.entity.GalleryAnalyticsEvent;
import org.ssssy.backend.model.entity.GalleryImage;
import org.ssssy.backend.repository.GalleryAlbumRepository;
import org.ssssy.backend.repository.GalleryAnalyticsEventRepository;
import org.ssssy.backend.repository.GalleryImageRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GalleryAnalyticsService {

  private final GalleryAnalyticsEventRepository analyticsEventRepository;
  private final GalleryAlbumRepository galleryAlbumRepository;
  private final GalleryImageRepository galleryImageRepository;

  @Transactional
  public void trackEvent(GalleryAnalyticsRequest request, HttpServletRequest httpRequest) {
    GalleryAlbum album = galleryAlbumRepository.findById(request.getAlbumId())
        .orElse(null);
    if (album == null) return;

    GalleryImage image = null;
    if (request.getImageId() != null) {
      image = galleryImageRepository.findById(request.getImageId()).orElse(null);
    }

    GalleryAnalyticsEvent event = GalleryAnalyticsEvent.builder()
        .album(album)
        .image(image)
        .eventType(request.getEventType().toUpperCase())
        .ipAddress(httpRequest != null ? httpRequest.getRemoteAddr() : null)
        .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
        .referer(httpRequest != null ? httpRequest.getHeader("Referer") : null)
        .sessionId(request.getSessionId())
        .build();

    analyticsEventRepository.save(event);

    if ("VIEW".equalsIgnoreCase(request.getEventType())) {
      album.setViewCount(album.getViewCount() + 1);
      galleryAlbumRepository.save(album);
    } else if ("DOWNLOAD".equalsIgnoreCase(request.getEventType())) {
      album.setDownloadCount(album.getDownloadCount() + 1);
      galleryAlbumRepository.save(album);
    }
  }

  @Transactional(readOnly = true)
  public long getAlbumViewCount(UUID albumId) {
    return analyticsEventRepository.countByAlbumIdAndEventType(albumId, "VIEW");
  }

  @Transactional(readOnly = true)
  public long getAlbumDownloadCount(UUID albumId) {
    return analyticsEventRepository.countByAlbumIdAndEventType(albumId, "DOWNLOAD");
  }

  @Transactional(readOnly = true)
  public List<Object[]> getEventTypeBreakdown(UUID albumId) {
    return analyticsEventRepository.countByAlbumIdGroupByEventType(albumId);
  }
}
