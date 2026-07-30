package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.ssssy.backend.event.ContentCreatedEvent;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.UserRepository;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Phase 4 — Member Submission Workflow listener.
 *
 * Listens to ContentCreatedEvent where initialStatus = PENDING_REVIEW.
 * Notifies all active EDITORs and ADMINs via email so they can review the submission.
 *
 * This is a pure CMS Event Bus listener — DynamicContentService has zero knowledge of this class.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberSubmissionNotificationListener {

  private final UserRepository userRepository;
  private final JavaMailSender mailSender;

  @Async("ssssyTaskExecutor")
  @EventListener
  public void onContentCreated(ContentCreatedEvent event) {
    // Only care about member submissions (PENDING_REVIEW status)
    if (!"PENDING_REVIEW".equals(event.getInitialStatus())) return;

    try {
      // Find all active editors and admins
      List<User> editors = userRepository.findActiveUsersByRoleName("EDITOR");
      List<User> admins = userRepository.findActiveUsersByRoleName("ADMIN");

      List<String> recipients = java.util.stream.Stream.concat(editors.stream(), admins.stream())
          .map(User::getEmail)
          .filter(e -> e != null && !e.isBlank())
          .distinct()
          .toList();

      if (recipients.isEmpty()) return;

      String contentType = event.getContentType();
      String title = event.getTitleEn() != null ? event.getTitleEn() : event.getSlug();
      String subject = "[SSSSY] New submission pending review: " + title;
      String body = "A new " + contentType + " submission requires your review.\n\n"
          + "Title: " + title + "\n"
          + "Slug: " + event.getSlug() + "\n"
          + "Submitted by: " + (event.getActorId() != null ? event.getActorId() : "Anonymous") + "\n\n"
          + "Please review it in the admin panel:\n"
          + "/admin/content-types/*/entries\n\n"
          + "— SSSSY CMS";

      for (String recipient : recipients) {
        try {
          MimeMessage message = mailSender.createMimeMessage();
          MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
          helper.setSubject(subject);
          helper.setText(body, false);
          helper.setTo(recipient);
          mailSender.send(message);
          log.debug("Notified editor {} of new submission {}", recipient, event.getSlug());
        } catch (Exception ex) {
          log.warn("Failed to send submission notification to {}: {}", recipient, ex.getMessage());
        }
      }
    } catch (Exception ex) {
      log.warn("MemberSubmissionNotificationListener error for {}: {}", event.getSlug(), ex.getMessage());
    }
  }
}
