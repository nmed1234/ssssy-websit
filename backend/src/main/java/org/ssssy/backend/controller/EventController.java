package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.EventRegistrationRequest;
import org.ssssy.backend.model.dto.EventRegistrationResponse;
import org.ssssy.backend.model.dto.EventRequest;
import org.ssssy.backend.model.dto.EventResponse;
import org.ssssy.backend.service.EventService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

  private final EventService eventService;

  @GetMapping("/public/events")
  public ResponseEntity<ApiResponse<Page<EventResponse>>> getPublishedEvents(
      @PageableDefault(size = 12, sort = "eventDate", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getPublishedEvents(pageable)));
  }

  @GetMapping("/public/events/upcoming")
  public ResponseEntity<ApiResponse<List<EventResponse>>> getUpcomingEvents() {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getUpcomingEvents()));
  }

  @GetMapping("/public/events/calendar")
  public ResponseEntity<ApiResponse<List<EventResponse>>> getEventsByMonth(
      @RequestParam int year, @RequestParam int month) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getEventsByMonth(year, month)));
  }

  @GetMapping("/public/events/{slug}")
  public ResponseEntity<ApiResponse<EventResponse>> getEventBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getEventBySlug(slug)));
  }

  @GetMapping("/public/events/id/{id}")
  public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getEvent(id)));
  }

  @GetMapping("/admin/events")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<EventResponse>>> getAllEvents(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getAllEvents(pageable)));
  }

  @PostMapping("/admin/events")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventResponse>> createEvent(
      @Valid @RequestBody EventRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        eventService.createEvent(request, UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/admin/events/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
      @PathVariable UUID id, @Valid @RequestBody EventRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.updateEvent(id, request)));
  }

  @DeleteMapping("/admin/events/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteEvent(@PathVariable UUID id) {
    eventService.deleteEvent(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Event deleted successfully")));
  }

  @PostMapping("/public/events/{id}/register")
  public ResponseEntity<ApiResponse<EventRegistrationResponse>> registerForEvent(
      @PathVariable UUID id,
      @Valid @RequestBody EventRegistrationRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        eventService.registerForEvent(id, request, UUID.fromString(userDetails.getUsername()))));
  }

  @GetMapping("/admin/events/{id}/registrations")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<EventRegistrationResponse>>> getEventRegistrations(
      @PathVariable UUID id,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getRegistrations(id, pageable)));
  }
}
