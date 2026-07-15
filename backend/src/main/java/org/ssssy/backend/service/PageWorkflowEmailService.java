package org.ssssy.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Sends asynchronous email notifications after a page workflow transition.
 * All exceptions are caught internally — this is a fire-and-forget service.
 *
 * Requirements: 9.9, 9.10
 */
@Service
public class PageWorkflowEmailService {

    private static final Logger log = LoggerFactory.getLogger(PageWorkflowEmailService.class);
    private static final DateTimeFormatter TIMESTAMP_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;

    @Value("${spring.mail.username:noreply@ssssy.org}")
    private String fromAddress;

    public PageWorkflowEmailService(JavaMailSender mailSender, UserRepository userRepository) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
    }

    /**
     * Notify relevant users after a workflow transition.
     * Called after the @Transactional boundary commits; annotated @Async so it
     * never blocks the API response.
     *
     * @param page      the page that was transitioned
     * @param fromState previous workflow state
     * @param toState   new workflow state
     * @param timestamp when the transition occurred
     */
    @Async
    public void notifyTransition(Page page, String fromState, String toState, LocalDateTime timestamp) {
        try {
            String body = buildEmailBody(page, toState, timestamp);
            String subject = "Page workflow update: " + toState + " — " + page.getTitleEn();

            // Always notify the page author
            if (page.getAuthor() != null && page.getAuthor().getEmail() != null) {
                sendEmail(page.getAuthor().getEmail(), subject, body);
            }

            // On REVIEW state, also notify all REVIEWERs and PUBLISHERs
            if ("REVIEW".equals(toState)) {
                List<User> allUsers = userRepository.findAll();
                for (User user : allUsers) {
                    if (user.getRole() != null) {
                        String roleName = user.getRole().getName();
                        if ("REVIEWER".equals(roleName) || "PUBLISHER".equals(roleName)) {
                            // Avoid duplicate email if author is also a reviewer/publisher
                            if (page.getAuthor() == null || !user.getId().equals(page.getAuthor().getId())) {
                                sendEmail(user.getEmail(), subject, body);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to send workflow notification email for page {} ({}→{}): {}",
                    page.getId(), fromState, toState, e.getMessage(), e);
        }
    }

    // -------------------------------------------------------------------------

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Could not send workflow email to {}: {}", to, e.getMessage());
        }
    }

    private String buildEmailBody(Page page, String toState, LocalDateTime timestamp) {
        String authorName = page.getAuthor() != null
                ? displayName(page.getAuthor())
                : "Unknown";
        String formattedTime = timestamp.format(TIMESTAMP_FMT) + " UTC";
        String link = "http://localhost:3000/admin/pages/" + page.getId();

        return String.format(
                "Page Workflow Notification%n%n" +
                "Title: %s%n" +
                "Author: %s%n" +
                "New State: %s%n" +
                "Transitioned At: %s%n" +
                "Link: %s%n",
                page.getTitleEn(),
                authorName,
                toState,
                formattedTime,
                link);
    }

    private String displayName(User user) {
        String first = user.getFirstNameEn() != null ? user.getFirstNameEn() : "";
        String last = user.getLastNameEn() != null ? user.getLastNameEn() : "";
        String name = (first + " " + last).trim();
        return name.isEmpty() ? user.getUsername() : name;
    }
}
