package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.GalleryShareLink;
import org.ssssy.backend.service.GalleryAnalyticsService;
import org.ssssy.backend.service.GalleryService;
import org.ssssy.backend.service.GalleryShareService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/gallery")
@RequiredArgsConstructor
public class PublicGalleryController {

  private final GalleryService galleryService;
  private final GalleryShareService shareService;
  private final GalleryAnalyticsService analyticsService;

  @GetMapping("/albums")
  public ResponseEntity<ApiResponse<List<GalleryAlbumResponse>>> getPublishedAlbums() {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getPublishedAlbums()));
  }

  @GetMapping("/albums/{slug}")
  public ResponseEntity<ApiResponse<GalleryAlbumDetailResponse>> getAlbumBySlug(
      @PathVariable String slug,
      @RequestParam(required = false) String accessToken) {
    var album = galleryService.getAlbumBySlug(slug, false);
    if (album.getIsPasswordProtected()) {
      return ResponseEntity.ok(ApiResponse.ok(
          GalleryAlbumDetailResponse.builder()
              .id(album.getId())
              .titleAr(album.getTitleAr())
              .titleEn(album.getTitleEn())
              .descriptionAr(album.getDescriptionAr())
              .descriptionEn(album.getDescriptionEn())
              .slug(album.getSlug())
              .isPublished(album.getIsPublished())
              .isPasswordProtected(true)
              .viewCount(album.getViewCount())
              .downloadCount(album.getDownloadCount())
              .imageCount(album.getImageCount())
              .createdAt(album.getCreatedAt())
              .updatedAt(album.getUpdatedAt())
              .build()
      ));
    }
    var full = galleryService.getAlbumBySlug(slug, true);
    return ResponseEntity.ok(ApiResponse.ok(full));
  }

  @PostMapping("/auth")
  public ResponseEntity<ApiResponse<GalleryPasswordAuthResponse>> authenticateAlbum(
      @Valid @RequestBody GalleryPasswordAuthRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(
        galleryService.authenticateAlbum(request.getAlbumId(), request.getPassword())));
  }

  @GetMapping("/albums/{id}/images")
  public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getAlbumImages(
      @PathVariable UUID id,
      @RequestParam(required = false) String accessToken) {
    var album = galleryService.getAlbumById(id, false);
    if (album.getIsPasswordProtected() && !galleryService.verifyGalleryAccess(id, accessToken)) {
      return ResponseEntity.status(401).body(ApiResponse.error("Password required"));
    }
    galleryService.incrementViewCount(id);
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getAlbumImages(id)));
  }

  @GetMapping("/share/{token}")
  public ResponseEntity<ApiResponse<GalleryAlbumDetailResponse>> accessViaShareLink(
      @PathVariable String token) {
    GalleryShareLink link = shareService.validateShareLink(token);
    shareService.recordShareLinkView(link);
    galleryService.incrementViewCount(link.getAlbum().getId());
    var album = galleryService.getAlbumById(link.getAlbum().getId(), true);
    return ResponseEntity.ok(ApiResponse.ok(album));
  }

  @PostMapping("/analytics/track")
  public ResponseEntity<ApiResponse<Void>> trackEvent(
      @Valid @RequestBody GalleryAnalyticsRequest request,
      HttpServletRequest httpRequest) {
    analyticsService.trackEvent(request, httpRequest);
    return ResponseEntity.ok(ApiResponse.ok("Tracked", null));
  }

  @GetMapping("/albums/{id}/zip")
  public ResponseEntity<byte[]> downloadAlbumZip(@PathVariable UUID id) {
    try {
      byte[] zipBytes = galleryService.generateAlbumZip(id);
      return ResponseEntity.ok()
          .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gallery-album-" + id + ".zip\"")
          .contentType(MediaType.APPLICATION_OCTET_STREAM)
          .body(zipBytes);
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(("Error generating ZIP: " + e.getMessage()).getBytes());
    }
  }

  @GetMapping("/settings")
  public ResponseEntity<ApiResponse<GallerySettingsResponse>> getGallerySettings() {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getGallerySettings()));
  }
}
