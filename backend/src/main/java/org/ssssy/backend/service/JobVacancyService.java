package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.JobVacancyRequest;
import org.ssssy.backend.model.dto.JobVacancyResponse;
import org.ssssy.backend.model.entity.JobVacancy;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.JobVacancyRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobVacancyService {

  private final JobVacancyRepository jobVacancyRepository;
  private final UserRepository userRepository;

  public Page<JobVacancyResponse> getPublishedVacancies(Pageable pageable) {
    return jobVacancyRepository
        .findByIsPublishedTrueAndDeadlineAfterOrDeadlineIsNullOrderByCreatedAtDesc(LocalDate.now(), pageable)
        .map(this::toResponse);
  }

  public JobVacancyResponse getVacancy(UUID id) {
    JobVacancy vacancy = jobVacancyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found: " + id));
    return toResponse(vacancy);
  }

  public JobVacancyResponse getVacancyBySlug(String slug) {
    JobVacancy vacancy = jobVacancyRepository.findBySlug(slug)
        .filter(JobVacancy::getIsPublished)
        .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found: " + slug));
    return toResponse(vacancy);
  }

  public Page<JobVacancyResponse> getAllVacancies(Pageable pageable) {
    return jobVacancyRepository.findAll(pageable).map(this::toResponse);
  }

  @Transactional
  public JobVacancyResponse createVacancy(JobVacancyRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    if (jobVacancyRepository.existsBySlug(request.getSlug())) {
      throw new org.ssssy.backend.exception.BadRequestException("Slug already in use");
    }
    JobVacancy vacancy = JobVacancy.builder()
        .titleAr(request.getTitleAr())
        .titleEn(request.getTitleEn())
        .slug(request.getSlug())
        .description(request.getDescription())
        .requirements(request.getRequirements())
        .location(request.getLocation())
        .jobType(request.getJobType())
        .department(request.getDepartment())
        .deadline(request.getDeadline())
        .isPublished(request.getIsPublished() != null && request.getIsPublished())
        .createdBy(user)
        .build();
    vacancy = jobVacancyRepository.save(vacancy);
    return toResponse(vacancy);
  }

  @Transactional
  public JobVacancyResponse updateVacancy(UUID id, JobVacancyRequest request) {
    JobVacancy vacancy = jobVacancyRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found: " + id));
    vacancy.setTitleAr(request.getTitleAr());
    vacancy.setTitleEn(request.getTitleEn());
    vacancy.setSlug(request.getSlug());
    vacancy.setDescription(request.getDescription());
    vacancy.setRequirements(request.getRequirements());
    vacancy.setLocation(request.getLocation());
    vacancy.setJobType(request.getJobType());
    vacancy.setDepartment(request.getDepartment());
    vacancy.setDeadline(request.getDeadline());
    vacancy.setIsPublished(request.getIsPublished());
    vacancy = jobVacancyRepository.save(vacancy);
    return toResponse(vacancy);
  }

  @Transactional
  public void deleteVacancy(UUID id) {
    if (!jobVacancyRepository.existsById(id)) {
      throw new ResourceNotFoundException("Job vacancy not found: " + id);
    }
    jobVacancyRepository.deleteById(id);
  }

  private JobVacancyResponse toResponse(JobVacancy vacancy) {
    return JobVacancyResponse.builder()
        .id(vacancy.getId())
        .titleAr(vacancy.getTitleAr())
        .titleEn(vacancy.getTitleEn())
        .slug(vacancy.getSlug())
        .description(vacancy.getDescription())
        .requirements(vacancy.getRequirements())
        .location(vacancy.getLocation())
        .jobType(vacancy.getJobType())
        .department(vacancy.getDepartment())
        .deadline(vacancy.getDeadline())
        .isPublished(vacancy.getIsPublished())
        .createdByName(vacancy.getCreatedBy().getFirstNameEn() + " " + vacancy.getCreatedBy().getLastNameEn())
        .createdAt(vacancy.getCreatedAt())
        .updatedAt(vacancy.getUpdatedAt())
        .build();
  }
}
