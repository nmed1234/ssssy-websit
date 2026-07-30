package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.ssssy.backend.event.FormSubmittedEvent;
import org.ssssy.backend.model.entity.FormDefinition;
import org.ssssy.backend.repository.FormDefinitionRepository;

import jakarta.mail.internet.MimeMessage;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Listens to FormSubmittedEvent and sends email notifications to configured recipients.
 *
 * This is the first real demonstration of the CMS Event Bus in action:
 * FormController → FormService → CmsEventBus.publish(FormSubmittedEvent) → this listener
 *
 * FormService has zero knowledge of this class — it's a pure hook.
 * Any developer can add more listeners to FormSubmittedEvent independently.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FormNotificationListener {

  private final FormDefinitionRepository formDefinitionRepository;
  private final JavaMailSender mailSender;

  @Async("ssssyTaskExecutor")
  @EventListener
  public void onFormSubmitted(FormSubmittedEvent event) {
    try {
      FormDefinition form = formDefinitionRepository.findById(event.getFormId()).orElse(null);
      if (form == null || form.getNotificationEmails() == null
          || form.getNotificationEmails().isBlank()) {
        return;
      }

      List<String> recipients = Arrays.stream(form.getNotificationEmails().split(","))
          .map(String::trim)
          .filter(e -> !e.isEmpty())
          .toList();

      if (recipients.isEmpty()) return;

      String submitterInfo = event.getSubmitterEmail() != null
          ? " from " + event.getSubmitterEmail() : "";

      String subject = "New form submission: " + event.getFormTitle();
      String body = "A new submission has been received for form \"" + event.getFormTitle() + "\"" + submitterInfo + ".\n\n"
          + "Submission ID: " + event.getSubmissionId() + "\n"
          + "Data:\n" + event.getSubmissionDataJson() + "\n\n"
          + "Review it in the admin panel at /admin/forms.";

      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
      helper.setSubject(subject);
      helper.setText(body, false);
      for (String recipient : recipients) {
        helper.setTo(recipient);
        mailSender.send(message);
      }
    } catch (Exception ex) {
      log.warn("Failed to send form notification email for submission {}: {}",
          event.getSubmissionId(), ex.getMessage());
    }
  }
}
