package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.WorkflowTransition;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowTransitionRepository extends JpaRepository<WorkflowTransition, UUID> {
  List<WorkflowTransition> findByWorkflowIdOrderBySortOrder(UUID workflowId);
  List<WorkflowTransition> findByFromStateId(UUID fromStateId);
  Optional<WorkflowTransition> findByWorkflowIdAndFromStateIdAndToStateId(UUID workflowId, UUID fromStateId, UUID toStateId);
  void deleteByWorkflowId(UUID workflowId);
}
