package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContentVersion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentVersionRepository extends JpaRepository<ContentVersion, UUID> {

  List<ContentVersion> findByContentIdOrderByVersionDesc(UUID contentId);

  int countByContentId(UUID contentId);

  Optional<ContentVersion> findByContentIdAndVersion(UUID contentId, Integer version);
}
