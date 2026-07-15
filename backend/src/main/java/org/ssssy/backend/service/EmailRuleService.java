package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EmailRuleRequest;
import org.ssssy.backend.model.dto.EmailRuleResponse;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailRule;
import org.ssssy.backend.repository.EmailAccountRepository;
import org.ssssy.backend.repository.EmailRuleRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class EmailRuleService {

  private final EmailRuleRepository emailRuleRepository;
  private final EmailAccountRepository emailAccountRepository;

  public List<EmailRuleResponse> getRules(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailRuleRepository.findByAccountIdOrderByOrderIndexAsc(account.getId())
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public EmailRuleResponse createRule(UUID userId, EmailRuleRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailRule rule = EmailRule.builder()
        .account(account)
        .name(request.getName())
        .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
        .isEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : true)
        .stopProcessing(request.getStopProcessing() != null ? request.getStopProcessing() : false)
        .matchAll(request.getMatchAll() != null ? request.getMatchAll() : true)
        .conditions(request.getConditions() != null ? request.getConditions() : "[]")
        .actions(request.getActions() != null ? request.getActions() : "[]")
        .build();
    rule = emailRuleRepository.save(rule);
    return toResponse(rule);
  }

  @Transactional
  public EmailRuleResponse updateRule(UUID userId, UUID ruleId, EmailRuleRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailRule rule = emailRuleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
    if (!rule.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Rule does not belong to this account");
    }
    rule.setName(request.getName());
    rule.setOrderIndex(request.getOrderIndex());
    rule.setIsEnabled(request.getIsEnabled());
    rule.setStopProcessing(request.getStopProcessing());
    rule.setMatchAll(request.getMatchAll());
    rule.setConditions(request.getConditions());
    rule.setActions(request.getActions());
    rule = emailRuleRepository.save(rule);
    return toResponse(rule);
  }

  @Transactional
  public void deleteRule(UUID userId, UUID ruleId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailRule rule = emailRuleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
    if (!rule.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Rule does not belong to this account");
    }
    emailRuleRepository.delete(rule);
  }

  @Transactional
  public void toggleRule(UUID userId, UUID ruleId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailRule rule = emailRuleRepository.findById(ruleId)
        .orElseThrow(() -> new ResourceNotFoundException("Rule not found"));
    if (!rule.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Rule does not belong to this account");
    }
    rule.setIsEnabled(!Boolean.TRUE.equals(rule.getIsEnabled()));
    emailRuleRepository.save(rule);
  }

  @Transactional
  public void reorderRules(UUID userId, List<UUID> ruleIds) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    IntStream.range(0, ruleIds.size()).forEach(i -> {
      UUID rid = ruleIds.get(i);
      emailRuleRepository.findById(rid).ifPresent(r -> {
        if (r.getAccount().getId().equals(account.getId())) {
          r.setOrderIndex(i);
          emailRuleRepository.save(r);
        }
      });
    });
  }

  private EmailRuleResponse toResponse(EmailRule rule) {
    return EmailRuleResponse.builder()
        .id(rule.getId())
        .accountId(rule.getAccount().getId())
        .name(rule.getName())
        .orderIndex(rule.getOrderIndex())
        .isEnabled(rule.getIsEnabled())
        .stopProcessing(rule.getStopProcessing())
        .matchAll(rule.getMatchAll())
        .conditions(rule.getConditions())
        .actions(rule.getActions())
        .createdAt(rule.getCreatedAt())
        .build();
  }
}
