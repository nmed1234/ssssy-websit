package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.GalleryAiService;
import org.ssssy.backend.service.GalleryService;
import org.ssssy.backend.service.GalleryShareService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/gallery")
@RequiredArgsConstructor
public class AdminGalleryController {

  private final GalleryService galleryService;
  private final GalleryShareService shareService;
  private final GalleryAiService galleryAiService;

  // ─── Albums ───────────────────────────────────────────────────────────────

  @GetMapping("/albums")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<GalleryAlbumResponse>>> getAllAlbums() {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getAllAlbums()));
  }

  @GetMapping("/albums/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAlbumDetailResponse>> getAlbumById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getAlbumById(id, true)));
  }

  @PostMapping("/albums")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAlbumResponse>> createAlbum(
      @Valid @RequestBody GalleryAlbumRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        galleryService.createAlbum(request, UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/albums/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAlbumResponse>> updateAlbum(
      @PathVariable UUID id, @Valid @RequestBody GalleryAlbumRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.updateAlbum(id, request)));
  }

  @DeleteMapping("/albums/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteAlbum(@PathVariable UUID id) {
    galleryService.deleteAlbum(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Album deleted successfully")));
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  @GetMapping("/albums/{id}/images")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> getAlbumImages(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.getAlbumImages(id)));
  }

  @PostMapping("/albums/{id}/images")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<GalleryImageResponse>>> addImages(
      @PathVariable UUID id, @RequestBody Map<String, List<UUID>> body) {
    List<UUID> mediaFileIds = body.get("mediaFileIds");
    if (mediaFileIds == null || mediaFileIds.isEmpty()) {
      return ResponseEntity.badRequest().body(ApiResponse.error("mediaFileIds is required"));
    }
    return ResponseEntity.ok(ApiResponse.ok(galleryService.addImagesToAlbum(id, mediaFileIds, "en")));
  }

  @PutMapping("/albums/{albumId}/images/{imageId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryImageResponse>> updateImage(
      @PathVariable UUID albumId, @PathVariable UUID imageId,
      @RequestBody Map<String, Object> updates) {
    return ResponseEntity.ok(ApiResponse.ok(galleryService.updateImage(albumId, imageId, updates)));
  }

  @DeleteMapping("/albums/{albumId}/images/{imageId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> removeImage(
      @PathVariable UUID albumId, @PathVariable UUID imageId) {
    galleryService.removeImage(albumId, imageId);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Image removed")));
  }

  @PutMapping("/albums/{id}/images/reorder")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> reorderImages(
      @PathVariable UUID id, @Valid @RequestBody GalleryImageReorderRequest request) {
    galleryService.reorderImages(id, request.getImageIds());
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Images reordered")));
  }

  // ─── Share Links ──────────────────────────────────────────────────────────

  @PostMapping("/share-links")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryShareLinkResponse>> createShareLink(
      @Valid @RequestBody GalleryShareLinkRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        shareService.createShareLink(request, UUID.fromString(userDetails.getUsername()))));
  }

  @GetMapping("/share-links")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<GalleryShareLinkResponse>>> getShareLinks(
      @RequestParam(required = false) UUID albumId) {
    if (albumId != null) {
      return ResponseEntity.ok(ApiResponse.ok(shareService.getShareLinks(albumId)));
    }
    return ResponseEntity.ok(ApiResponse.ok(List.of()));
  }

  @DeleteMapping("/share-links/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteShareLink(@PathVariable UUID id) {
    shareService.deleteShareLink(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Share link deleted")));
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  @GetMapping("/analytics/summary")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAnalyticsSummaryResponse>> getAnalyticsSummary(
      @RequestParam(required = false) UUID albumId) {
    if (albumId != null) {
      return ResponseEntity.ok(ApiResponse.ok(galleryService.getAnalyticsSummary(albumId)));
    }
    return ResponseEntity.ok(ApiResponse.ok(GalleryAnalyticsSummaryResponse.builder()
        .totalViews(0).totalDownloads(0).totalShares(0).totalPrints(0).build()));
  }

  @GetMapping("/analytics/export")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<byte[]> exportAnalyticsCsv(
      @RequestParam(required = false) UUID albumId) {
    byte[] csv = galleryService.exportAnalyticsCsv(albumId);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gallery-analytics.csv\"")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(csv);
  }

  // ─── AI Features ──────────────────────────────────────────────────────────

  @PostMapping("/ai/alt-text")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAiResponse>> generateAltText(
      @Valid @RequestBody GalleryAiRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(galleryAiService.generateAltText(request)));
  }

  @PostMapping("/ai/auto-tag")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAiResponse>> generateTags(
      @Valid @RequestBody GalleryAiRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(galleryAiService.generateTags(request)));
  }

  @PostMapping("/ai/smart-crop")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<GalleryAiResponse>> smartCrop(
      @Valid @RequestBody GalleryAiRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(galleryAiService.smartCrop(request)));
  }
}
