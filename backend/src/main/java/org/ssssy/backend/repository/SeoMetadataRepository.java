package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.SeoMetadata;
import java.util.Optional;
import java.util.UUID;

public interface SeoMetadataRepository extends JpaRepository<SeoMetadata, UUID> {
  Optional<SeoMetadata> findByEntityTypeAndEntityId(String entityType, UUID entityId);
}
