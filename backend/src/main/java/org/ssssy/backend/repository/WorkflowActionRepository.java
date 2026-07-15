package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.WorkflowAction;
import java.util.List;
import java.util.UUID;

public interface WorkflowActionRepository extends JpaRepository<WorkflowAction, UUID> {
  List<WorkflowAction> findByContentIdOrderByCreatedAtDesc(UUID contentId);
  List<WorkflowAction> findByWorkflowId(UUID workflowId);
  long countByContentId(UUID contentId);
}
