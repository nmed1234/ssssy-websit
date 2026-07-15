package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.CategoryRequest;
import org.ssssy.backend.model.dto.CategoryResponse;
import org.ssssy.backend.model.entity.Category;
import org.ssssy.backend.repository.CategoryRepository;
import org.ssssy.backend.repository.ContentItemRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

  private final CategoryRepository categoryRepository;
  private final ContentItemRepository contentItemRepository;

  public List<CategoryResponse> getAllCategories() {
    return categoryRepository.findByParentIsNullOrderBySortOrder().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public CategoryResponse getCategoryById(UUID id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    return toResponse(category);
  }

  @Transactional
  public CategoryResponse createCategory(CategoryRequest request) {
    if (categoryRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Slug already exists");
    }

    Category category = Category.builder()
        .nameAr(request.getNameAr())
        .nameEn(request.getNameEn())
        .slug(request.getSlug())
        .description(request.getDescription())
        .sortOrder(request.getSortOrder())
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .build();

    if (request.getParentId() != null) {
      Category parent = categoryRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
      category.setParent(parent);
    }

    category = categoryRepository.save(category);
    return toResponse(category);
  }

  @Transactional
  public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

    category.setNameAr(request.getNameAr());
    category.setNameEn(request.getNameEn());
    category.setSlug(request.getSlug());
    category.setDescription(request.getDescription());
    category.setSortOrder(request.getSortOrder());
    if (request.getIsActive() != null) category.setIsActive(request.getIsActive());

    if (request.getParentId() != null) {
      Category parent = categoryRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
      category.setParent(parent);
    } else {
      category.setParent(null);
    }

    category = categoryRepository.save(category);
    return toResponse(category);
  }

  @Transactional
  public void deleteCategory(UUID id) {
    if (!categoryRepository.existsById(id)) {
      throw new ResourceNotFoundException("Category not found: " + id);
    }
    categoryRepository.deleteById(id);
  }

  private CategoryResponse toResponse(Category category) {
    return CategoryResponse.builder()
        .id(category.getId())
        .nameAr(category.getNameAr())
        .nameEn(category.getNameEn())
        .slug(category.getSlug())
        .description(category.getDescription())
        .parentId(category.getParent() != null ? category.getParent().getId() : null)
        .parentName(category.getParent() != null ? category.getParent().getNameAr() : null)
        .sortOrder(category.getSortOrder())
        .isActive(category.getIsActive())
        .createdAt(category.getCreatedAt())
        .build();
  }
}
