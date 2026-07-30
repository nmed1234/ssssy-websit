package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.MediaFile;
import org.ssssy.backend.repository.MediaFileRepository;
import org.ssssy.backend.storage.StorageService;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.UUID;

import org.ssssy.backend.service.MediaService;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;
  private final MediaFileRepository mediaFileRepository;
  private final StorageService storageService;

  @GetMapping("/files")
  public ResponseEntity<ApiResponse<Page<MediaFileResponse>>> getAllFiles(
      @RequestParam(required = false) UUID folderId,
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(mediaService.getAllFiles(folderId, pageable)));
  }

  @GetMapping("/files/{id}")
  public ResponseEntity<ApiResponse<MediaFileResponse>> getFileById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(mediaService.getFileById(id)));
  }

  @PostMapping("/files/upload")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFileResponse>> uploadFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam(required = false) UUID folderId,
      @RequestParam(required = false) String altTextAr,
      @RequestParam(required = false) String altTextEn,
      @AuthenticationPrincipal UserDetails userDetails) {

    MediaFileRequest request = new MediaFileRequest();
    request.setFolderId(folderId);
    request.setAltTextAr(altTextAr);
    request.setAltTextEn(altTextEn);

    return ResponseEntity.ok(ApiResponse.ok(
        mediaService.uploadFile(file, request, UUID.fromString(userDetails.getUsername()))));
  }

  @PostMapping("/files/upload-multiple")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MediaFileResponse>>> uploadMultipleFiles(
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam(required = false) UUID folderId,
      @AuthenticationPrincipal UserDetails userDetails) {

    return ResponseEntity.ok(ApiResponse.ok(
        mediaService.uploadMultipleFiles(files, folderId, UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/files/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFileResponse>> updateFile(
      @PathVariable UUID id, @Valid @RequestBody MediaFileRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(mediaService.updateFile(id, request)));
  }

  @DeleteMapping("/files/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable UUID id) {
    mediaService.deleteFile(id);
    return ResponseEntity.ok(ApiResponse.ok("File deleted", null));
  }

  /**
   * Public download endpoint for media files stored in local storage.
   *
   * <p>LocalStorageService.getUrl() returns "/api/media/files/{filename}/download"
   * (where {filename} is the UUID-prefixed filename, e.g. "uuid-document.pdf").
   * This endpoint is permitted without authentication in SecurityConfig so that
   * the Next.js pdf-proxy can fetch PDFs on behalf of unauthenticated visitors.</p>
   *
   * <p>Only application/pdf files are served.  All other MIME types return 403
   * to prevent inadvertent exposure of private image files via a guessed URL.</p>
   */
  @GetMapping("/files/{filename}/download")
  public void downloadFile(@PathVariable String filename, HttpServletResponse response)
      throws IOException {

    // Look up by the stored URL — LocalStorageService.getUrl() returns
    // "/api/media/files/{filename}/download" which is exactly what was persisted.
    String lookupUrl = "/api/media/files/" + filename + "/download";
    MediaFile file = mediaFileRepository.findByUrl(lookupUrl).orElse(null);
    if (file == null) {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      response.setContentType("text/plain;charset=UTF-8");
      response.getWriter().write("File not found");
      return;
    }

    // Only PDFs are served publicly — images remain protected by auth.
    if (!"application/pdf".equalsIgnoreCase(file.getMimeType())) {
      response.setStatus(HttpServletResponse.SC_FORBIDDEN);
      response.setContentType("text/plain;charset=UTF-8");
      response.getWriter().write("Only PDF files may be downloaded without authentication");
      return;
    }

    try (InputStream in = storageService.retrieve(file.getStoragePath());
         OutputStream out = response.getOutputStream()) {
      response.setStatus(HttpServletResponse.SC_OK);
      response.setContentType("application/pdf");
      response.setHeader("Content-Disposition", "inline; filename=\"" + file.getOriginalFilename() + "\"");
      response.setHeader("Cache-Control", "public, max-age=3600");
      if (file.getSizeBytes() != null) {
        response.setContentLengthLong(file.getSizeBytes());
      }
      in.transferTo(out);
    } catch (Exception e) {
      log.warn("Failed to stream media file {}: {}", filename, e.getMessage());
      if (!response.isCommitted()) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      }
    }
  }

  @GetMapping("/folders")
  public ResponseEntity<ApiResponse<List<MediaFolderResponse>>> getAllFolders() {
    return ResponseEntity.ok(ApiResponse.ok(mediaService.getAllFolders()));
  }

  @PostMapping("/folders")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MediaFolderResponse>> createFolder(
      @Valid @RequestBody MediaFolderRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        mediaService.createFolder(request, UUID.fromString(userDetails.getUsername()))));
  }

  @DeleteMapping("/folders/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteFolder(@PathVariable UUID id) {
    mediaService.deleteFolder(id);
    return ResponseEntity.ok(ApiResponse.ok("Folder deleted", null));
  }
}
