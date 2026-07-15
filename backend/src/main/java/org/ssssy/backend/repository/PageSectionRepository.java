package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.ssssy.backend.model.entity.PageSection;
import java.util.List;
import java.util.UUID;

public interface PageSectionRepository extends JpaRepository<PageSection, UUID> {
  List<PageSection> findByPageIdOrderBySortOrderAsc(UUID pageId);

  @Modifying
  @Query("DELETE FROM PageSection ps WHERE ps.page.id = :pageId")
  void deleteByPageId(UUID pageId);
}
