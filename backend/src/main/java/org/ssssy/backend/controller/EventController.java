package org.ssssy.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
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
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.EventRegistration;
import org.ssssy.backend.service.EventReminderService;
import org.ssssy.backend.service.EventService;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

  private final EventService eventService;
  private final EventReminderService reminderService;

  // ──────────────────── PUBLIC ────────────────────────────────────────────────

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

  @PostMapping("/public/events/{id}/register")
  public ResponseEntity<ApiResponse<EventRegistrationResponse>> registerForEvent(
      @PathVariable UUID id,
      @Valid @RequestBody EventRegistrationRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        eventService.registerForEvent(id, request, UUID.fromString(userDetails.getUsername()))));
  }

  // ──────────────────── ADMIN — Events CRUD ──────────────────────────────────

  @GetMapping("/admin/events")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<EventResponse>>> getAllEvents(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getAllEvents(pageable)));
  }

  @GetMapping("/admin/events/stats")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventStatsResponse>> getStats() {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getStats()));
  }

  @GetMapping("/admin/events/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventResponse>> getEventAdmin(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getEvent(id)));
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

  @PutMapping("/admin/events/{id}/status")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventResponse>> updateStatus(
      @PathVariable UUID id, @RequestBody Map<String, String> body) {
    String status = body.get("status");
    return ResponseEntity.ok(ApiResponse.ok(eventService.updateStatus(id, status)));
  }

  @PostMapping("/admin/events/{id}/duplicate")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventResponse>> duplicateEvent(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.duplicateEvent(id)));
  }

  @DeleteMapping("/admin/events/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteEvent(@PathVariable UUID id) {
    eventService.deleteEvent(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Event deleted successfully")));
  }

  // ──────────────────── ADMIN — Registrations ────────────────────────────────

  @GetMapping("/admin/events/{id}/registrations")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<EventRegistrationResponse>>> getEventRegistrations(
      @PathVariable UUID id,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.getRegistrations(id, pageable)));
  }

  @PostMapping("/admin/events/{id}/registrations")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventRegistrationResponse>> addRegistration(
      @PathVariable UUID id, @RequestBody EventRegistrationRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.addRegistration(id, request)));
  }

  @PutMapping("/admin/events/{id}/registrations/{regId}/status")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventRegistrationResponse>> updateRegistrationStatus(
      @PathVariable UUID id, @PathVariable UUID regId,
      @RequestBody RegistrationStatusRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(
        eventService.updateRegistrationStatus(id, regId, request.getStatus(), request.getNotes())));
  }

  @PutMapping("/admin/events/{id}/registrations/{regId}/checkin")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventRegistrationResponse>> toggleCheckIn(
      @PathVariable UUID id, @PathVariable UUID regId) {
    return ResponseEntity.ok(ApiResponse.ok(eventService.toggleCheckIn(id, regId)));
  }

  @DeleteMapping("/admin/events/{id}/registrations/{regId}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteRegistration(
      @PathVariable UUID id, @PathVariable UUID regId) {
    eventService.deleteRegistration(id, regId);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Registration deleted")));
  }

  @GetMapping("/admin/events/{id}/registrations/export")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public void exportRegistrationsCSV(@PathVariable UUID id, HttpServletResponse response) throws IOException {
    EventResponse event = eventService.getEvent(id);
    List<EventRegistration> regs = eventService.getRegistrationsForExport(id);

    response.setContentType("text/csv");
    response.setHeader("Content-Disposition",
        "attachment; filename=\"registrations-" + id + ".csv\"");

    PrintWriter writer = response.getWriter();
    writer.println("ID,Name,Email,Phone,Organization,Status,Registered At,Checked In,Check-in At");
    for (EventRegistration reg : regs) {
      writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
          reg.getId(),
          safe(reg.getName()),
          safe(reg.getEmail()),
          safe(reg.getPhone()),
          safe(reg.getOrganization()),
          safe(reg.getStatus()),
          reg.getRegisteredAt() != null ? reg.getRegisteredAt().toString() : "",
          reg.getCheckedIn() != null ? reg.getCheckedIn().toString() : "false",
          reg.getCheckedInAt() != null ? reg.getCheckedInAt().toString() : ""
      );
    }
    writer.flush();
  }

  // ──────────────────── ADMIN — Reminder Rules ───────────────────────────────

  @GetMapping("/admin/events/{id}/reminders")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<EventReminderRuleResponse>>> getReminders(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(reminderService.getRulesForEvent(id)));
  }

  @PostMapping("/admin/events/{id}/reminders")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventReminderRuleResponse>> createReminder(
      @PathVariable UUID id, @RequestBody EventReminderRuleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(reminderService.createRule(id, request)));
  }

  @PutMapping("/admin/events/{id}/reminders/{ruleId}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<EventReminderRuleResponse>> updateReminder(
      @PathVariable UUID id, @PathVariable UUID ruleId,
      @RequestBody EventReminderRuleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(reminderService.updateRule(id, ruleId, request)));
  }

  @DeleteMapping("/admin/events/{id}/reminders/{ruleId}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteReminder(
      @PathVariable UUID id, @PathVariable UUID ruleId) {
    reminderService.deleteRule(id, ruleId);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Reminder rule deleted")));
  }

  @PostMapping("/admin/events/{id}/reminders/{ruleId}/fire")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> fireReminder(
      @PathVariable UUID id, @PathVariable UUID ruleId) {
    return ResponseEntity.ok(ApiResponse.ok(reminderService.fireRule(id, ruleId)));
  }

  // ──────────────────── ADMIN — Bulk Notify ──────────────────────────────────

  @PostMapping("/admin/events/{id}/notify")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, Object>>> notifyRegistrants(
      @PathVariable UUID id, @RequestBody EventNotifyRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(reminderService.notifyRegistrants(id, request)));
  }

  // ──────────────────── Helpers ───────────────────────────────────────────────

  private String safe(String s) {
    return s != null ? s.replace("\"", "\"\"") : "";
  }
}
