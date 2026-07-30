package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.FormDefinition;

import java.util.Optional;
import java.util.UUID;

public interface FormDefinitionRepository extends JpaRepository<FormDefinition, UUID> {

  Optional<FormDefinition> findBySlug(String slug);

  boolean existsBySlug(String slug);

  Page<FormDefinition> findAllByOrderByCreatedAtDesc(Pageable pageable);

  Page<FormDefinition> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
}
