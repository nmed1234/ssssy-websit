package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EmailAliasRequest;
import org.ssssy.backend.model.dto.EmailAliasResponse;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailAlias;
import org.ssssy.backend.repository.EmailAccountRepository;
import org.ssssy.backend.repository.EmailAliasRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailAliasService {

  private final EmailAliasRepository emailAliasRepository;
  private final EmailAccountRepository emailAccountRepository;

  public List<EmailAliasResponse> getAllAliases() {
    return emailAliasRepository.findAll()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<EmailAliasResponse> getAliasesByAccount(UUID accountId) {
    return emailAliasRepository.findByAccountId(accountId)
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public EmailAliasResponse getAlias(UUID id) {
    EmailAlias alias = emailAliasRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Alias not found: " + id));
    return toResponse(alias);
  }

  @Transactional
  public EmailAliasResponse createAlias(EmailAliasRequest request) {
    if (request.getAccountId() == null) {
      throw new BadRequestException("Account ID is required");
    }
    EmailAccount account = emailAccountRepository.findById(request.getAccountId())
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailAlias alias = EmailAlias.builder()
        .account(account)
        .aliasAddress(request.getAliasAddress())
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .build();
    alias = emailAliasRepository.save(alias);
    return toResponse(alias);
  }

  @Transactional
  public void deleteAlias(UUID id) {
    if (!emailAliasRepository.existsById(id)) {
      throw new ResourceNotFoundException("Alias not found: " + id);
    }
    emailAliasRepository.deleteById(id);
  }

  @Transactional
  public EmailAliasResponse toggleAlias(UUID id) {
    EmailAlias alias = emailAliasRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Alias not found: " + id));
    alias.setIsActive(!Boolean.TRUE.equals(alias.getIsActive()));
    alias = emailAliasRepository.save(alias);
    return toResponse(alias);
  }

  private EmailAliasResponse toResponse(EmailAlias alias) {
    return EmailAliasResponse.builder()
        .id(alias.getId())
        .accountId(alias.getAccount().getId())
        .emailAddress(alias.getAccount().getEmailAddress())
        .aliasAddress(alias.getAliasAddress())
        .isActive(alias.getIsActive())
        .createdAt(alias.getCreatedAt())
        .build();
  }
}
