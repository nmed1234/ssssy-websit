package org.ssssy.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailRuleExecutionService {

  private final EmailRuleRepository emailRuleRepository;
  private final EmailMessageRepository emailMessageRepository;
  private final EmailFolderRepository emailFolderRepository;
  private final ObjectMapper objectMapper;

  @Transactional
  public void applyRulesOnReceive(EmailMessage message) {
    if (message.getAccount() == null) return;
    List<EmailRule> rules = emailRuleRepository
        .findByAccountIdOrderByOrderIndexAsc(message.getAccount().getId());

    for (EmailRule rule : rules) {
      if (!Boolean.TRUE.equals(rule.getIsEnabled())) continue;

      boolean matched = evaluateConditions(rule, message);
      if (matched) {
        executeActions(rule, message);
        if (Boolean.TRUE.equals(rule.getStopProcessing())) break;
      }
    }

    emailMessageRepository.save(message);
  }

  @Transactional
  public void applyRulesOnSend(EmailMessage message) {
    if (message.getAccount() == null) return;
    List<EmailRule> rules = emailRuleRepository
        .findByAccountIdOrderByOrderIndexAsc(message.getAccount().getId());

    for (EmailRule rule : rules) {
      if (!Boolean.TRUE.equals(rule.getIsEnabled())) continue;
      if (!"SEND".equalsIgnoreCase(getRuleTrigger(rule))) continue;

      boolean matched = evaluateConditions(rule, message);
      if (matched) {
        executeActions(rule, message);
        if (Boolean.TRUE.equals(rule.getStopProcessing())) break;
      }
    }

    emailMessageRepository.save(message);
  }

  private String getRuleTrigger(EmailRule rule) {
    try {
      List<Map<String, Object>> conditions = objectMapper.readValue(
          rule.getConditions(), new TypeReference<List<Map<String, Object>>>() {});
      for (Map<String, Object> cond : conditions) {
        if ("trigger".equals(cond.get("field"))) {
          return String.valueOf(cond.get("value"));
        }
      }
    } catch (Exception e) {
      // ignore parse errors
    }
    return "RECEIVE";
  }

  private boolean evaluateConditions(EmailRule rule, EmailMessage message) {
    try {
      List<Map<String, Object>> conditions = objectMapper.readValue(
          rule.getConditions(), new TypeReference<List<Map<String, Object>>>() {});
      if (conditions.isEmpty()) return true;

      boolean matchAll = Boolean.TRUE.equals(rule.getMatchAll());

      for (Map<String, Object> cond : conditions) {
        String field = String.valueOf(cond.get("field"));
        String operator = String.valueOf(cond.get("operator"));
        String value = String.valueOf(cond.get("value"));
        String actual = getFieldValue(message, field);

        boolean matched = compareValues(actual, operator, value);
        if (matchAll && !matched) return false;
        if (!matchAll && matched) return true;
      }

      return matchAll;
    } catch (Exception e) {
      return false;
    }
  }

  private String getFieldValue(EmailMessage message, String field) {
    switch (field.toLowerCase()) {
      case "from": case "sender": return message.getSenderAddress() != null ? message.getSenderAddress() : "";
      case "subject": return message.getSubject() != null ? message.getSubject() : "";
      case "to": return extractAddresses("TO", message.getId());
      case "has_attachments": return String.valueOf(Boolean.TRUE.equals(message.getHasAttachments()));
      case "priority": return message.getPriority() != null ? message.getPriority() : "NORMAL";
      default: return "";
    }
  }

  private String extractAddresses(String type, UUID messageId) {
    return ""; // Simplified; would query recipients
  }

  private boolean compareValues(String actual, String operator, String expected) {
    return switch (operator.toLowerCase()) {
      case "contains" -> actual.toLowerCase().contains(expected.toLowerCase());
      case "equals" -> actual.equalsIgnoreCase(expected);
      case "not_equals" -> !actual.equalsIgnoreCase(expected);
      case "starts_with" -> actual.toLowerCase().startsWith(expected.toLowerCase());
      case "ends_with" -> actual.toLowerCase().endsWith(expected.toLowerCase());
      case "matches" -> actual.matches(expected);
      default -> false;
    };
  }

  private void executeActions(EmailRule rule, EmailMessage message) {
    try {
      List<Map<String, Object>> actions = objectMapper.readValue(
          rule.getActions(), new TypeReference<List<Map<String, Object>>>() {});
      for (Map<String, Object> action : actions) {
        String type = String.valueOf(action.get("type"));
        String value = String.valueOf(action.get("value"));
        executeAction(type, value, message);
      }
    } catch (Exception e) {
      // ignore action errors
    }
  }

  private void executeAction(String type, String value, EmailMessage message) {
    switch (type.toLowerCase()) {
      case "move_to_folder" -> moveToFolder(message, value);
      case "mark_as_read" -> message.setIsRead(true);
      case "mark_as_flagged" -> message.setIsFlagged(true);
      case "mark_as_starred" -> message.setIsStarred(true);
      case "delete" -> message.setDeliveryStatus("DELETED");
      case "forward" -> markForForward(message, value);
      case "auto_reply" -> markForAutoReply(message);
    }
  }

  private void moveToFolder(EmailMessage message, String folderName) {
    if (message.getAccount() == null) return;
    emailFolderRepository.findByAccountIdAndFolderType(message.getAccount().getId(), folderName)
        .ifPresent(folder -> {
          message.setFolder(folder);
          emailMessageRepository.save(message);
        });
  }

  private void markForForward(EmailMessage message, String address) {
    // Placeholder: mark message for forwarding logic
  }

  private void markForAutoReply(EmailMessage message) {
    // Placeholder: trigger auto-reply sending
  }
}
