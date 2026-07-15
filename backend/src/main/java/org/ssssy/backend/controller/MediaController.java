package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import org.ssssy.backend.service.MediaService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

  private final MediaService mediaService;

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
