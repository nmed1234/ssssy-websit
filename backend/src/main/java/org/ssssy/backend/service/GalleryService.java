package org.ssssy.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.UnauthorizedException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class GalleryService {

  private final GalleryAlbumRepository galleryAlbumRepository;
  private final GalleryImageRepository galleryImageRepository;
  private final MediaFileRepository mediaFileRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final GalleryAnalyticsEventRepository analyticsEventRepository;
  private final SystemConfigService systemConfigService;

  private static final String GALLERY_ACCESS_TOKEN_PREFIX = "gallery_access_";

  // ─── Albums ───────────────────────────────────────────────────────────────

  public List<GalleryAlbumResponse> getAllAlbums() {
    return galleryAlbumRepository.findAll(Sort.by(Sort.Direction.ASC, "sortOrder"))
        .stream().map(this::toAlbumResponse).collect(Collectors.toList());
  }

  public List<GalleryAlbumResponse> getPublishedAlbums() {
    return galleryAlbumRepository.findByIsPublishedTrue(
            Sort.by(Sort.Direction.ASC, "sortOrder"))
        .stream().map(this::toAlbumResponse).collect(Collectors.toList());
  }

  public GalleryAlbumDetailResponse getAlbumById(UUID id, boolean includeImages) {
    GalleryAlbum album = galleryAlbumRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + id));
    return toAlbumDetailResponse(album, includeImages);
  }

  public GalleryAlbumDetailResponse getAlbumBySlug(String slug, boolean includeImages) {
    GalleryAlbum album = galleryAlbumRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + slug));
    return toAlbumDetailResponse(album, includeImages);
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public GalleryAlbumResponse createAlbum(GalleryAlbumRequest request, UUID userId) {
    if (galleryAlbumRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Slug already exists: " + request.getSlug());
    }
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    GalleryAlbum album = GalleryAlbum.builder()
        .titleAr(request.getTitleAr())
        .titleEn(request.getTitleEn())
        .descriptionAr(request.getDescriptionAr())
        .descriptionEn(request.getDescriptionEn())
        .slug(request.getSlug())
        .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
        .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
        .isPasswordProtected(request.getIsPasswordProtected() != null ? request.getIsPasswordProtected() : false)
        .passwordHash(request.getPassword() != null && !request.getPassword().isEmpty()
            ? passwordEncoder.encode(request.getPassword()) : null)
        .watermarkOverrides(request.getWatermarkOverrides())
        .settingsOverrides(request.getSettingsOverrides())
        .viewCount(0)
        .downloadCount(0)
        .createdBy(user)
        .build();

    if (request.getCoverImageId() != null) {
      MediaFile cover = mediaFileRepository.findById(request.getCoverImageId())
          .orElseThrow(() -> new ResourceNotFoundException("Cover image not found"));
      album.setCoverImage(cover);
    }

    album = galleryAlbumRepository.save(album);
    return toAlbumResponse(album);
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public GalleryAlbumResponse updateAlbum(UUID id, GalleryAlbumRequest request) {
    GalleryAlbum album = galleryAlbumRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + id));

    if (request.getTitleAr() != null) album.setTitleAr(request.getTitleAr());
    if (request.getTitleEn() != null) album.setTitleEn(request.getTitleEn());
    if (request.getDescriptionAr() != null) album.setDescriptionAr(request.getDescriptionAr());
    if (request.getDescriptionEn() != null) album.setDescriptionEn(request.getDescriptionEn());
    if (request.getSlug() != null && !request.getSlug().equals(album.getSlug())) {
      if (galleryAlbumRepository.existsBySlug(request.getSlug())) {
        throw new BadRequestException("Slug already exists: " + request.getSlug());
      }
      album.setSlug(request.getSlug());
    }
    if (request.getIsPublished() != null) album.setIsPublished(request.getIsPublished());
    if (request.getSortOrder() != null) album.setSortOrder(request.getSortOrder());
    if (request.getIsPasswordProtected() != null) album.setIsPasswordProtected(request.getIsPasswordProtected());
    if (request.getPassword() != null && !request.getPassword().isEmpty()) {
      album.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    } else if (request.getIsPasswordProtected() != null && !request.getIsPasswordProtected()) {
      album.setPasswordHash(null);
    }
    if (request.getWatermarkOverrides() != null) album.setWatermarkOverrides(request.getWatermarkOverrides());
    if (request.getSettingsOverrides() != null) album.setSettingsOverrides(request.getSettingsOverrides());
    if (request.getCoverImageId() != null) {
      MediaFile cover = mediaFileRepository.findById(request.getCoverImageId())
          .orElseThrow(() -> new ResourceNotFoundException("Cover image not found"));
      album.setCoverImage(cover);
    }

    album = galleryAlbumRepository.save(album);
    return toAlbumResponse(album);
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public void deleteAlbum(UUID id) {
    if (!galleryAlbumRepository.existsById(id)) {
      throw new ResourceNotFoundException("Album not found: " + id);
    }
    galleryAlbumRepository.deleteById(id);
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  public List<GalleryImageResponse> getAlbumImages(UUID albumId) {
    return galleryImageRepository.findByAlbumIdOrderBySortOrderAsc(albumId)
        .stream().map(this::toImageResponse).collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public List<GalleryImageResponse> addImagesToAlbum(UUID albumId, List<UUID> mediaFileIds, String locale) {
    GalleryAlbum album = galleryAlbumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

    int currentCount = galleryImageRepository.countByAlbumId(albumId);
    List<GalleryImage> images = new ArrayList<>();

    for (int i = 0; i < mediaFileIds.size(); i++) {
      int idx = i;
      UUID fileId = mediaFileIds.get(i);
      MediaFile mediaFile = mediaFileRepository.findById(fileId)
          .orElseThrow(() -> new ResourceNotFoundException("Media file not found: " + fileId));

      GalleryImage image = GalleryImage.builder()
          .album(album)
          .mediaFile(mediaFile)
          .sortOrder(currentCount + idx)
          .build();
      images.add(image);
    }

    images = galleryImageRepository.saveAll(images);
    return images.stream().map(this::toImageResponse).collect(Collectors.toList());
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public GalleryImageResponse updateImage(UUID albumId, UUID imageId, Map<String, Object> updates) {
    GalleryImage image = galleryImageRepository.findById(imageId)
        .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));

    if (!image.getAlbum().getId().equals(albumId)) {
      throw new BadRequestException("Image does not belong to this album");
    }

    if (updates.containsKey("titleAr")) image.setTitleAr((String) updates.get("titleAr"));
    if (updates.containsKey("titleEn")) image.setTitleEn((String) updates.get("titleEn"));
    if (updates.containsKey("descriptionAr")) image.setDescriptionAr((String) updates.get("descriptionAr"));
    if (updates.containsKey("descriptionEn")) image.setDescriptionEn((String) updates.get("descriptionEn"));
    if (updates.containsKey("altText")) image.setAltText((String) updates.get("altText"));
    if (updates.containsKey("hotspotData")) image.setHotspotData(serializeJson(updates.get("hotspotData")));
    if (updates.containsKey("exifData")) image.setExifData(serializeJson(updates.get("exifData")));
    if (updates.containsKey("colorPalette")) image.setColorPalette(serializeJson(updates.get("colorPalette")));
    if (updates.containsKey("isCover")) image.setIsCover((Boolean) updates.get("isCover"));
    if (updates.containsKey("sortOrder")) image.setSortOrder((Integer) updates.get("sortOrder"));

    if (updates.containsKey("beforeMediaFileId") && updates.get("beforeMediaFileId") != null) {
      MediaFile beforeFile = mediaFileRepository.findById((UUID) updates.get("beforeMediaFileId"))
          .orElseThrow(() -> new ResourceNotFoundException("Before media file not found"));
      image.setBeforeMediaFile(beforeFile);
    }

    image = galleryImageRepository.save(image);
    return toImageResponse(image);
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public void removeImage(UUID albumId, UUID imageId) {
    GalleryImage image = galleryImageRepository.findById(imageId)
        .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imageId));
    if (!image.getAlbum().getId().equals(albumId)) {
      throw new BadRequestException("Image does not belong to this album");
    }
    galleryImageRepository.delete(image);
  }

  @Transactional
  @CacheEvict(value = "galleryCache", allEntries = true)
  public void reorderImages(UUID albumId, List<UUID> imageIds) {
    GalleryAlbum album = galleryAlbumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

    for (int i = 0; i < imageIds.size(); i++) {
      int idx = i;
      UUID imgId = imageIds.get(i);
      GalleryImage image = galleryImageRepository.findById(imgId)
          .orElseThrow(() -> new ResourceNotFoundException("Image not found: " + imgId));
      if (!image.getAlbum().getId().equals(albumId)) {
        throw new BadRequestException("Image " + imgId + " does not belong to this album");
      }
      image.setSortOrder(idx);
      galleryImageRepository.save(image);
    }
  }

  // ─── Password Auth ────────────────────────────────────────────────────────

  public GalleryPasswordAuthResponse authenticateAlbum(UUID albumId, String password) {
    GalleryAlbum album = galleryAlbumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

    if (!album.getIsPasswordProtected() || album.getPasswordHash() == null) {
      throw new BadRequestException("Album is not password protected");
    }

    if (!passwordEncoder.matches(password, album.getPasswordHash())) {
      throw new UnauthorizedException("Invalid password");
    }

    String accessToken = UUID.randomUUID().toString();
    return GalleryPasswordAuthResponse.builder()
        .accessToken(accessToken)
        .authenticated(true)
        .build();
  }

  public boolean verifyGalleryAccess(UUID albumId, String accessToken) {
    if (accessToken == null || accessToken.isEmpty()) return false;
    GalleryAlbum album = galleryAlbumRepository.findById(albumId).orElse(null);
    if (album == null) return false;
    return !album.getIsPasswordProtected() || album.getPasswordHash() == null;
  }

  // ─── ZIP Download ─────────────────────────────────────────────────────────

  public byte[] generateAlbumZip(UUID albumId) throws IOException {
    GalleryAlbum album = galleryAlbumRepository.findById(albumId)
        .orElseThrow(() -> new ResourceNotFoundException("Album not found: " + albumId));

    List<GalleryImage> images = galleryImageRepository.findByAlbumIdOrderBySortOrderAsc(albumId);

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    try (ZipOutputStream zos = new ZipOutputStream(baos)) {
      for (int i = 0; i < images.size(); i++) {
        GalleryImage image = images.get(i);
        MediaFile mf = image.getMediaFile();

        String ext = "";
        if (mf.getOriginalFilename() != null && mf.getOriginalFilename().contains(".")) {
          ext = mf.getOriginalFilename().substring(mf.getOriginalFilename().lastIndexOf("."));
        }
        String entryName = String.format("%02d_%s%s", i + 1,
            mf.getOriginalFilename() != null
                ? mf.getOriginalFilename().replaceAll("\\.[^.]*$", "")
                : "image_" + i,
            ext);

        zos.putNextEntry(new ZipEntry(entryName));
        byte[] imageBytes = downloadImageBytes(mf.getUrl());
        zos.write(imageBytes);
        zos.closeEntry();
      }
    }

    album.setDownloadCount(album.getDownloadCount() + 1);
    galleryAlbumRepository.save(album);

    return baos.toByteArray();
  }

  // ─── Analytics helpers ────────────────────────────────────────────────────

  @Transactional
  public GalleryAnalyticsSummaryResponse getAnalyticsSummary(UUID albumId) {
    long views = analyticsEventRepository.countByAlbumIdAndEventType(albumId, "VIEW");
    long downloads = analyticsEventRepository.countByAlbumIdAndEventType(albumId, "DOWNLOAD");
    long shares = analyticsEventRepository.countByAlbumIdAndEventType(albumId, "SHARE");
    long prints = analyticsEventRepository.countByAlbumIdAndEventType(albumId, "PRINT");

    List<Object[]> raw = analyticsEventRepository.countByAlbumIdGroupByEventType(albumId);
    Map<String, Long> breakdown = new HashMap<>();
    for (Object[] row : raw) {
      breakdown.put((String) row[0], (Long) row[1]);
    }

    LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
    List<Object[]> dailyViewsRaw = analyticsEventRepository
        .countByAlbumIdAndEventTypeGroupByDay(albumId, "VIEW");
    Map<String, Long> dailyViews = new LinkedHashMap<>();
    for (Object[] row : dailyViewsRaw) {
      dailyViews.put(String.valueOf(row[0]), (Long) row[1]);
    }

    return GalleryAnalyticsSummaryResponse.builder()
        .totalViews(views)
        .totalDownloads(downloads)
        .totalShares(shares)
        .totalPrints(prints)
        .eventTypeBreakdown(breakdown)
        .dailyViews(dailyViews)
        .build();
  }

  @Transactional
  public void incrementViewCount(UUID albumId) {
    galleryAlbumRepository.findById(albumId).ifPresent(album -> {
      album.setViewCount(album.getViewCount() + 1);
      galleryAlbumRepository.save(album);
    });
  }

  // ─── Export CSV ───────────────────────────────────────────────────────────

  public byte[] exportAnalyticsCsv(UUID albumId) {
    List<GalleryAnalyticsEvent> events = analyticsEventRepository
        .findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime.now().minusDays(90), LocalDateTime.now());

    if (albumId != null) {
      events = events.stream()
          .filter(e -> e.getAlbum() != null && e.getAlbum().getId().equals(albumId))
          .collect(Collectors.toList());
    }

    StringBuilder csv = new StringBuilder();
    csv.append("ID,Album ID,Event Type,IP Address,Session ID,Created At\n");
    for (GalleryAnalyticsEvent event : events) {
      csv.append(event.getId()).append(",");
      csv.append(event.getAlbum() != null ? event.getAlbum().getId() : "").append(",");
      csv.append(event.getEventType()).append(",");
      csv.append(event.getIpAddress() != null ? event.getIpAddress() : "").append(",");
      csv.append(event.getSessionId() != null ? event.getSessionId() : "").append(",");
      csv.append(event.getCreatedAt()).append("\n");
    }
    return csv.toString().getBytes();
  }

  // ─── Gallery settings ─────────────────────────────────────────────────────

  public GallerySettingsResponse getGallerySettings() {
    try {
      var config = systemConfigService.getConfig("gallery_settings");
      return GallerySettingsResponse.builder()
          .settings(config.getConfigValue())
          .build();
    } catch (ResourceNotFoundException e) {
      return GallerySettingsResponse.builder()
          .settings("{}")
          .build();
    }
  }

  // ─── Mappers ──────────────────────────────────────────────────────────────

  private GalleryAlbumResponse toAlbumResponse(GalleryAlbum album) {
    int imageCount = (int) galleryImageRepository.countByAlbumId(album.getId());
    return GalleryAlbumResponse.builder()
        .id(album.getId())
        .titleAr(album.getTitleAr())
        .titleEn(album.getTitleEn())
        .descriptionAr(album.getDescriptionAr())
        .descriptionEn(album.getDescriptionEn())
        .slug(album.getSlug())
        .coverImageUrl(album.getCoverImage() != null ? album.getCoverImage().getUrl() : null)
        .coverImageThumbnailUrl(album.getCoverImage() != null ? album.getCoverImage().getThumbnailUrl() : null)
        .isPublished(album.getIsPublished())
        .sortOrder(album.getSortOrder())
        .isPasswordProtected(album.getIsPasswordProtected())
        .viewCount(album.getViewCount())
        .downloadCount(album.getDownloadCount())
        .watermarkOverrides(album.getWatermarkOverrides())
        .settingsOverrides(album.getSettingsOverrides())
        .createdByName(album.getCreatedBy().getFirstNameEn() + " " + album.getCreatedBy().getLastNameEn())
        .imageCount(imageCount)
        .createdAt(album.getCreatedAt())
        .updatedAt(album.getUpdatedAt())
        .build();
  }

  private GalleryAlbumDetailResponse toAlbumDetailResponse(GalleryAlbum album, boolean includeImages) {
    List<GalleryImageResponse> images = includeImages
        ? getAlbumImages(album.getId())
        : List.of();

    int imageCount = images.size();
    return GalleryAlbumDetailResponse.builder()
        .id(album.getId())
        .titleAr(album.getTitleAr())
        .titleEn(album.getTitleEn())
        .descriptionAr(album.getDescriptionAr())
        .descriptionEn(album.getDescriptionEn())
        .slug(album.getSlug())
        .coverImageUrl(album.getCoverImage() != null ? album.getCoverImage().getUrl() : null)
        .coverImageThumbnailUrl(album.getCoverImage() != null ? album.getCoverImage().getThumbnailUrl() : null)
        .isPublished(album.getIsPublished())
        .isPasswordProtected(album.getIsPasswordProtected())
        .viewCount(album.getViewCount())
        .downloadCount(album.getDownloadCount())
        .watermarkOverrides(album.getWatermarkOverrides())
        .settingsOverrides(album.getSettingsOverrides())
        .createdByName(album.getCreatedBy().getFirstNameEn() + " " + album.getCreatedBy().getLastNameEn())
        .imageCount(imageCount)
        .images(images)
        .createdAt(album.getCreatedAt())
        .updatedAt(album.getUpdatedAt())
        .build();
  }

  private GalleryImageResponse toImageResponse(GalleryImage image) {
    MediaFile mf = image.getMediaFile();
    MediaFile beforeMf = image.getBeforeMediaFile();
    return GalleryImageResponse.builder()
        .id(image.getId())
        .albumId(image.getAlbum().getId())
        .mediaFileId(mf.getId())
        .url(mf.getUrl())
        .thumbnailUrl(mf.getThumbnailUrl())
        .beforeUrl(beforeMf != null ? beforeMf.getUrl() : null)
        .beforeThumbnailUrl(beforeMf != null ? beforeMf.getThumbnailUrl() : null)
        .sortOrder(image.getSortOrder())
        .titleAr(image.getTitleAr())
        .titleEn(image.getTitleEn())
        .descriptionAr(image.getDescriptionAr())
        .descriptionEn(image.getDescriptionEn())
        .altText(image.getAltText())
        .hotspotData(image.getHotspotData())
        .exifData(image.getExifData())
        .colorPalette(image.getColorPalette())
        .isCover(image.getIsCover())
        .mimeType(mf.getMimeType())
        .width(mf.getWidth())
        .height(mf.getHeight())
        .createdAt(image.getCreatedAt())
        .build();
  }

  private byte[] downloadImageBytes(String urlStr) throws IOException {
    if (urlStr == null || urlStr.isEmpty()) return new byte[0];
    URL url = new URL(urlStr.startsWith("http") ? urlStr : "http://localhost:8080" + urlStr);
    URLConnection conn = url.openConnection();
    conn.setConnectTimeout(5000);
    conn.setReadTimeout(10000);
    try (InputStream is = conn.getInputStream()) {
      return is.readAllBytes();
    }
  }

  private String serializeJson(Object obj) {
    if (obj == null) return null;
    if (obj instanceof String) return (String) obj;
    try {
      return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(obj);
    } catch (Exception e) {
      return obj.toString();
    }
  }
}
