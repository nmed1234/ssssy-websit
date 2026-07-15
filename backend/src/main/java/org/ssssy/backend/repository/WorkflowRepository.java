package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.Workflow;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowRepository extends JpaRepository<Workflow, UUID> {
  Optional<Workflow> findByContentType(String contentType);
  List<Workflow> findByIsActiveTrue();
  boolean existsByContentType(String contentType);
}
