package org.ssssy.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EventReminderRuleRequest;
import org.ssssy.backend.model.dto.EventReminderRuleResponse;
import org.ssssy.backend.model.dto.EventNotifyRequest;
import org.ssssy.backend.model.entity.Event;
import org.ssssy.backend.model.entity.EventRegistration;
import org.ssssy.backend.model.entity.EventReminderRule;
import org.ssssy.backend.repository.EventRegistrationRepository;
import org.ssssy.backend.repository.EventReminderRuleRepository;
import org.ssssy.backend.repository.EventRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventReminderService {

  private final EventReminderRuleRepository ruleRepository;
  private final EventRegistrationRepository registrationRepository;
  private final EventRepository eventRepository;
  private final NotificationService notificationService;
  private final JavaMailSender mailSender;

  private static final DateTimeFormatter DT_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  public List<EventReminderRuleResponse> getRulesForEvent(UUID eventId) {
    return ruleRepository.findByEventIdOrderByFireAtAsc(eventId)
        .stream().map(this::toResponse).collect(Collectors.toList());
  }

  @Transactional
  public EventReminderRuleResponse createRule(UUID eventId, EventReminderRuleRequest request) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

    LocalDateTime fireAt = computeFireAt(event, request);
    EventReminderRule rule = EventReminderRule.builder()
        .event(event)
        .ruleType(request.getRuleType() != null ? request.getRuleType() : "BEFORE_EVENT")
        .offsetHours(request.getOffsetHours() != null ? request.getOffsetHours() : 24)
        .fireAt(fireAt)
        .subjectTemplate(request.getSubjectTemplate() != null ? request.getSubjectTemplate() : "Reminder: {{eventTitle}}")
        .bodyTemplate(request.getBodyTemplate() != null ? request.getBodyTemplate() : "Dear {{name}},\n\nReminder for {{eventTitle}} on {{eventDate}}.\n\nLink: {{link}}")
        .sendEmail(request.getSendEmail() != null ? request.getSendEmail() : true)
        .sendInApp(request.getSendInApp() != null ? request.getSendInApp() : true)
        .isFired(false)
        .build();
    rule = ruleRepository.save(rule);
    return toResponse(rule);
  }

  @Transactional
  public EventReminderRuleResponse updateRule(UUID eventId, UUID ruleId, EventReminderRuleRequest request) {
    EventReminderRule rule = ruleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Reminder rule not found: " + ruleId));
    if (!rule.getEvent().getId().equals(eventId)) {
      throw new ResourceNotFoundException("Rule does not belong to this event");
    }
    Event event = rule.getEvent();
    if (request.getRuleType() != null)          rule.setRuleType(request.getRuleType());
    if (request.getOffsetHours() != null)       rule.setOffsetHours(request.getOffsetHours());
    if (request.getSubjectTemplate() != null)   rule.setSubjectTemplate(request.getSubjectTemplate());
    if (request.getBodyTemplate() != null)      rule.setBodyTemplate(request.getBodyTemplate());
    if (request.getSendEmail() != null)         rule.setSendEmail(request.getSendEmail());
    if (request.getSendInApp() != null)         rule.setSendInApp(request.getSendInApp());
    // Recompute fire_at
    rule.setFireAt(computeFireAt(event, request));
    rule.setIsFired(false); // reset on update
    rule = ruleRepository.save(rule);
    return toResponse(rule);
  }

  @Transactional
  public void deleteRule(UUID eventId, UUID ruleId) {
    EventReminderRule rule = ruleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Reminder rule not found: " + ruleId));
    if (!rule.getEvent().getId().equals(eventId)) {
      throw new ResourceNotFoundException("Rule does not belong to this event");
    }
    ruleRepository.deleteById(ruleId);
  }

  // ─── Manual trigger ────────────────────────────────────────────────────────

  @Transactional
  public Map<String, Object> fireRule(UUID eventId, UUID ruleId) {
    EventReminderRule rule = ruleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Reminder rule not found: " + ruleId));
    if (!rule.getEvent().getId().equals(eventId)) {
      throw new ResourceNotFoundException("Rule does not belong to this event");
    }
    int count = executeRule(rule);
    return Map.of("sent", count, "ruleId", ruleId.toString());
  }

  // ─── Bulk message (Phase 4) ────────────────────────────────────────────────

  @Transactional
  public Map<String, Object> notifyRegistrants(UUID eventId, EventNotifyRequest request) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));

    List<EventRegistration> targets;
    if ("ALL".equals(request.getTargetStatus()) || request.getTargetStatus() == null) {
      targets = registrationRepository.findByEventId(eventId);
    } else {
      targets = registrationRepository.findByEventIdAndStatus(eventId, request.getTargetStatus());
    }

    int sent = 0, failed = 0;
    for (EventRegistration reg : targets) {
      try {
        if (request.getHtmlBody() != null || request.getTextBody() != null) {
          sendEmail(reg.getEmail(), reg.getName(), request.getSubject(),
              request.getHtmlBody() != null ? request.getHtmlBody() : "<p>" + request.getTextBody() + "</p>");
          sent++;
        }
        if (Boolean.TRUE.equals(event.getIsPublished()) && reg.getUser() != null) {
          notificationService.createNotification(reg.getUser(), "event_message",
              request.getSubject(), request.getTextBody(),
              "/events/" + event.getSlug(), event.getId(), "event");
        }
      } catch (Exception e) {
        log.warn("Failed to notify registrant {}: {}", reg.getEmail(), e.getMessage());
        failed++;
      }
    }
    return Map.of("sent", sent, "failed", failed, "total", targets.size());
  }

  // ─── Scheduler ────────────────────────────────────────────────────────────

  @Scheduled(fixedDelay = 60_000)
  @Transactional
  public void processDueReminders() {
    List<EventReminderRule> dueRules = ruleRepository.findDueReminders(LocalDateTime.now());
    if (dueRules.isEmpty()) return;
    log.info("Processing {} due event reminder rules", dueRules.size());
    for (EventReminderRule rule : dueRules) {
      try {
        int count = executeRule(rule);
        log.info("Fired reminder rule {} for event {} — {} recipients", rule.getId(), rule.getEvent().getId(), count);
      } catch (Exception e) {
        log.error("Failed to process reminder rule {}: {}", rule.getId(), e.getMessage(), e);
      }
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private int executeRule(EventReminderRule rule) {
    Event event = rule.getEvent();
    List<EventRegistration> registrants = registrationRepository
        .findByEventIdAndStatus(event.getId(), "CONFIRMED");

    int count = 0;
    for (EventRegistration reg : registrants) {
      try {
        String subject = substitute(rule.getSubjectTemplate(), reg, event);
        String body    = substitute(rule.getBodyTemplate(), reg, event);

        if (Boolean.TRUE.equals(rule.getSendEmail())) {
          sendEmail(reg.getEmail(), reg.getName(), subject, "<p>" + body.replace("\n", "<br>") + "</p>");
        }
        if (Boolean.TRUE.equals(rule.getSendInApp()) && reg.getUser() != null) {
          notificationService.createNotification(
              reg.getUser(), "event_reminder", subject, body,
              "/events/" + event.getSlug(), event.getId(), "event");
        }
        count++;
      } catch (Exception e) {
        log.warn("Failed to send reminder to {}: {}", reg.getEmail(), e.getMessage());
      }
    }

    rule.setIsFired(true);
    rule.setFiredAt(LocalDateTime.now());
    rule.setRecipientsCount(count);
    ruleRepository.save(rule);
    return count;
  }

  private String substitute(String template, EventRegistration reg, Event event) {
    if (template == null) return "";
    String eventDateStr = event.getEventDate() != null ? event.getEventDate().format(DT_FMT) : "TBD";
    String location     = event.getIsOnline() != null && event.getIsOnline()
        ? (event.getOnlineUrl() != null ? event.getOnlineUrl() : "Online")
        : (event.getLocation() != null ? event.getLocation() : "TBD");
    return template
        .replace("{{name}}", reg.getName() != null ? reg.getName() : "")
        .replace("{{eventTitle}}", event.getTitleEn() != null ? event.getTitleEn() : event.getTitleAr())
        .replace("{{eventDate}}", eventDateStr)
        .replace("{{location}}", location)
        .replace("{{link}}", "/events/" + event.getSlug());
  }

  private void sendEmail(String to, String toName, String subject, String htmlBody) {
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
      helper.setTo(to);
      helper.setSubject(subject != null ? subject : "Event Notification");
      helper.setText(htmlBody != null ? htmlBody : "", true);
      mailSender.send(msg);
    } catch (Exception e) {
      log.warn("Email send failed to {}: {}", to, e.getMessage());
      throw new RuntimeException("Email send failed: " + e.getMessage());
    }
  }

  private LocalDateTime computeFireAt(Event event, EventReminderRuleRequest request) {
    if ("CUSTOM_DATE".equals(request.getRuleType()) && request.getFireAt() != null) {
      return request.getFireAt();
    }
    if (event.getEventDate() == null) {
      return LocalDateTime.now().plusHours(request.getOffsetHours() != null ? request.getOffsetHours() : 24);
    }
    int hours = request.getOffsetHours() != null ? request.getOffsetHours() : 24;
    if ("AFTER_EVENT".equals(request.getRuleType())) {
      LocalDateTime base = event.getEndDate() != null ? event.getEndDate() : event.getEventDate();
      return base.plusHours(hours);
    }
    // BEFORE_EVENT (default)
    return event.getEventDate().minusHours(hours);
  }

  private EventReminderRuleResponse toResponse(EventReminderRule rule) {
    return EventReminderRuleResponse.builder()
        .id(rule.getId())
        .eventId(rule.getEvent().getId())
        .ruleType(rule.getRuleType())
        .offsetHours(rule.getOffsetHours())
        .fireAt(rule.getFireAt())
        .subjectTemplate(rule.getSubjectTemplate())
        .bodyTemplate(rule.getBodyTemplate())
        .sendEmail(rule.getSendEmail())
        .sendInApp(rule.getSendInApp())
        .isFired(rule.getIsFired())
        .firedAt(rule.getFiredAt())
        .recipientsCount(rule.getRecipientsCount())
        .createdAt(rule.getCreatedAt())
        .updatedAt(rule.getUpdatedAt())
        .build();
  }
}
