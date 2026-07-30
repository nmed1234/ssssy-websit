package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.FormSubmission;

import java.util.List;
import java.util.UUID;

public interface FormSubmissionRepository extends JpaRepository<FormSubmission, UUID> {

  Page<FormSubmission> findByFormIdOrderByCreatedAtDesc(UUID formId, Pageable pageable);

  long countByFormId(UUID formId);

  List<FormSubmission> findByFormIdAndStatus(UUID formId, String status);

  Page<FormSubmission> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
