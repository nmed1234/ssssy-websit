package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.MenuItem;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
  List<MenuItem> findByMenuIdOrderBySortOrderAsc(UUID menuId);
  void deleteByMenuId(UUID menuId);

  /** Used by task 16.2 — find all menu items linked to a given page. */
  List<MenuItem> findByPageId(UUID pageId);

  /** Used by task 16.3 — find the existing menu item for a specific page+menu pair. */
  Optional<MenuItem> findByPageIdAndMenuId(UUID pageId, UUID menuId);

  /** Used by task 16.3 — determine the max sort_order in a menu for new item insertion. */
  @Query("SELECT COALESCE(MAX(i.sortOrder), 0) FROM MenuItem i WHERE i.menu.id = :menuId")
  int findMaxSortOrderByMenuId(@Param("menuId") UUID menuId);
}
