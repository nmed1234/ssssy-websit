package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.TagRequest;
import org.ssssy.backend.model.dto.TagResponse;
import org.ssssy.backend.service.TagService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

  private final TagService tagService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<TagResponse>>> getAllTags() {
    return ResponseEntity.ok(ApiResponse.ok(tagService.getAllTags()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<TagResponse>> getTagById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(tagService.getTagById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<TagResponse>> createTag(@Valid @RequestBody TagRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(tagService.createTag(request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<TagResponse>> updateTag(
      @PathVariable UUID id, @Valid @RequestBody TagRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(tagService.updateTag(id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable UUID id) {
    tagService.deleteTag(id);
    return ResponseEntity.ok(ApiResponse.ok("Tag deleted", null));
  }
}
