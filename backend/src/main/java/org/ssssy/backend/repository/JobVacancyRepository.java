package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.JobVacancy;
import java.time.LocalDate;
import java.util.UUID;

public interface JobVacancyRepository extends JpaRepository<JobVacancy, UUID> {
  Page<JobVacancy> findByIsPublishedTrueOrderByCreatedAtDesc(Pageable pageable);
  Page<JobVacancy> findByIsPublishedTrueAndDeadlineAfterOrDeadlineIsNullOrderByCreatedAtDesc(LocalDate now, Pageable pageable);
  long countByIsPublishedTrue();
  boolean existsBySlug(String slug);
  boolean existsBySlugAndIdNot(String slug, UUID id);
  java.util.Optional<JobVacancy> findBySlug(String slug);
}
