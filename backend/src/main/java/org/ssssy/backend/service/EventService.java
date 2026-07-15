package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.model.dto.EventRegistrationRequest;
import org.ssssy.backend.model.dto.EventRegistrationResponse;
import org.ssssy.backend.model.dto.EventRequest;
import org.ssssy.backend.model.dto.EventResponse;
import org.ssssy.backend.model.entity.Event;
import org.ssssy.backend.model.entity.EventRegistration;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.EventRegistrationRepository;
import org.ssssy.backend.repository.EventRepository;
import org.ssssy.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

  private final EventRepository eventRepository;
  private final EventRegistrationRepository eventRegistrationRepository;
  private final UserRepository userRepository;

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

  public Page<EventResponse> getAllEvents(Pageable pageable) {
    return eventRepository.findAll(pageable).map(this::toResponse);
  }

  @Transactional
  public EventResponse createEvent(EventRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    if (eventRepository.existsBySlug(request.getSlug())) {
      throw new BadRequestException("Slug already in use");
    }
    Event event = Event.builder()
        .titleAr(request.getTitleAr())
        .titleEn(request.getTitleEn())
        .slug(request.getSlug())
        .description(request.getDescription())
        .eventDate(request.getEventDate())
        .endDate(request.getEndDate())
        .location(request.getLocation())
        .locationUrl(request.getLocationUrl())
        .eventType(request.getEventType())
        .organizer(request.getOrganizer())
        .featuredImage(request.getFeaturedImage())
        .isPublished(request.getIsPublished() != null && request.getIsPublished())
        .address(request.getAddress())
        .latitude(request.getLatitude())
        .longitude(request.getLongitude())
        .isOnline(request.getIsOnline())
        .onlineUrl(request.getOnlineUrl())
        .maxParticipants(request.getMaxParticipants())
        .registrationDeadline(request.getRegistrationDeadline())
        .status(request.getStatus())
        .contactEmail(request.getContactEmail())
        .createdBy(user)
        .build();
    event = eventRepository.save(event);
    return toResponse(event);
  }

  @Transactional
  public EventResponse updateEvent(UUID id, EventRequest request) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + id));
    event.setTitleAr(request.getTitleAr());
    event.setTitleEn(request.getTitleEn());
    event.setSlug(request.getSlug());
    event.setDescription(request.getDescription());
    event.setEventDate(request.getEventDate());
    event.setEndDate(request.getEndDate());
    event.setLocation(request.getLocation());
    event.setLocationUrl(request.getLocationUrl());
    event.setEventType(request.getEventType());
    event.setOrganizer(request.getOrganizer());
    event.setFeaturedImage(request.getFeaturedImage());
    event.setIsPublished(request.getIsPublished());
    event.setAddress(request.getAddress());
    event.setLatitude(request.getLatitude());
    event.setLongitude(request.getLongitude());
    event.setIsOnline(request.getIsOnline());
    event.setOnlineUrl(request.getOnlineUrl());
    event.setMaxParticipants(request.getMaxParticipants());
    event.setRegistrationDeadline(request.getRegistrationDeadline());
    event.setStatus(request.getStatus());
    event.setContactEmail(request.getContactEmail());
    event = eventRepository.save(event);
    return toResponse(event);
  }

  @Transactional
  public void deleteEvent(UUID id) {
    if (!eventRepository.existsById(id)) {
      throw new ResourceNotFoundException("Event not found: " + id);
    }
    eventRepository.deleteById(id);
  }

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

  public EventRegistrationResponse getRegistration(UUID registrationId) {
    EventRegistration reg = eventRegistrationRepository.findById(registrationId)
        .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + registrationId));
    return toRegistrationResponse(reg);
  }

  private EventRegistrationResponse toRegistrationResponse(EventRegistration reg) {
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
        .createdAt(reg.getCreatedAt())
        .build();
  }

  private EventResponse toResponse(Event event) {
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
        .createdByName(event.getCreatedBy().getFirstNameEn() + " " + event.getCreatedBy().getLastNameEn())
        .createdAt(event.getCreatedAt())
        .updatedAt(event.getUpdatedAt())
        .build();
  }
}
