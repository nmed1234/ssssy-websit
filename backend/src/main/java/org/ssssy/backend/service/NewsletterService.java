package org.ssssy.backend.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.NewsletterResponse;
import org.ssssy.backend.model.dto.NewsletterSubscribeRequest;
import org.ssssy.backend.model.entity.NewsletterSubscriber;
import org.ssssy.backend.repository.NewsletterSubscriberRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NewsletterService {

  private final NewsletterSubscriberRepository subscriberRepository;
  private final JavaMailSender mailSender;

  @Transactional
  public NewsletterResponse subscribe(NewsletterSubscribeRequest request) {
    if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
      throw new BadRequestException("Email is required");
    }
    if (subscriberRepository.existsByEmail(request.getEmail())) {
      NewsletterSubscriber existing = subscriberRepository.findByEmail(request.getEmail()).get();
      if (!existing.getIsActive()) {
        existing.setIsActive(true);
        existing.setUnsubscribedAt(null);
        existing = subscriberRepository.save(existing);
      }
      return toResponse(existing);
    }
    NewsletterSubscriber subscriber = NewsletterSubscriber.builder()
        .email(request.getEmail().trim().toLowerCase())
        .name(request.getName())
        .isActive(true)
        .build();
    subscriber = subscriberRepository.save(subscriber);
    return toResponse(subscriber);
  }

  @Transactional
  public void unsubscribe(String email) {
    if (email == null || email.trim().isEmpty()) {
      throw new BadRequestException("Email is required");
    }
    NewsletterSubscriber subscriber = subscriberRepository.findByEmail(email.trim().toLowerCase())
        .orElseThrow(() -> new ResourceNotFoundException("Subscriber not found: " + email));
    subscriber.setIsActive(false);
    subscriber.setUnsubscribedAt(LocalDateTime.now());
    subscriberRepository.save(subscriber);
  }

  public Page<NewsletterResponse> getAllSubscribers(Pageable pageable) {
    return subscriberRepository.findAll(pageable).map(this::toResponse);
  }

  public long getActiveSubscriberCount() {
    return subscriberRepository.countByIsActiveTrue();
  }

  @Transactional
  public void deleteSubscriber(UUID id) {
    if (!subscriberRepository.existsById(id)) {
      throw new ResourceNotFoundException("Subscriber not found: " + id);
    }
    subscriberRepository.deleteById(id);
  }

  @Transactional
  public int sendNewsletter(String fromAddress, String subject, String bodyHtml, String bodyText) {
    List<NewsletterSubscriber> activeSubscribers = subscriberRepository.findByIsActiveTrue();
    int sentCount = 0;

    for (NewsletterSubscriber subscriber : activeSubscribers) {
      try {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
        helper.setFrom(new InternetAddress(fromAddress));
        helper.setTo(subscriber.getEmail());
        helper.setSubject(subject);

        if (bodyHtml != null) {
          helper.setText(bodyText != null ? bodyText : "", bodyHtml);
        } else if (bodyText != null) {
          helper.setText(bodyText);
        }

        mailSender.send(mimeMessage);
        sentCount++;
      } catch (Exception e) {
        // Log and continue with next subscriber
        System.err.println("Failed to send newsletter to " + subscriber.getEmail() + ": " + e.getMessage());
      }
    }
    return sentCount;
  }

  private NewsletterResponse toResponse(NewsletterSubscriber subscriber) {
    return NewsletterResponse.builder()
        .id(subscriber.getId())
        .email(subscriber.getEmail())
        .name(subscriber.getName())
        .isActive(subscriber.getIsActive())
        .subscribedAt(subscriber.getSubscribedAt())
        .unsubscribedAt(subscriber.getUnsubscribedAt())
        .build();
  }
}
