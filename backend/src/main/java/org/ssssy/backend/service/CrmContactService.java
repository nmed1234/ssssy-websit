package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.CrmContactRequest;
import org.ssssy.backend.model.entity.CrmContact;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.CrmContactRepository;
import org.ssssy.backend.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CrmContactService {

  private final CrmContactRepository crmContactRepository;
  private final UserRepository userRepository;

  public Page<CrmContact> searchContacts(String query, String contactType, String relationshipLevel, Pageable pageable) {
    return crmContactRepository.searchContacts(query, contactType, relationshipLevel, pageable);
  }

  public CrmContact getContact(UUID id) {
    return crmContactRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("CRM contact not found: " + id));
  }

  @Transactional
  public CrmContact createContact(CrmContactRequest request, UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (crmContactRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new BadRequestException("Email already exists");
    }

    CrmContact contact = CrmContact.builder()
        .user(user)
        .createdBy(user)
        .build();

    applyRequestFields(contact, request);

    return crmContactRepository.save(contact);
  }

  @Transactional
  public CrmContact updateContact(UUID id, CrmContactRequest request, UUID userId) {
    CrmContact contact = crmContactRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("CRM contact not found: " + id));

    if (crmContactRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
      throw new BadRequestException("Email already exists");
    }

    applyRequestFields(contact, request);

    return crmContactRepository.save(contact);
  }

  private void applyRequestFields(CrmContact contact, CrmContactRequest request) {
    contact.setFirstName(request.getFirstName());
    contact.setLastName(request.getLastName());
    contact.setEmail(request.getEmail());
    contact.setPhone(request.getPhone());
    contact.setOrganization(request.getOrganization());
    contact.setPosition(request.getPosition());
    contact.setContactType(request.getContactType());
    contact.setRelationshipLevel(request.getRelationshipLevel());
    contact.setNotes(request.getNotes());
    contact.setSource(request.getSource());
    contact.setIsPrimary(request.getIsPrimary() != null && request.getIsPrimary());
    contact.setIsActive(request.getIsActive() != null && request.getIsActive());
    contact.setLastContactAt(request.getLastContactAt() != null ? 
        java.time.LocalDateTime.parse(request.getLastContactAt()) : null);
    contact.setNextFollowupAt(request.getNextFollowupAt() != null ? 
        java.time.LocalDateTime.parse(request.getNextFollowupAt()) : null);
    contact.setTags(request.getTags());
    contact.setPreferences(request.getPreferences());
  }

  @Transactional
  public void deleteContact(UUID id) {
    if (!crmContactRepository.existsById(id)) {
      throw new ResourceNotFoundException("CRM contact not found: " + id);
    }
    crmContactRepository.deleteById(id);
  }

  public long getActiveContactCount() {
    return crmContactRepository.countByIsActiveTrue();
  }

  public List<CrmContact> getAllActiveContacts() {
    return crmContactRepository.findByIsActiveTrue();
  }
}
