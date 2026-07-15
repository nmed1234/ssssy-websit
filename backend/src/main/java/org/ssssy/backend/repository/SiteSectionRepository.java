package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.SiteSection;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteSectionRepository extends JpaRepository<SiteSection, UUID> {

  List<SiteSection> findByIsActiveTrueOrderBySortOrderAsc();

  List<SiteSection> findByIsActiveTrueAndLocationOrderBySortOrderAsc(String location);

  List<SiteSection> findAllByOrderBySortOrderAsc();

  Optional<SiteSection> findBySlug(String slug);

  List<SiteSection> findByComponentType(String componentType);
}
