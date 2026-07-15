package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Category;
import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

  List<Category> findByParentIsNullOrderBySortOrder();

  List<Category> findByParentIdOrderBySortOrder(UUID parentId);

  boolean existsBySlug(String slug);
}
