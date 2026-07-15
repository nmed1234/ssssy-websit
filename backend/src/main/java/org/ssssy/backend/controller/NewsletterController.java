package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.NewsletterResponse;
import org.ssssy.backend.model.dto.NewsletterSendRequest;
import org.ssssy.backend.model.dto.NewsletterSubscribeRequest;
import org.ssssy.backend.service.NewsletterService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NewsletterController {

  private final NewsletterService newsletterService;

  @PostMapping("/public/newsletter/subscribe")
  public ResponseEntity<ApiResponse<NewsletterResponse>> subscribe(@Valid @RequestBody NewsletterSubscribeRequest request) {
    return ResponseEntity.ok(ApiResponse.ok("Subscribed successfully", newsletterService.subscribe(request)));
  }

  @PostMapping("/public/newsletter/unsubscribe")
  public ResponseEntity<ApiResponse<Map<String, String>>> unsubscribe(@RequestParam String email) {
    newsletterService.unsubscribe(email);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Unsubscribed successfully")));
  }

  @GetMapping("/admin/newsletter/subscribers")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<NewsletterResponse>>> getSubscribers(
      @PageableDefault(size = 20, sort = "subscribedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(newsletterService.getAllSubscribers(pageable)));
  }

  @DeleteMapping("/admin/newsletter/subscribers/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteSubscriber(@PathVariable UUID id) {
    newsletterService.deleteSubscriber(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Subscriber deleted successfully")));
  }

  @PostMapping("/admin/newsletter/send")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> sendNewsletter(
      @Valid @RequestBody NewsletterSendRequest request) {
    int sent = newsletterService.sendNewsletter(
        request.getFromAddress(), request.getSubject(),
        request.getBodyHtml(), request.getBodyText());
    return ResponseEntity.ok(ApiResponse.ok(Map.of("sent", sent)));
  }
}
