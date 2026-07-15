package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.JobApplication;
import java.util.UUID;

public interface JobApplicationRepository extends JpaRepository<JobApplication, UUID> {
  Page<JobApplication> findByJobVacancyIdOrderByCreatedAtDesc(UUID jobVacancyId, Pageable pageable);
  Page<JobApplication> findByEmailOrderByCreatedAtDesc(String email, Pageable pageable);
  long countByJobVacancyId(UUID jobVacancyId);
}
