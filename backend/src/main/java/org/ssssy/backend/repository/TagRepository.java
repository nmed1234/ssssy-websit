package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Tag;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

  boolean existsBySlug(String slug);
}
