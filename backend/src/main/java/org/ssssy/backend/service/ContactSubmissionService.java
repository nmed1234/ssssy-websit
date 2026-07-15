package org.ssssy.backend.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.ContactSubmissionReplyRequest;
import org.ssssy.backend.model.dto.ContactSubmissionRequest;
import org.ssssy.backend.model.dto.ContactSubmissionResponse;
import org.ssssy.backend.model.entity.ContactSubmission;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.ContactSubmissionRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactSubmissionService {

  private final ContactSubmissionRepository contactSubmissionRepository;
  private final UserRepository userRepository;

  @Transactional
  public ContactSubmissionResponse submit(@Valid ContactSubmissionRequest request) {
    ContactSubmission submission = ContactSubmission.builder()
        .name(request.getName())
        .email(request.getEmail())
        .phone(request.getPhone())
        .subject(request.getSubject())
        .message(request.getMessage())
        .build();
    submission = contactSubmissionRepository.save(submission);
    return toResponse(submission);
  }

  public Page<ContactSubmissionResponse> getAllSubmissions(Pageable pageable) {
    return contactSubmissionRepository.findAllByOrderByCreatedAtDesc(pageable)
        .map(this::toResponse);
  }

  public Page<ContactSubmissionResponse> getUnreadSubmissions(Pageable pageable) {
    return contactSubmissionRepository.findByIsReadFalseOrderByCreatedAtDesc(pageable)
        .map(this::toResponse);
  }

  public long getUnreadCount() {
    return contactSubmissionRepository.countByIsReadFalse();
  }

  @Transactional
  public ContactSubmissionResponse markAsRead(UUID id) {
    ContactSubmission submission = contactSubmissionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
    submission.setIsRead(true);
    submission = contactSubmissionRepository.save(submission);
    return toResponse(submission);
  }

  public ContactSubmissionResponse getSubmission(UUID id) {
    ContactSubmission submission = contactSubmissionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
    return toResponse(submission);
  }

  @Transactional
  public void deleteSubmission(UUID id) {
    if (!contactSubmissionRepository.existsById(id)) {
      throw new ResourceNotFoundException("Submission not found: " + id);
    }
    contactSubmissionRepository.deleteById(id);
  }

  @Transactional
  public ContactSubmissionResponse replyToSubmission(UUID id, UUID userId, ContactSubmissionReplyRequest request) {
    ContactSubmission submission = contactSubmissionRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + id));
    User replier = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    submission.setIsRead(true);
    submission.setReadBy(replier);
    submission.setRepliedAt(LocalDateTime.now());
    submission = contactSubmissionRepository.save(submission);
    return toResponse(submission);
  }

  private ContactSubmissionResponse toResponse(ContactSubmission submission) {
    return ContactSubmissionResponse.builder()
        .id(submission.getId())
        .name(submission.getName())
        .email(submission.getEmail())
        .phone(submission.getPhone())
        .subject(submission.getSubject())
        .message(submission.getMessage())
        .isRead(submission.getIsRead())
        .readBy(submission.getReadBy() != null ? submission.getReadBy().getId() : null)
        .repliedAt(submission.getRepliedAt())
        .createdAt(submission.getCreatedAt())
        .build();
  }
}
