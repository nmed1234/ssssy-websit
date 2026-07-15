package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.WorkflowState;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowStateRepository extends JpaRepository<WorkflowState, UUID> {
  List<WorkflowState> findByWorkflowIdOrderBySortOrder(UUID workflowId);
  Optional<WorkflowState> findByWorkflowIdAndName(UUID workflowId, String name);
  Optional<WorkflowState> findByWorkflowIdAndIsInitialTrue(UUID workflowId);
  void deleteByWorkflowId(UUID workflowId);
}
