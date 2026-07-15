package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContactSubmission;
import java.util.UUID;

public interface ContactSubmissionRepository extends JpaRepository<ContactSubmission, UUID> {
  Page<ContactSubmission> findAllByOrderByCreatedAtDesc(Pageable pageable);
  Page<ContactSubmission> findByIsReadFalseOrderByCreatedAtDesc(Pageable pageable);
  long countByIsReadFalse();
}
