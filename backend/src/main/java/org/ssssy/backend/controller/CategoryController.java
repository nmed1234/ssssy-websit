package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.CategoryRequest;
import org.ssssy.backend.model.dto.CategoryResponse;
import org.ssssy.backend.service.CategoryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping
  public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
    return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
  }

  @PostMapping
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(categoryService.createCategory(request)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
      @PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(categoryService.updateCategory(id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
    categoryService.deleteCategory(id);
    return ResponseEntity.ok(ApiResponse.ok("Category deleted", null));
  }
}
