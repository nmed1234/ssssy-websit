package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.MediaFileRequest;
import org.ssssy.backend.model.dto.MediaFileResponse;
import org.ssssy.backend.model.dto.MediaFolderRequest;
import org.ssssy.backend.model.dto.MediaFolderResponse;
import org.ssssy.backend.model.entity.MediaFile;
import org.ssssy.backend.model.entity.MediaFolder;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.MediaFileRepository;
import org.ssssy.backend.repository.MediaFolderRepository;
import org.ssssy.backend.repository.UserRepository;
import org.ssssy.backend.storage.StorageService;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

  private static final long MAX_FILE_SIZE = 10_485_760L; // 10 MB
  private static final Set<String> IMAGE_MIME_TYPES = Set.of(
      "image/jpeg", "image/png", "image/gif", "image/webp"
  );

  private final MediaFileRepository mediaFileRepository;
  private final MediaFolderRepository mediaFolderRepository;
  private final UserRepository userRepository;
  private final StorageService storageService;

  // ─────────────────────────────────────────────────────────────────────────
  // File queries
  // ─────────────────────────────────────────────────────────────────────────

  public Page<MediaFileResponse> getAllFiles(UUID folderId, Pageable pageable) {
    Page<MediaFile> files;
    if (folderId != null) {
      files = mediaFileRepository.findByFolderId(folderId, pageable);
    } else {
      files = mediaFileRepository.findAll(pageable);
    }
    return files.map(this::toFileResponse);
  }

  public MediaFileResponse getFileById(UUID id) {
    MediaFile file = mediaFileRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("File not found: " + id));
    return toFileResponse(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FTS Search (7.2)
  // ─────────────────────────────────────────────────────────────────────────

  public Page<MediaFileResponse> search(String query, UUID folderId, int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<MediaFile> results;
    if (folderId != null) {
      results = mediaFileRepository.searchByFtsAndFolder(query, folderId, pageable);
    } else {
      results = mediaFileRepository.searchByFts(query, pageable);
    }
    return results.map(this::toFileResponse);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Metadata update (7.2)
  // ─────────────────────────────────────────────────────────────────────────

  @Transactional
  public MediaFileResponse updateMetadata(UUID id,
                                          String altTextEn, String altTextAr,
                                          String captionEn, String captionAr,
                                          String tags, UUID folderId) {
    MediaFile file = mediaFileRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("File not found: " + id));

    file.setAltTextEn(altTextEn);
    file.setAltTextAr(altTextAr);
    file.setCaptionEn(captionEn);
    file.setCaptionAr(captionAr);
    file.setTags(tags);

    if (folderId != null) {
      MediaFolder folder = mediaFolderRepository.findById(folderId)
          .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderId));
      file.setFolder(folder);
    } else {
      file.setFolder(null);
    }

    file = mediaFileRepository.save(file);
    return toFileResponse(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Upload pipeline (7.4)
  // ─────────────────────────────────────────────────────────────────────────

  @Transactional
  public MediaFileResponse uploadFile(MultipartFile multipartFile, MediaFileRequest request, UUID userId) {
    if (multipartFile.isEmpty()) {
      throw new BadRequestException("File is empty");
    }

    // 1. Validate MIME type
    String contentType = multipartFile.getContentType();
    if (contentType == null || !IMAGE_MIME_TYPES.contains(contentType)) {
      throw new BadRequestException("invalid_file_type");
    }

    // 2. Validate file size
    if (multipartFile.getSize() > MAX_FILE_SIZE) {
      throw new BadRequestException("file_size_exceeded");
    }

    // 3. Load user
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // 4. Build UUID-prefixed filename
    String originalFilename = multipartFile.getOriginalFilename();
    if (originalFilename == null || originalFilename.isBlank()) {
      originalFilename = "upload";
    }
    String uuidPrefix = UUID.randomUUID().toString();
    String uuidFilename = uuidPrefix + "-" + originalFilename;

    // 5. Compute extension (without dot for thumbnail format)
    String ext = "";
    int dotIdx = originalFilename.lastIndexOf('.');
    if (dotIdx >= 0) {
      ext = originalFilename.substring(dotIdx + 1).toLowerCase();
    }

    // 6. Read bytes for thumbnail
    byte[] fileBytes;
    try {
      fileBytes = multipartFile.getInputStream().readAllBytes();
    } catch (Exception e) {
      throw new RuntimeException("Failed to read uploaded file", e);
    }

    // 7. MinIO-first: upload original to originals/
    String originalObjectName = "originals/" + uuidFilename;
    String storagePath;
    try {
      storagePath = storageService.store(
          originalObjectName,
          new ByteArrayInputStream(fileBytes),
          fileBytes.length,
          contentType
      );
    } catch (Exception e) {
      throw new RuntimeException("Failed to store file in object storage", e);
    }

    String originalUrl = storageService.getUrl(storagePath);

    // 8. Generate thumbnail (best-effort)
    String thumbnailUrl = null;
    try {
      byte[] thumbBytes = generateThumbnail(fileBytes, contentType);

      // Thumbnail filename: {uuid}-{name_without_ext}_thumb.{ext}
      String nameWithoutExt = ext.isEmpty() ? originalFilename
          : originalFilename.substring(0, dotIdx);
      String thumbFilename = uuidPrefix + "-" + nameWithoutExt + "_thumb." + (ext.isEmpty() ? "jpg" : ext);
      String thumbObjectName = "thumbs/" + thumbFilename;

      String thumbStoragePath = storageService.store(
          thumbObjectName,
          new ByteArrayInputStream(thumbBytes),
          thumbBytes.length,
          contentType
      );
      thumbnailUrl = storageService.getUrl(thumbStoragePath);
    } catch (Exception e) {
      log.warn("Thumbnail generation/upload failed for {}: {}", uuidFilename, e.getMessage());
    }

    // 9. DB-second: persist after MinIO success
    MediaFile mediaFile = MediaFile.builder()
        .filename(originalObjectName)
        .originalFilename(originalFilename)
        .mimeType(contentType)
        .sizeBytes((long) fileBytes.length)
        .storagePath(storagePath)
        .url(originalUrl)
        .thumbnailUrl(thumbnailUrl)
        .width(null)
        .height(null)
        .altTextEn(request.getAltTextEn())
        .altTextAr(request.getAltTextAr())
        .captionEn(request.getCaptionEn())
        .captionAr(request.getCaptionAr())
        .tags(request.getTags())
        .uploaderId(userId)
        .user(user)
        .build();

    if (request.getFolderId() != null) {
      MediaFolder folder = mediaFolderRepository.findById(request.getFolderId())
          .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
      mediaFile.setFolder(folder);
    }

    mediaFile = mediaFileRepository.save(mediaFile);
    return toFileResponse(mediaFile);
  }

  @Transactional
  public List<MediaFileResponse> uploadMultipleFiles(List<MultipartFile> files, UUID folderId, UUID userId) {
    List<MediaFileResponse> results = new ArrayList<>();
    for (MultipartFile file : files) {
      MediaFileRequest request = new MediaFileRequest();
      request.setFolderId(folderId);
      results.add(uploadFile(file, request, userId));
    }
    return results;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Thumbnail generation (7.3)
  // ─────────────────────────────────────────────────────────────────────────

  public byte[] generateThumbnail(byte[] originalBytes, String mimeType) {
    String format;
    switch (mimeType) {
      case "image/jpeg" -> format = "jpg";
      case "image/png"  -> format = "png";
      case "image/gif"  -> format = "gif";
      default           -> format = "jpg"; // webp and other fallbacks
    }

    try {
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      Thumbnails.of(new ByteArrayInputStream(originalBytes))
          .size(300, 300)
          .crop(Positions.CENTER)
          .outputFormat(format)
          .toOutputStream(baos);
      return baos.toByteArray();
    } catch (Exception e) {
      throw new RuntimeException("Failed to generate thumbnail", e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // File delete / update
  // ─────────────────────────────────────────────────────────────────────────

  @Transactional
  public void deleteFile(UUID id) {
    MediaFile file = mediaFileRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("File not found: " + id));

    storageService.delete(file.getStoragePath());
    mediaFileRepository.deleteById(id);
  }

  @Transactional
  public MediaFileResponse updateFile(UUID id, MediaFileRequest request) {
    MediaFile file = mediaFileRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("File not found: " + id));

    file.setAltTextAr(request.getAltTextAr());
    file.setAltTextEn(request.getAltTextEn());
    file.setCaptionEn(request.getCaptionEn());
    file.setCaptionAr(request.getCaptionAr());
    file.setTags(request.getTags());

    if (request.getFolderId() != null) {
      MediaFolder folder = mediaFolderRepository.findById(request.getFolderId())
          .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
      file.setFolder(folder);
    } else {
      file.setFolder(null);
    }

    file = mediaFileRepository.save(file);
    return toFileResponse(file);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Folder management (7.1)
  // ─────────────────────────────────────────────────────────────────────────

  public List<MediaFolderResponse> getAllFolders() {
    return mediaFolderRepository.findByParentIsNullOrderByName().stream()
        .map(this::toFolderResponse)
        .collect(Collectors.toList());
  }

  /** DTO-based overload (used by controller). */
  @Transactional
  public MediaFolderResponse createFolder(MediaFolderRequest request, UUID userId) {
    return createFolder(request.getName(), request.getParentId(), userId);
  }

  /** Direct-parameter overload required by task 7.1. */
  @Transactional
  public MediaFolderResponse createFolder(String name, UUID parentId, UUID userId) {
    MediaFolder folder = MediaFolder.builder()
        .name(name)
        .build();

    if (parentId != null) {
      MediaFolder parent = mediaFolderRepository.findById(parentId)
          .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
      folder.setParent(parent);
    }

    if (userId != null) {
      User user = userRepository.findById(userId).orElse(null);
      folder.setUser(user);
    }

    folder = mediaFolderRepository.save(folder);
    return toFolderResponse(folder);
  }

  @Transactional
  public MediaFolderResponse renameFolder(UUID id, String name) {
    MediaFolder folder = mediaFolderRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + id));
    folder.setName(name);
    folder = mediaFolderRepository.save(folder);
    return toFolderResponse(folder);
  }

  @Transactional
  public void deleteFolder(UUID id) {
    if (!mediaFolderRepository.existsById(id)) {
      throw new ResourceNotFoundException("Folder not found: " + id);
    }
    // Detach all files in this folder before deleting the folder row
    mediaFileRepository.detachAllFromFolder(id);
    mediaFolderRepository.deleteById(id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mapping helpers
  // ─────────────────────────────────────────────────────────────────────────

  private MediaFileResponse toFileResponse(MediaFile file) {
    String uploaderDisplayName = null;
    if (file.getUploaderId() != null) {
      uploaderDisplayName = userRepository.findById(file.getUploaderId())
          .map(u -> u.getFirstNameEn() != null
              ? u.getFirstNameEn() + " " + u.getLastNameEn()
              : u.getUsername())
          .orElse(null);
    }

    return MediaFileResponse.builder()
        .id(file.getId())
        .filename(file.getFilename())
        .originalFilename(file.getOriginalFilename())
        .mimeType(file.getMimeType())
        .sizeBytes(file.getSizeBytes())
        .url(file.getUrl())
        .thumbnailUrl(file.getThumbnailUrl())
        .width(file.getWidth())
        .height(file.getHeight())
        .altTextAr(file.getAltTextAr())
        .altTextEn(file.getAltTextEn())
        .captionEn(file.getCaptionEn())
        .captionAr(file.getCaptionAr())
        .tags(file.getTags())
        .uploaderId(file.getUploaderId())
        .uploaderDisplayName(uploaderDisplayName)
        .folderId(file.getFolder() != null ? file.getFolder().getId() : null)
        .folderName(file.getFolder() != null ? file.getFolder().getName() : null)
        .userId(file.getUser() != null ? file.getUser().getId() : null)
        .userName(file.getUser() != null ? file.getUser().getUsername() : null)
        .createdAt(file.getCreatedAt())
        .build();
  }

  private MediaFolderResponse toFolderResponse(MediaFolder folder) {
    return MediaFolderResponse.builder()
        .id(folder.getId())
        .name(folder.getName())
        .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
        .fileCount(mediaFileRepository.countByFolderId(folder.getId()))
        .createdAt(folder.getCreatedAt())
        .build();
  }
}
