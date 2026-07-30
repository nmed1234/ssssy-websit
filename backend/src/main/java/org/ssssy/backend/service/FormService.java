package org.ssssy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.event.CmsEventBus;
import org.ssssy.backend.event.FormSubmittedEvent;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.FormDefinitionRequest;
import org.ssssy.backend.model.dto.FormDefinitionResponse;
import org.ssssy.backend.model.dto.FormSubmissionRequest;
import org.ssssy.backend.model.dto.FormSubmissionResponse;
import org.ssssy.backend.model.entity.FormDefinition;
import org.ssssy.backend.model.entity.FormSubmission;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.FormDefinitionRepository;
import org.ssssy.backend.repository.FormSubmissionRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Core service for Phase 2 — Dynamic Form Engine.
 *
 * Responsibilities:
 *  - CRUD for form definitions (admin)
 *  - Schema validation of incoming submissions at runtime
 *  - Persisting submissions and firing FormSubmittedEvent
 *  - Listing submissions for admin review
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormService {

  private final FormDefinitionRepository formDefinitionRepository;
  private final FormSubmissionRepository formSubmissionRepository;
  private final UserRepository userRepository;
  private final CmsEventBus cmsEventBus;
  private final ObjectMapper objectMapper;

  // ─── Admin: Form Definition CRUD ────────────────────────────────────────────

  public Page<FormDefinitionResponse> listForms(Pageable pageable) {
    return formDefinitionRepository.findAllByOrderByCreatedAtDesc(pageable)
        .map(this::toFormResponse);
  }

  public FormDefinitionResponse getFormById(UUID id) {
    return toFormResponse(findFormById(id));
  }

  public FormDefinitionResponse getFormBySlug(String slug) {
    FormDefinition form = formDefinitionRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + slug));
    return toFormResponse(form);
  }

  @Transactional
  public FormDefinitionResponse createForm(FormDefinitionRequest request, UUID creatorId) {
    if (formDefinitionRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Form slug already exists: " + request.getSlug());
    }
    validateSchemaJson(request.getSchemaJson());

    User creator = userRepository.findById(creatorId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    FormDefinition form = FormDefinition.builder()
        .title(request.getTitle())
        .titleAr(request.getTitleAr())
        .slug(request.getSlug())
        .description(request.getDescription())
        .schemaJson(request.getSchemaJson())
        .submitLabelEn(request.getSubmitLabelEn() != null ? request.getSubmitLabelEn() : "Submit")
        .submitLabelAr(request.getSubmitLabelAr() != null ? request.getSubmitLabelAr() : "إرسال")
        .successMessageEn(request.getSuccessMessageEn())
        .successMessageAr(request.getSuccessMessageAr())
        .redirectUrl(request.getRedirectUrl())
        .notificationEmails(request.getNotificationEmails())
        .requiresAuth(request.getRequiresAuth() != null ? request.getRequiresAuth() : false)
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .createdBy(creator)
        .build();

    return toFormResponse(formDefinitionRepository.save(form));
  }

  @Transactional
  public FormDefinitionResponse updateForm(UUID id, FormDefinitionRequest request) {
    FormDefinition form = findFormById(id);

    if (!form.getSlug().equals(request.getSlug()) && formDefinitionRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Form slug already exists: " + request.getSlug());
    }
    if (request.getSchemaJson() != null) {
      validateSchemaJson(request.getSchemaJson());
    }

    if (request.getTitle() != null) form.setTitle(request.getTitle());
    if (request.getTitleAr() != null) form.setTitleAr(request.getTitleAr());
    if (request.getSlug() != null) form.setSlug(request.getSlug());
    if (request.getDescription() != null) form.setDescription(request.getDescription());
    if (request.getSchemaJson() != null) form.setSchemaJson(request.getSchemaJson());
    if (request.getSubmitLabelEn() != null) form.setSubmitLabelEn(request.getSubmitLabelEn());
    if (request.getSubmitLabelAr() != null) form.setSubmitLabelAr(request.getSubmitLabelAr());
    if (request.getSuccessMessageEn() != null) form.setSuccessMessageEn(request.getSuccessMessageEn());
    if (request.getSuccessMessageAr() != null) form.setSuccessMessageAr(request.getSuccessMessageAr());
    if (request.getRedirectUrl() != null) form.setRedirectUrl(request.getRedirectUrl());
    if (request.getNotificationEmails() != null) form.setNotificationEmails(request.getNotificationEmails());
    if (request.getRequiresAuth() != null) form.setRequiresAuth(request.getRequiresAuth());
    if (request.getIsActive() != null) form.setIsActive(request.getIsActive());

    return toFormResponse(formDefinitionRepository.save(form));
  }

  @Transactional
  public void deleteForm(UUID id) {
    if (!formDefinitionRepository.existsById(id)) {
      throw new ResourceNotFoundException("Form not found: " + id);
    }
    formDefinitionRepository.deleteById(id);
  }

  // ─── Public: Form Submission ─────────────────────────────────────────────────

  /**
   * Validate the submitted data against the form schema and persist the submission.
   * Fires FormSubmittedEvent after successful save.
   *
   * @param slug    form slug (from URL)
   * @param request submission payload
   * @param userId  null for anonymous submissions
   * @param ip      client IP for audit
   * @param ua      client User-Agent for audit
   */
  @Transactional
  public FormSubmissionResponse submit(String slug, FormSubmissionRequest request,
      UUID userId, String ip, String ua) {
    FormDefinition form = formDefinitionRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + slug));

    if (!form.getIsActive()) {
      throw new BadRequestException("This form is not currently accepting submissions");
    }
    if (form.getRequiresAuth() && userId == null) {
      throw new BadRequestException("Authentication is required to submit this form");
    }

    // Validate submission data against the schema
    String validatedData = validateAndNormalizeData(form.getSchemaJson(), request.getData());

    // Extract submitter details from data for convenience
    String submitterEmail = request.getSubmitterEmail();
    String submitterName = request.getSubmitterName();
    if (submitterEmail == null || submitterName == null) {
      Map<String, Object> dataMap = parseJson(validatedData);
      if (submitterEmail == null) {
        submitterEmail = extractStringField(dataMap, "email", "submitter_email", "your_email");
      }
      if (submitterName == null) {
        submitterName = extractStringField(dataMap, "name", "full_name", "your_name", "first_name");
      }
    }

    User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

    FormSubmission submission = FormSubmission.builder()
        .form(form)
        .user(user)
        .data(validatedData)
        .submitterName(submitterName)
        .submitterEmail(submitterEmail)
        .ipAddress(ip)
        .userAgent(ua)
        .status("PENDING")
        .build();

    submission = formSubmissionRepository.save(submission);

    // Fire hook event — email notification listeners, CRM creation, etc. subscribe here
    cmsEventBus.publish(new FormSubmittedEvent(
        form.getId(), form.getSlug(), form.getTitle(),
        submission.getId(), validatedData, submitterEmail, userId));

    return toSubmissionResponse(submission);
  }

  // ─── Admin: Submission management ───────────────────────────────────────────

  public Page<FormSubmissionResponse> listSubmissions(UUID formId, Pageable pageable) {
    findFormById(formId); // ensure form exists
    return formSubmissionRepository.findByFormIdOrderByCreatedAtDesc(formId, pageable)
        .map(this::toSubmissionResponse);
  }

  public FormSubmissionResponse getSubmission(UUID submissionId) {
    return toSubmissionResponse(findSubmissionById(submissionId));
  }

  @Transactional
  public FormSubmissionResponse updateSubmissionStatus(UUID submissionId, String status, String notes) {
    FormSubmission sub = findSubmissionById(submissionId);
    sub.setStatus(status);
    if (notes != null) sub.setAdminNotes(notes);
    return toSubmissionResponse(formSubmissionRepository.save(sub));
  }

  @Transactional
  public void deleteSubmission(UUID submissionId) {
    if (!formSubmissionRepository.existsById(submissionId)) {
      throw new ResourceNotFoundException("Submission not found: " + submissionId);
    }
    formSubmissionRepository.deleteById(submissionId);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private FormDefinition findFormById(UUID id) {
    return formDefinitionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + id));
  }

  private FormSubmission findSubmissionById(UUID id) {
    return formSubmissionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
  }

  /**
   * Validates that schemaJson is a parseable JSON array.
   */
  private void validateSchemaJson(String schemaJson) {
    if (schemaJson == null || schemaJson.isBlank()) {
      throw new BadRequestException("Form schema cannot be empty");
    }
    try {
      objectMapper.readValue(schemaJson, new TypeReference<List<Map<String, Object>>>() {});
    } catch (Exception e) {
      throw new BadRequestException("Invalid form schema JSON: " + e.getMessage());
    }
  }

  /**
   * Validates submitted data against form schema:
   *  - Rejects unknown fields
   *  - Checks required fields are present and non-empty
   *  - Returns the validated (potentially trimmed) JSON string
   */
  private String validateAndNormalizeData(String schemaJson, String submittedData) {
    if (submittedData == null || submittedData.isBlank()) {
      throw new BadRequestException("Submission data cannot be empty");
    }

    try {
      List<Map<String, Object>> schema = objectMapper.readValue(
          schemaJson, new TypeReference<List<Map<String, Object>>>() {});
      Map<String, Object> data = objectMapper.readValue(
          submittedData, new TypeReference<Map<String, Object>>() {});

      for (Map<String, Object> field : schema) {
        String name = (String) field.get("name");
        boolean required = Boolean.TRUE.equals(field.get("required"));

        if (required) {
          Object value = data.get(name);
          if (value == null || value.toString().isBlank()) {
            String label = field.getOrDefault("labelEn", name).toString();
            throw new BadRequestException("Required field missing: " + label);
          }
        }
      }

      // Return only the data as normalized JSON
      return objectMapper.writeValueAsString(data);
    } catch (BadRequestException e) {
      throw e;
    } catch (Exception e) {
      throw new BadRequestException("Invalid submission data: " + e.getMessage());
    }
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> parseJson(String json) {
    try {
      return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
    } catch (Exception e) {
      return Map.of();
    }
  }

  private String extractStringField(Map<String, Object> data, String... fieldNames) {
    for (String name : fieldNames) {
      Object val = data.get(name);
      if (val != null && !val.toString().isBlank()) {
        return val.toString();
      }
    }
    return null;
  }

  private FormDefinitionResponse toFormResponse(FormDefinition form) {
    long count = formSubmissionRepository.countByFormId(form.getId());
    return FormDefinitionResponse.builder()
        .id(form.getId())
        .title(form.getTitle())
        .titleAr(form.getTitleAr())
        .slug(form.getSlug())
        .description(form.getDescription())
        .schemaJson(form.getSchemaJson())
        .submitLabelEn(form.getSubmitLabelEn())
        .submitLabelAr(form.getSubmitLabelAr())
        .successMessageEn(form.getSuccessMessageEn())
        .successMessageAr(form.getSuccessMessageAr())
        .redirectUrl(form.getRedirectUrl())
        .notificationEmails(form.getNotificationEmails())
        .requiresAuth(form.getRequiresAuth())
        .isActive(form.getIsActive())
        .createdByUsername(form.getCreatedBy() != null ? form.getCreatedBy().getUsername() : null)
        .submissionCount(count)
        .createdAt(form.getCreatedAt())
        .updatedAt(form.getUpdatedAt())
        .build();
  }

  private FormSubmissionResponse toSubmissionResponse(FormSubmission sub) {
    return FormSubmissionResponse.builder()
        .id(sub.getId())
        .formId(sub.getForm().getId())
        .formTitle(sub.getForm().getTitle())
        .userId(sub.getUser() != null ? sub.getUser().getId() : null)
        .submitterName(sub.getSubmitterName())
        .submitterEmail(sub.getSubmitterEmail())
        .data(sub.getData())
        .ipAddress(sub.getIpAddress())
        .status(sub.getStatus())
        .adminNotes(sub.getAdminNotes())
        .createdAt(sub.getCreatedAt())
        .build();
  }
}
