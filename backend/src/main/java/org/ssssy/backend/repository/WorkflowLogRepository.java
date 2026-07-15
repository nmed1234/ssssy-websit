package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.WorkflowLog;
import java.util.List;
import java.util.UUID;

public interface WorkflowLogRepository extends JpaRepository<WorkflowLog, UUID> {
  List<WorkflowLog> findByContentIdOrderByCreatedAtDesc(UUID contentId);
  long countByContentId(UUID contentId);
}
