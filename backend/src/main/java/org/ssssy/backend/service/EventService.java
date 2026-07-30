package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EventRegistrationRequest;
import org.ssssy.backend.model.dto.EventRegistrationResponse;
import org.ssssy.backend.model.dto.EventRequest;
import org.ssssy.backend.model.dto.EventResponse;
import org.ssssy.backend.model.dto.EventStatsResponse;
import org.ssssy.backend.model.entity.Event;
import org.ssssy.backend.model.entity.EventRegistration;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.EventRegistrationRepository;
import org.ssssy.backend.repository.EventRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

  private final EventRepository eventRepository;
  private final EventRegistrationRepository eventRegistrationRepository;
  private final UserRepository userRepository;

  // ─── Public API ────────────────────────────────────────────────────────────

  public Page<EventResponse> getPublishedEvents(Pageable pageable) {
    return eventRepository.findByIsPublishedTrueOrderByEventDateDesc(pageable)
        .map(this::toResponse);
  }

  public List<EventResponse> getUpcomingEvents() {
    return eventRepository
        .findByIsPublishedTrueAndEventDateAfterOrderByEventDateAsc(LocalDateTime.now())
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<EventResponse> getEventsByMonth(int year, int month) {
    LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
    LocalDateTime end = start.plusMonths(1);
    return eventRepository
        .findByIsPublishedTrueAndEventDateBetweenOrderByEventDateAsc(start, end)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public EventResponse getEvent(UUID id) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    return toResponse(event);
  }

  public EventResponse getEventBySlug(String slug) {
    Event event = eventRepository.findBySlug(slug)
        .filter(Event::getIsPublished)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + slug));
    return toResponse(event);
  }

  // ─── Admin API ─────────────────────────────────────────────────────────────

  public Page<EventResponse> getAllEvents(Pageable pageable) {
    return eventRepository.findAll(pageable).map(this::toResponse);
  }

  @Transactional
  public EventResponse createEvent(EventRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    if (request.getSlug() != null && eventRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Slug already in use");
    }
    Event event = buildFromRequest(request);
    event.setCreatedBy(user);
    event = eventRepository.save(event);
    return toResponse(event);
  }

  @Transactional
  public EventResponse updateEvent(UUID id, EventRequest request) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    if (request.getSlug() != null && !request.getSlug().equals(event.getSlug())
        && eventRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
      throw new BadRequestException("Slug already in use");
    }
    applyRequest(event, request);
    event = eventRepository.save(event);
    return toResponse(event);
  }

  @Transactional
  public EventResponse updateStatus(UUID id, String status) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    event.setStatus(status);
    if ("PUBLISHED".equals(status)) {
      event.setIsPublished(true);
    } else if ("ARCHIVED".equals(status) || "CANCELLED".equals(status)) {
      event.setIsPublished(false);
      if ("CANCELLED".equals(status)) {
        event.setCancelledAt(LocalDateTime.now());
      }
    }
    event = eventRepository.save(event);
    return toResponse(event);
  }

  @Transactional
  public EventResponse duplicateEvent(UUID id) {
    Event original = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    String baseSlug = original.getSlug() + "-copy";
    String slug = baseSlug;
    int i = 1;
    while (eventRepository.existsBySlug(slug)) {
      slug = baseSlug + "-" + i++;
    }
    Event copy = Event.builder()
        .titleAr(original.getTitleAr() + " (Copy)")
        .titleEn(original.getTitleEn() != null ? original.getTitleEn() + " (Copy)" : null)
        .slug(slug)
        .description(original.getDescription())
        .eventDate(original.getEventDate())
        .endDate(original.getEndDate())
        .location(original.getLocation())
        .locationUrl(original.getLocationUrl())
        .eventType(original.getEventType())
        .organizer(original.getOrganizer())
        .featuredImage(original.getFeaturedImage())
        .isPublished(false)
        .address(original.getAddress())
        .latitude(original.getLatitude())
        .longitude(original.getLongitude())
        .isOnline(original.getIsOnline())
        .onlineUrl(original.getOnlineUrl())
        .maxParticipants(original.getMaxParticipants())
        .registrationDeadline(original.getRegistrationDeadline())
        .status("DRAFT")
        .contactEmail(original.getContactEmail())
        .isFeatured(false)
        .ogImage(original.getOgImage())
        .metaTitle(original.getMetaTitle())
        .metaDescription(original.getMetaDescription())
        .createdBy(original.getCreatedBy())
        .build();
    copy = eventRepository.save(copy);
    return toResponse(copy);
  }

  @Transactional
  public void deleteEvent(UUID id) {
    if (!eventRepository.existsById(id)) {
      throw new ResourceNotFoundException("Event not found: " + id);
    }
    eventRepository.deleteById(id);
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  public EventStatsResponse getStats() {
    long total      = eventRepository.count();
    long published  = eventRepository.countByStatus("PUBLISHED");
    long draft      = eventRepository.countByStatus("DRAFT");
    long archived   = eventRepository.countByStatus("ARCHIVED");
    long cancelled  = eventRepository.countByStatus("CANCELLED");
    long upcoming   = eventRepository.countByEventDateAfter(LocalDateTime.now());
    long totalRegs  = eventRegistrationRepository.count();

    LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
    long regsThisMonth = eventRegistrationRepository.countSince(startOfMonth);

    // Find most-registered event
    String mostTitle = "";
    long mostCount = 0;
    List<Object[]> top = eventRegistrationRepository.topEventsByRegistrationCount(PageRequest.of(0, 1));
    if (!top.isEmpty()) {
      UUID topId = (UUID) top.get(0)[0];
      mostCount = (Long) top.get(0)[1];
      mostTitle = eventRepository.findById(topId)
          .map(e -> e.getTitleEn() != null ? e.getTitleEn() : e.getTitleAr())
          .orElse("");
    }

    return EventStatsResponse.builder()
        .totalEvents(total)
        .publishedEvents(published)
        .draftEvents(draft)
        .archivedEvents(archived)
        .cancelledEvents(cancelled)
        .upcomingEvents(upcoming)
        .totalRegistrations(totalRegs)
        .totalRegistrationsThisMonth(regsThisMonth)
        .mostRegisteredEventTitle(mostTitle)
        .mostRegisteredEventCount(mostCount)
        .registrationsByEventType(new HashMap<>())
        .build();
  }

  // ─── Registrations ─────────────────────────────────────────────────────────

  @Transactional
  public EventRegistrationResponse registerForEvent(UUID eventId, EventRegistrationRequest request, UUID userId) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    if (!Boolean.TRUE.equals(event.getIsPublished())) {
      throw new BadRequestException("Cannot register for an unpublished event");
    }
    if (event.getRegistrationDeadline() != null && event.getRegistrationDeadline().isBefore(LocalDateTime.now())) {
      throw new BadRequestException("Registration deadline has passed");
    }
    if (event.getMaxParticipants() != null) {
      long current = eventRegistrationRepository.countByEventId(eventId);
      if (current >= event.getMaxParticipants()) {
        throw new BadRequestException("Event is fully booked");
      }
    }
    if (eventRegistrationRepository.existsByEventIdAndUserId(eventId, userId)) {
      throw new BadRequestException("Already registered for this event");
    }
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    EventRegistration reg = EventRegistration.builder()
        .event(event)
        .user(user)
        .name(request.getName() != null ? request.getName() : user.getFirstNameEn() + " " + user.getLastNameEn())
        .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
        .phone(request.getPhone())
        .organization(request.getOrganization())
        .notes(request.getNotes())
        .build();
    reg = eventRegistrationRepository.save(reg);
    return toRegistrationResponse(reg);
  }

  public Page<EventRegistrationResponse> getRegistrations(UUID eventId, Pageable pageable) {
    if (!eventRepository.existsById(eventId)) {
      throw new ResourceNotFoundException("Event not found: " + eventId);
    }
    return eventRegistrationRepository.findByEventIdOrderByCreatedAtDesc(eventId, pageable)
        .map(this::toRegistrationResponse);
  }

  @Transactional
  public EventRegistrationResponse updateRegistrationStatus(UUID eventId, UUID regId, String status, String notes) {
    EventRegistration reg = eventRegistrationRepository.findById(regId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + regId));
    if (!reg.getEvent().getId().equals(eventId)) {
      throw new BadRequestException("Registration does not belong to this event");
    }
    reg.setStatus(status);
    if (notes != null) reg.setCheckInNotes(notes);
    if ("CHECKED_IN".equals(status)) {
      reg.setCheckedIn(true);
      reg.setCheckedInAt(LocalDateTime.now());
    }
    reg = eventRegistrationRepository.save(reg);
    return toRegistrationResponse(reg);
  }

  @Transactional
  public EventRegistrationResponse toggleCheckIn(UUID eventId, UUID regId) {
    EventRegistration reg = eventRegistrationRepository.findById(regId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + regId));
    if (!reg.getEvent().getId().equals(eventId)) {
      throw new BadRequestException("Registration does not belong to this event");
    }
    boolean newCheckedIn = !Boolean.TRUE.equals(reg.getCheckedIn());
    reg.setCheckedIn(newCheckedIn);
    reg.setCheckedInAt(newCheckedIn ? LocalDateTime.now() : null);
    if (newCheckedIn) reg.setStatus("CHECKED_IN");
    reg = eventRegistrationRepository.save(reg);
    return toRegistrationResponse(reg);
  }

  @Transactional
  public void deleteRegistration(UUID eventId, UUID regId) {
    EventRegistration reg = eventRegistrationRepository.findById(regId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + regId));
    if (!reg.getEvent().getId().equals(eventId)) {
      throw new BadRequestException("Registration does not belong to this event");
    }
    eventRegistrationRepository.deleteById(regId);
  }

  @Transactional
  public EventRegistrationResponse addRegistration(UUID eventId, EventRegistrationRequest request) {
    Event event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
    // For admin-added registrations, we allow adding without a user account
    // Create a placeholder user lookup or use a system user approach
    // For now, find by email if provided, or fall through
    User user = null;
    if (request.getEmail() != null) {
      user = userRepository.findByEmail(request.getEmail()).orElse(null);
    }
    if (user == null) {
      // Use the event creator as placeholder user (admin-added registrant)
      user = event.getCreatedBy();
    }
    EventRegistration reg = EventRegistration.builder()
        .event(event)
        .user(user)
        .name(request.getName() != null ? request.getName() : "External Attendee")
        .email(request.getEmail() != null ? request.getEmail() : user.getEmail())
        .phone(request.getPhone())
        .organization(request.getOrganization())
        .notes(request.getNotes())
        .status("CONFIRMED")
        .build();
    reg = eventRegistrationRepository.save(reg);
    return toRegistrationResponse(reg);
  }

  public List<EventRegistration> getRegistrationsForExport(UUID eventId) {
    return eventRegistrationRepository.findByEventId(eventId);
  }

  public EventRegistrationResponse getRegistration(UUID registrationId) {
    EventRegistration reg = eventRegistrationRepository.findById(registrationId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + registrationId));
    return toRegistrationResponse(reg);
  }

  // ─── Mappers ───────────────────────────────────────────────────────────────

  private Event buildFromRequest(EventRequest req) {
    return Event.builder()
        .titleAr(req.getTitleAr())
        .titleEn(req.getTitleEn())
        .slug(req.getSlug())
        .description(req.getDescription())
        .eventDate(req.getEventDate())
        .endDate(req.getEndDate())
        .location(req.getLocation())
        .locationUrl(req.getLocationUrl())
        .eventType(req.getEventType())
        .organizer(req.getOrganizer())
        .featuredImage(req.getFeaturedImage())
        .isPublished(req.getIsPublished() != null && req.getIsPublished())
        .address(req.getAddress())
        .latitude(req.getLatitude())
        .longitude(req.getLongitude())
        .isOnline(req.getIsOnline())
        .onlineUrl(req.getOnlineUrl())
        .maxParticipants(req.getMaxParticipants())
        .registrationDeadline(req.getRegistrationDeadline())
        .status(req.getStatus() != null ? req.getStatus() : "DRAFT")
        .contactEmail(req.getContactEmail())
        .isFeatured(req.getIsFeatured() != null && req.getIsFeatured())
        .displayOrder(req.getDisplayOrder())
        .ogImage(req.getOgImage())
        .metaTitle(req.getMetaTitle())
        .metaDescription(req.getMetaDescription())
        .registrationFormSchema(req.getRegistrationFormSchema())
        .cancellationReason(req.getCancellationReason())
        .build();
  }

  private void applyRequest(Event event, EventRequest req) {
    if (req.getTitleAr() != null)             event.setTitleAr(req.getTitleAr());
    if (req.getTitleEn() != null)             event.setTitleEn(req.getTitleEn());
    if (req.getSlug() != null)                event.setSlug(req.getSlug());
    if (req.getDescription() != null)         event.setDescription(req.getDescription());
    if (req.getEventDate() != null)           event.setEventDate(req.getEventDate());
    if (req.getEndDate() != null)             event.setEndDate(req.getEndDate());
    if (req.getLocation() != null)            event.setLocation(req.getLocation());
    if (req.getLocationUrl() != null)         event.setLocationUrl(req.getLocationUrl());
    if (req.getEventType() != null)           event.setEventType(req.getEventType());
    if (req.getOrganizer() != null)           event.setOrganizer(req.getOrganizer());
    if (req.getFeaturedImage() != null)       event.setFeaturedImage(req.getFeaturedImage());
    if (req.getIsPublished() != null)         event.setIsPublished(req.getIsPublished());
    if (req.getAddress() != null)             event.setAddress(req.getAddress());
    if (req.getLatitude() != null)            event.setLatitude(req.getLatitude());
    if (req.getLongitude() != null)           event.setLongitude(req.getLongitude());
    if (req.getIsOnline() != null)            event.setIsOnline(req.getIsOnline());
    if (req.getOnlineUrl() != null)           event.setOnlineUrl(req.getOnlineUrl());
    if (req.getMaxParticipants() != null)     event.setMaxParticipants(req.getMaxParticipants());
    if (req.getRegistrationDeadline() != null) event.setRegistrationDeadline(req.getRegistrationDeadline());
    if (req.getStatus() != null)              event.setStatus(req.getStatus());
    if (req.getContactEmail() != null)        event.setContactEmail(req.getContactEmail());
    if (req.getIsFeatured() != null)          event.setIsFeatured(req.getIsFeatured());
    if (req.getDisplayOrder() != null)        event.setDisplayOrder(req.getDisplayOrder());
    if (req.getOgImage() != null)             event.setOgImage(req.getOgImage());
    if (req.getMetaTitle() != null)           event.setMetaTitle(req.getMetaTitle());
    if (req.getMetaDescription() != null)     event.setMetaDescription(req.getMetaDescription());
    if (req.getRegistrationFormSchema() != null) event.setRegistrationFormSchema(req.getRegistrationFormSchema());
    if (req.getCancellationReason() != null)  event.setCancellationReason(req.getCancellationReason());
  }

  public EventRegistrationResponse toRegistrationResponse(EventRegistration reg) {
    return EventRegistrationResponse.builder()
        .id(reg.getId())
        .eventId(reg.getEvent().getId())
        .userId(reg.getUser().getId())
        .userName(reg.getUser().getFirstNameEn() + " " + reg.getUser().getLastNameEn())
        .userEmail(reg.getUser().getEmail())
        .name(reg.getName())
        .email(reg.getEmail())
        .phone(reg.getPhone())
        .organization(reg.getOrganization())
        .notes(reg.getNotes())
        .status(reg.getStatus())
        .registeredAt(reg.getRegisteredAt())
        .checkedIn(reg.getCheckedIn())
        .checkedInAt(reg.getCheckedInAt())
        .checkInNotes(reg.getCheckInNotes())
        .waitlistPosition(reg.getWaitlistPosition())
        .createdAt(reg.getCreatedAt())
        .build();
  }

  public EventResponse toResponse(Event event) {
    long regCount = eventRegistrationRepository.countByEventId(event.getId());
    return EventResponse.builder()
        .id(event.getId())
        .titleAr(event.getTitleAr())
        .titleEn(event.getTitleEn())
        .slug(event.getSlug())
        .description(event.getDescription())
        .eventDate(event.getEventDate())
        .endDate(event.getEndDate())
        .location(event.getLocation())
        .locationUrl(event.getLocationUrl())
        .eventType(event.getEventType())
        .organizer(event.getOrganizer())
        .featuredImage(event.getFeaturedImage())
        .isPublished(event.getIsPublished())
        .address(event.getAddress())
        .latitude(event.getLatitude())
        .longitude(event.getLongitude())
        .isOnline(event.getIsOnline())
        .onlineUrl(event.getOnlineUrl())
        .maxParticipants(event.getMaxParticipants())
        .registrationDeadline(event.getRegistrationDeadline())
        .status(event.getStatus())
        .contactEmail(event.getContactEmail())
        .registrationCount(regCount)
        .isFeatured(event.getIsFeatured())
        .displayOrder(event.getDisplayOrder())
        .ogImage(event.getOgImage())
        .metaTitle(event.getMetaTitle())
        .metaDescription(event.getMetaDescription())
        .registrationFormSchema(event.getRegistrationFormSchema())
        .cancelledAt(event.getCancelledAt())
        .cancellationReason(event.getCancellationReason())
        .createdByName(event.getCreatedBy().getFirstNameEn() + " " + event.getCreatedBy().getLastNameEn())
        .createdAt(event.getCreatedAt())
        .updatedAt(event.getUpdatedAt())
        .build();
  }
}
