package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.SiteSectionVersion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteSectionVersionRepository extends JpaRepository<SiteSectionVersion, UUID> {

  List<SiteSectionVersion> findBySectionIdOrderByVersionNumberDesc(UUID sectionId);

  Optional<SiteSectionVersion> findBySectionIdAndVersionNumber(UUID sectionId, int versionNumber);

  @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM SiteSectionVersion v WHERE v.sectionId = :sectionId")
  int findMaxVersionNumber(@Param("sectionId") UUID sectionId);
}
