package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.ssssy.backend.exception.InvalidFileException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.repository.MediaFileRepository;
import org.ssssy.backend.repository.MediaFolderRepository;
import org.ssssy.backend.service.MediaService;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Admin-scoped media library controller.
 *
 * Handles:
 *   /api/admin/media          — file upload (POST) and listing (GET)
 *   /api/admin/media/{id}     — metadata update (PATCH)
 *   /api/admin/media-folders  — folder CRUD
 *
 * The legacy /api/media endpoints (MediaController) are intentionally kept
 * unchanged; these admin endpoints are a separate surface.
 *
 * Requirements: 15.2–15.8, 16.2, 16.5–16.7, 17.1, 17.5, 17.6, 18.3, 18.5
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminMediaController {

  // Validation constants — mirror those in MediaService
  private static final long MAX_FILE_SIZE = 10_485_760L; // 10 MB
  private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
      "image/jpeg", "image/png", "image/gif", "image/webp"
  );

  private final MediaService mediaService;
  private final MediaFolderRepository mediaFolderRepository;
  private final MediaFileRepository mediaFileRepository;

  // ─────────────────────────────────────────────────────────────────────────
  // 14.1 — POST /api/admin/media
  // Upload up to 20 files; validate before storing; return list of responses.
  // Requirements: 15.3, 15.4, 15.5, 15.6, 17.1, 17.5, 17.6
  // ─────────────────────────────────────────────────────────────────────────

  @PostMapping("/media")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MediaFileResponse>>> uploadFiles(
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam(required = false) UUID folderId,
      @AuthenticationPrincipal UserDetails userDetails) {

    if (files == null || files.isEmpty()) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("No files provided"));
    }

    if (files.size() > 20) {
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("Maximum 20 files per request"));
    }

    UUID userId = UUID.fromString(userDetails.getUsername());

    // Validate ALL files before touching storage (fail-fast, no partial uploads)
    for (MultipartFile file : files) {
      String contentType = file.getContentType();
      if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
        throw new InvalidFileException("unsupported_type");
      }
      if (file.getSize() > MAX_FILE_SIZE) {
        throw new InvalidFileException("size_exceeded");
      }
    }

    // Upload each file through the service (MinIO-first, DB-second pipeline)
    List<MediaFileResponse> results = new ArrayList<>();
    for (MultipartFile file : files) {
      MediaFileRequest request = new MediaFileRequest();
      request.setFolderId(folderId);
      results.add(mediaService.uploadFile(file, request, userId));
    }

    return ResponseEntity.ok(ApiResponse.ok(results));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.2 — GET /api/admin/media
  // List / search files; supports folderId, search, page, size.
  // Requirements: 15.2, 15.7, 15.8
  // ─────────────────────────────────────────────────────────────────────────

  @GetMapping("/media")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<MediaFileResponse>>> listMedia(
      @RequestParam(required = false) UUID folderId,
      @RequestParam(required = false) String search,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "100") int size) {

    Page<MediaFileResponse> result;

    if (search != null && !search.isBlank()) {
      // FTS search via plainto_tsquery
      result = mediaService.search(search, folderId, page, size);
    } else {
      Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
      result = mediaService.getAllFiles(folderId, pageable);
    }

    return ResponseEntity.ok(ApiResponse.ok(result));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.3 — PATCH /api/admin/media/{id}
  // Update metadata; FTS index regenerated automatically by DB GENERATED column.
  // Requirements: 18.3, 18.5
  // ─────────────────────────────────────────────────────────────────────────

  @PatchMapping("/media/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFileResponse>> updateMetadata(
      @PathVariable UUID id,
      @RequestBody MediaMetadataUpdateRequest request) {

    MediaFileResponse updated = mediaService.updateMetadata(
        id,
        request.getAltTextEn(),
        request.getAltTextAr(),
        request.getCaptionEn(),
        request.getCaptionAr(),
        request.getTags(),
        request.getFolderId()
    );

    return ResponseEntity.ok(ApiResponse.ok(updated));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.4 — GET /api/admin/media-folders
  // Return recursive folder tree.
  // Requirements: 16.2
  // ─────────────────────────────────────────────────────────────────────────

  @GetMapping("/media-folders")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MediaFolderTreeNode>>> getFolderTree() {
    List<MediaFolderTreeNode> tree = buildFolderTree(null);
    return ResponseEntity.ok(ApiResponse.ok(tree));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.4 — POST /api/admin/media-folders
  // Create folder.
  // Requirements: 16.2
  // ─────────────────────────────────────────────────────────────────────────

  @PostMapping("/media-folders")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFolderResponse>> createFolder(
      @Valid @RequestBody MediaFolderRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {

    UUID userId = UUID.fromString(userDetails.getUsername());
    MediaFolderResponse folder = mediaService.createFolder(request, userId);
    return ResponseEntity.ok(ApiResponse.ok(folder));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.4 — PATCH /api/admin/media-folders/{id}
  // Rename folder.
  // Requirements: 16.5
  // ─────────────────────────────────────────────────────────────────────────

  @PatchMapping("/media-folders/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFolderResponse>> renameFolder(
      @PathVariable UUID id,
      @Valid @RequestBody MediaFolderRenameRequest request) {

    MediaFolderResponse folder = mediaService.renameFolder(id, request.getName());
    return ResponseEntity.ok(ApiResponse.ok(folder));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14.4 — DELETE /api/admin/media-folders/{id}
  // Detach all images in folder (folder_id = NULL), then delete folder row.
  // Auth: ADMIN only.
  // Requirements: 16.6, 16.7
  // ─────────────────────────────────────────────────────────────────────────

  @DeleteMapping("/media-folders/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable UUID id) {
    mediaService.deleteFolder(id);
    return ResponseEntity.ok(ApiResponse.ok("Folder deleted", null));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Recursively builds a folder tree starting from the given parentId.
   *
   * @param parentId null to start from root folders
   * @return list of tree nodes (each with fully populated children)
   */
  private List<MediaFolderTreeNode> buildFolderTree(UUID parentId) {
    List<org.ssssy.backend.model.entity.MediaFolder> folders;

    if (parentId == null) {
      folders = mediaFolderRepository.findByParentIsNullOrderByName();
    } else {
      folders = mediaFolderRepository.findByParentIdOrderByName(parentId);
    }

    List<MediaFolderTreeNode> nodes = new ArrayList<>();
    for (org.ssssy.backend.model.entity.MediaFolder folder : folders) {
      // Recursively populate children before constructing this node
      List<MediaFolderTreeNode> children = buildFolderTree(folder.getId());

      MediaFolderTreeNode node = MediaFolderTreeNode.builder()
          .id(folder.getId())
          .name(folder.getName())
          .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
          .fileCount(mediaFileRepository.countByFolderId(folder.getId()))
          .createdAt(folder.getCreatedAt())
          .children(children)
          .build();

      nodes.add(node);
    }
    return nodes;
  }
}
