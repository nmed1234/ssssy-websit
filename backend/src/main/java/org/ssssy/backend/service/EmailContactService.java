package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailContactService {

  private final EmailContactRepository emailContactRepository;
  private final ContactGroupRepository contactGroupRepository;
  private final ContactGroupMemberRepository contactGroupMemberRepository;
  private final UserRepository userRepository;

  public List<EmailContactResponse> getContacts(UUID userId) {
    return emailContactRepository.findByOwnerIdOrderByDisplayNameAsc(userId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public Page<EmailContactResponse> getContactsPaged(UUID userId, Pageable pageable) {
    return emailContactRepository.findByOwnerId(userId, pageable)
        .map(this::toResponse);
  }

  public EmailContactResponse getContact(UUID userId, UUID contactId) {
    EmailContact contact = emailContactRepository.findById(contactId)
        .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    if (!contact.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Contact does not belong to this user");
    }
    return toResponse(contact);
  }

  @Transactional
  public EmailContactResponse createContact(UUID userId, EmailContactRequest request) {
    if (emailContactRepository.findByOwnerIdAndEmail(userId, request.getEmail()).isPresent()) {
      throw new BadRequestException("Contact with this email already exists");
    }
    User owner = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    EmailContact contact = EmailContact.builder()
        .owner(owner)
        .email(request.getEmail())
        .firstName(request.getFirstName())
        .lastName(request.getLastName())
        .displayName(request.getDisplayName())
        .company(request.getCompany())
        .position(request.getPosition())
        .phone(request.getPhone())
        .mobile(request.getMobile())
        .notes(request.getNotes())
        .isFavorite(request.getIsFavorite() != null && request.getIsFavorite())
        .build();
    EmailContact saved = emailContactRepository.save(contact);

    if (request.getGroupIds() != null) {
      for (UUID groupId : request.getGroupIds()) {
        contactGroupRepository.findById(groupId).ifPresent(group -> {
          ContactGroupMember member = ContactGroupMember.builder()
              .group(group)
              .contact(saved)
              .build();
          contactGroupMemberRepository.save(member);
        });
      }
    }
    return toResponse(saved);
  }

  @Transactional
  public List<EmailContactResponse> importContacts(UUID userId, EmailContactImportRequest request) {
    User owner = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    List<EmailContactResponse> results = new ArrayList<>();
    for (EmailContactRequest cr : request.getContacts()) {
      if (emailContactRepository.findByOwnerIdAndEmail(userId, cr.getEmail()).isPresent()) continue;
      EmailContact contact = EmailContact.builder()
          .owner(owner)
          .email(cr.getEmail())
          .firstName(cr.getFirstName())
          .lastName(cr.getLastName())
          .displayName(cr.getDisplayName())
          .company(cr.getCompany())
          .position(cr.getPosition())
          .phone(cr.getPhone())
          .mobile(cr.getMobile())
          .notes(cr.getNotes())
          .isFavorite(cr.getIsFavorite() != null && cr.getIsFavorite())
          .build();
      results.add(toResponse(emailContactRepository.save(contact)));
    }
    return results;
  }

  @Transactional
  public EmailContactResponse updateContact(UUID userId, UUID contactId, EmailContactRequest request) {
    EmailContact contact = emailContactRepository.findById(contactId)
        .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    if (!contact.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Contact does not belong to this user");
    }
    contact.setEmail(request.getEmail());
    contact.setFirstName(request.getFirstName());
    contact.setLastName(request.getLastName());
    contact.setDisplayName(request.getDisplayName());
    contact.setCompany(request.getCompany());
    contact.setPosition(request.getPosition());
    contact.setPhone(request.getPhone());
    contact.setMobile(request.getMobile());
    contact.setNotes(request.getNotes());
    contact.setIsFavorite(request.getIsFavorite() != null ? request.getIsFavorite() : contact.getIsFavorite());
    contact = emailContactRepository.save(contact);
    return toResponse(contact);
  }

  @Transactional
  public void deleteContact(UUID userId, UUID contactId) {
    EmailContact contact = emailContactRepository.findById(contactId)
        .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    if (!contact.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Contact does not belong to this user");
    }
    emailContactRepository.delete(contact);
  }

  public List<EmailContactResponse> autocomplete(UUID userId, String query) {
    return emailContactRepository.findByOwnerIdAndDisplayNameContainingIgnoreCase(userId, query)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<EmailContactResponse> getFavorites(UUID userId) {
    return emailContactRepository.findByOwnerIdAndIsFavoriteTrue(userId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  // Contact Groups
  public List<ContactGroupResponse> getGroups(UUID userId) {
    return contactGroupRepository.findByOwnerIdOrderByNameAsc(userId)
        .stream()
        .map(group -> {
          long count = contactGroupMemberRepository.findByGroupId(group.getId()).size();
          return ContactGroupResponse.builder()
              .id(group.getId())
              .ownerId(group.getOwner().getId())
              .name(group.getName())
              .description(group.getDescription())
              .color(group.getColor())
              .memberCount((int) count)
              .createdAt(group.getCreatedAt())
              .build();
        })
        .collect(Collectors.toList());
  }

  @Transactional
  public ContactGroupResponse createGroup(UUID userId, ContactGroupRequest request) {
    User owner = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    ContactGroup group = ContactGroup.builder()
        .owner(owner)
        .name(request.getName())
        .description(request.getDescription())
        .color(request.getColor())
        .build();
    group = contactGroupRepository.save(group);
    return ContactGroupResponse.builder()
        .id(group.getId())
        .ownerId(group.getOwner().getId())
        .name(group.getName())
        .description(group.getDescription())
        .color(group.getColor())
        .memberCount(0)
        .createdAt(group.getCreatedAt())
        .build();
  }

  @Transactional
  public ContactGroupResponse updateGroup(UUID userId, UUID groupId, ContactGroupRequest request) {
    ContactGroup group = contactGroupRepository.findById(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    if (!group.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Group does not belong to this user");
    }
    if (request.getName() != null) group.setName(request.getName());
    if (request.getDescription() != null) group.setDescription(request.getDescription());
    if (request.getColor() != null) group.setColor(request.getColor());
    group = contactGroupRepository.save(group);
    long count = contactGroupMemberRepository.findByGroupId(group.getId()).size();
    return ContactGroupResponse.builder()
        .id(group.getId())
        .ownerId(group.getOwner().getId())
        .name(group.getName())
        .description(group.getDescription())
        .color(group.getColor())
        .memberCount((int) count)
        .createdAt(group.getCreatedAt())
        .build();
  }

  @Transactional
  public void deleteGroup(UUID userId, UUID groupId) {
    ContactGroup group = contactGroupRepository.findById(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    if (!group.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Group does not belong to this user");
    }
    contactGroupRepository.delete(group);
  }

  @Transactional
  public void addContactToGroup(UUID userId, UUID groupId, UUID contactId) {
    ContactGroup group = contactGroupRepository.findById(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    if (!group.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Group does not belong to this user");
    }
    EmailContact contact = emailContactRepository.findById(contactId)
        .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    ContactGroupMember member = ContactGroupMember.builder()
        .group(group)
        .contact(contact)
        .build();
    contactGroupMemberRepository.save(member);
  }

  @Transactional
  public void removeContactFromGroup(UUID userId, UUID groupId, UUID contactId) {
    ContactGroup group = contactGroupRepository.findById(groupId)
        .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    if (!group.getOwner().getId().equals(userId)) {
      throw new BadRequestException("Group does not belong to this user");
    }
    contactGroupMemberRepository.deleteByGroupIdAndContactId(groupId, contactId);
  }

  private EmailContactResponse toResponse(EmailContact contact) {
    return EmailContactResponse.builder()
        .id(contact.getId())
        .ownerId(contact.getOwner().getId())
        .email(contact.getEmail())
        .firstName(contact.getFirstName())
        .lastName(contact.getLastName())
        .displayName(contact.getDisplayName())
        .company(contact.getCompany())
        .position(contact.getPosition())
        .phone(contact.getPhone())
        .mobile(contact.getMobile())
        .notes(contact.getNotes())
        .isFavorite(contact.getIsFavorite())
        .createdAt(contact.getCreatedAt())
        .build();
  }
}
