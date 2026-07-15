package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.JobApplicationRequest;
import org.ssssy.backend.model.dto.JobApplicationResponse;
import org.ssssy.backend.model.entity.JobApplication;
import org.ssssy.backend.model.entity.JobVacancy;
import org.ssssy.backend.repository.JobApplicationRepository;
import org.ssssy.backend.repository.JobVacancyRepository;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

  private final JobApplicationRepository jobApplicationRepository;
  private final JobVacancyRepository jobVacancyRepository;

  @Transactional
  public JobApplicationResponse apply(UUID jobVacancyId, JobApplicationRequest request) {
    JobVacancy vacancy = jobVacancyRepository.findById(jobVacancyId)
        .orElseThrow(() -> new ResourceNotFoundException("Job vacancy not found: " + jobVacancyId));
    if (!Boolean.TRUE.equals(vacancy.getIsPublished())) {
      throw new BadRequestException("This job vacancy is no longer accepting applications");
    }
    if (vacancy.getDeadline() != null && vacancy.getDeadline().isBefore(LocalDate.now())) {
      throw new BadRequestException("The application deadline for this vacancy has passed");
    }
    JobApplication application = JobApplication.builder()
        .jobVacancy(vacancy)
        .firstName(request.getFirstName())
        .lastName(request.getLastName())
        .email(request.getEmail())
        .phone(request.getPhone())
        .coverLetter(request.getCoverLetter())
        .build();
    application = jobApplicationRepository.save(application);
    return toResponse(application);
  }

  public Page<JobApplicationResponse> getApplicationsByVacancy(UUID jobVacancyId, Pageable pageable) {
    return jobApplicationRepository.findByJobVacancyIdOrderByCreatedAtDesc(jobVacancyId, pageable)
        .map(this::toResponse);
  }

  public Page<JobApplicationResponse> getApplicationsByEmail(String email, Pageable pageable) {
    return jobApplicationRepository.findByEmailOrderByCreatedAtDesc(email, pageable)
        .map(this::toResponse);
  }

  @Transactional
  public JobApplicationResponse updateApplicationStatus(UUID id, String status) {
    JobApplication application = jobApplicationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    application.setStatus(status);
    application = jobApplicationRepository.save(application);
    return toResponse(application);
  }

  private JobApplicationResponse toResponse(JobApplication application) {
    return JobApplicationResponse.builder()
        .id(application.getId())
        .jobVacancyId(application.getJobVacancy().getId())
        .jobVacancyTitle(application.getJobVacancy().getTitleEn())
        .firstName(application.getFirstName())
        .lastName(application.getLastName())
        .email(application.getEmail())
        .phone(application.getPhone())
        .coverLetter(application.getCoverLetter())
        .cvFilePath(application.getCvFilePath())
        .status(application.getStatus())
        .createdAt(application.getCreatedAt())
        .build();
  }
}
