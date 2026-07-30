package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.ContentTypeDefinition;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContentTypeDefinitionRepository extends JpaRepository<ContentTypeDefinition, UUID> {

  Optional<ContentTypeDefinition> findByName(String name);

  boolean existsByName(String name);

  List<ContentTypeDefinition> findByIsActiveTrueOrderBySortOrderAsc();

  Page<ContentTypeDefinition> findAllByOrderBySortOrderAscCreatedAtDesc(Pageable pageable);

  @Query("SELECT c FROM ContentTypeDefinition c WHERE c.isActive = true " +
         "AND c.allowMemberSubmit = true ORDER BY c.sortOrder ASC")
  List<ContentTypeDefinition> findMemberSubmittableTypes();
}
