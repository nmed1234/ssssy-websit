package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.CrmContactRequest;
import org.ssssy.backend.model.dto.CrmContactResponse;
import org.ssssy.backend.service.CrmContactService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/crm")
@RequiredArgsConstructor
public class CrmContactController {

    private final CrmContactService crmContactService;

    @GetMapping("/contacts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CrmContactResponse>>> searchContacts(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) String contactType,
        @RequestParam(required = false) String relationshipLevel,
        Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
            crmContactService.searchContacts(query, contactType, relationshipLevel, pageable)
                .map(this::toResponse)));
    }

    @GetMapping("/contacts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CrmContactResponse>> getContact(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(toResponse(crmContactService.getContact(id))));
    }

    @PostMapping("/contacts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CrmContactResponse>> createContact(
        @Valid @RequestBody CrmContactRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
            toResponse(crmContactService.createContact(request, UUID.fromString(userDetails.getUsername())))));
    }

    @PutMapping("/contacts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CrmContactResponse>> updateContact(
        @PathVariable UUID id,
        @Valid @RequestBody CrmContactRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(
            toResponse(crmContactService.updateContact(id, request, UUID.fromString(userDetails.getUsername())))));
    }

    @DeleteMapping("/contacts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteContact(@PathVariable UUID id) {
        crmContactService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/contacts/count/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getActiveContactCount() {
        return ResponseEntity.ok(ApiResponse.ok(crmContactService.getActiveContactCount()));
    }

    @GetMapping("/contacts/all/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CrmContactResponse>>> getAllActiveContacts() {
        List<CrmContactResponse> contacts = crmContactService.getAllActiveContacts().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(
            new PageImpl<>(contacts)));
    }

    private CrmContactResponse toResponse(org.ssssy.backend.model.entity.CrmContact contact) {
        return CrmContactResponse.builder()
            .id(contact.getId())
            .firstName(contact.getFirstName())
            .lastName(contact.getLastName())
            .email(contact.getEmail())
            .phone(contact.getPhone())
            .organization(contact.getOrganization())
            .position(contact.getPosition())
            .contactType(contact.getContactType())
            .relationshipLevel(contact.getRelationshipLevel())
            .notes(contact.getNotes())
            .source(contact.getSource())
            .isPrimary(contact.getIsPrimary())
            .isActive(contact.getIsActive())
            .lastContactAt(contact.getLastContactAt() != null ? contact.getLastContactAt().toString() : null)
            .nextFollowupAt(contact.getNextFollowupAt() != null ? contact.getNextFollowupAt().toString() : null)
            .tags(contact.getTags())
            .preferences(contact.getPreferences())
            .createdAt(contact.getCreatedAt() != null ? contact.getCreatedAt().toString() : null)
            .updatedAt(contact.getUpdatedAt() != null ? contact.getUpdatedAt().toString() : null)
            .build();
    }
}