package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ComponentTemplate;
import java.util.List;
import java.util.UUID;

public interface ComponentTemplateRepository extends JpaRepository<ComponentTemplate, UUID> {
  List<ComponentTemplate> findByCategoryOrderBySortOrder(String category);
  List<ComponentTemplate> findAllByOrderBySortOrder();
  List<ComponentTemplate> findByIsSystemTrueOrderBySortOrder();
}
