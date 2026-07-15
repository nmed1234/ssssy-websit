package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.service.ContentService;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

  private final ContentService contentService;

  @GetMapping("/content")
  public ResponseEntity<ApiResponse<Page<ContentResponse>>> getPublishedContent(
      @RequestParam(required = false) String contentType,
      @RequestParam(required = false) String categorySlug,
      @RequestParam(required = false) String tagSlug,
      @PageableDefault(size = 12, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    if (categorySlug != null) {
      return ResponseEntity.ok(ApiResponse.ok(
          contentService.getPublishedByCategory(categorySlug, pageable)));
    }
    if (contentType != null) {
      return ResponseEntity.ok(ApiResponse.ok(
          contentService.getPublishedByType(contentType, pageable)));
    }
    return ResponseEntity.ok(ApiResponse.ok(contentService.getPublishedContent(pageable)));
  }

  @GetMapping("/content/featured")
  public ResponseEntity<ApiResponse<List<ContentResponse>>> getFeaturedContent(
      @RequestParam(defaultValue = "6") int limit) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getFeaturedContent(limit)));
  }

  @GetMapping("/content/{slug}")
  public ResponseEntity<ApiResponse<ContentResponse>> getPublishedContentBySlug(
      @PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.getPublishedBySlug(slug)));
  }

  @GetMapping("/content/types/{contentType}")
  public ResponseEntity<ApiResponse<Page<ContentResponse>>> getContentByType(
      @PathVariable String contentType,
      @PageableDefault(size = 12, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(
        contentService.getPublishedByType(contentType, pageable)));
  }

  @GetMapping("/search")
  public ResponseEntity<ApiResponse<Page<ContentResponse>>> search(
      @RequestParam String q,
      @RequestParam(required = false) String contentType,
      @RequestParam(required = false) String categorySlug,
      @PageableDefault(size = 20) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.searchContent(q, pageable)));
  }

  @GetMapping("/search/suggestions")
  public ResponseEntity<ApiResponse<List<String>>> searchSuggestions(@RequestParam String q) {
    return ResponseEntity.ok(ApiResponse.ok(contentService.searchSuggestions(q)));
  }
}
