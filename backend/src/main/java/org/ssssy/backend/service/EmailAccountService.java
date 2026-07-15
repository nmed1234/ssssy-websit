package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailFolder;
import org.ssssy.backend.model.entity.EmailMessage;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmailAccountService {

  private final EmailAccountRepository emailAccountRepository;
  private final EmailFolderRepository emailFolderRepository;
  private final EmailMessageRepository emailMessageRepository;
  private final EmailAliasRepository emailAliasRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.email.default-quota:1073741824}")
  private long defaultQuota;

  @Transactional
  public EmailAccountResponse provisionAccount(UUID userId) {
    if (emailAccountRepository.findByUserId(userId).isPresent()) {
      throw new BadRequestException("User already has an email account");
    }
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String username = (user.getFirstNameEn() != null ? user.getFirstNameEn().toLowerCase() : "user")
        + "." + (user.getLastNameEn() != null ? user.getLastNameEn().toLowerCase() : String.valueOf(System.currentTimeMillis()));
    String domain = "ssssy.org.sy";
    String emailAddress = username + "@" + domain;
    String tempPassword = UUID.randomUUID().toString().substring(0, 12);

    EmailAccount account = EmailAccount.builder()
        .user(user)
        .emailAddress(emailAddress)
        .username(username)
        .passwordHash(passwordEncoder.encode(tempPassword))
        .displayName((user.getFirstNameEn() != null ? user.getFirstNameEn() : "") + " " + (user.getLastNameEn() != null ? user.getLastNameEn() : ""))
        .quotaBytes(defaultQuota)
        .usedBytes(0L)
        .isActive(true)
        .isVerified(false)
        .build();
    account = emailAccountRepository.save(account);

    createSystemFolders(account);

    return toResponse(account);
  }

  @Transactional
  public void createSystemFolders(EmailAccount account) {
    String[][] folders = {
        {"Inbox", "INBOX", "0"},
        {"Sent", "SENT", "1"},
        {"Drafts", "DRAFTS", "2"},
        {"Trash", "TRASH", "3"},
        {"Spam", "SPAM", "4"},
        {"Archive", "ARCHIVE", "5"}
    };
    for (String[] f : folders) {
      EmailFolder folder = EmailFolder.builder()
          .account(account)
          .name(f[0])
          .folderType(f[1])
          .systemFolder(true)
          .sortOrder(Integer.parseInt(f[2]))
          .unreadCount(0)
          .totalCount(0)
          .build();
      emailFolderRepository.save(folder);
    }
  }

  public EmailAccountResponse getMyAccount(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return toResponse(account);
  }

  public EmailAccountResponse getAccountById(UUID accountId) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return toResponse(account);
  }

  @Transactional
  public EmailAccountResponse updateAccount(UUID userId, EmailAccountRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    if (request.getDisplayName() != null) account.setDisplayName(request.getDisplayName());
    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    }
    account = emailAccountRepository.save(account);
    return toResponse(account);
  }

  @Transactional
  public void changePassword(UUID userId, String currentPassword, String newPassword) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    if (!passwordEncoder.matches(currentPassword, account.getPasswordHash())) {
      throw new BadRequestException("Current password is incorrect");
    }
    account.setPasswordHash(passwordEncoder.encode(newPassword));
    emailAccountRepository.save(account);
  }

  @Transactional
  public EmailAccountResponse createAccountByAdmin(EmailAccountCreateRequest request) {
    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    if (emailAccountRepository.findByUserId(request.getUserId()).isPresent()) {
      throw new BadRequestException("User already has an email account");
    }
    String username = (user.getFirstNameEn() != null ? user.getFirstNameEn().toLowerCase() : "user")
        + "." + (user.getLastNameEn() != null ? user.getLastNameEn().toLowerCase() : String.valueOf(System.currentTimeMillis()));
    String tempPassword = UUID.randomUUID().toString().substring(0, 12);
    EmailAccount account = EmailAccount.builder()
        .user(user)
        .emailAddress(username + "@ssssy.org.sy")
        .username(username)
        .passwordHash(passwordEncoder.encode(tempPassword))
        .displayName((user.getFirstNameEn() != null ? user.getFirstNameEn() : "") + " " + (user.getLastNameEn() != null ? user.getLastNameEn() : ""))
        .quotaBytes(request.getQuotaBytes() != null ? request.getQuotaBytes() : defaultQuota)
        .usedBytes(0L)
        .isActive(true)
        .isVerified(true)
        .build();
    account = emailAccountRepository.save(account);
    createSystemFolders(account);
    return toResponse(account);
  }

  @Transactional
  public EmailAccountResponse updateAccountByAdmin(UUID accountId, EmailAccountUpdateRequest request) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    if (request.getIsActive() != null) account.setIsActive(request.getIsActive());
    if (request.getQuotaBytes() != null) account.setQuotaBytes(request.getQuotaBytes());
    if (request.getDisplayName() != null) account.setDisplayName(request.getDisplayName());
    if (request.getForwardTo() != null) account.setForwardTo(request.getForwardTo());
    if (request.getForwardKeepCopy() != null) account.setForwardKeepCopy(request.getForwardKeepCopy());
    if (request.getSignature() != null) account.setSignature(request.getSignature());
    if (request.getAutoReplyEnabled() != null) account.setAutoReplyEnabled(request.getAutoReplyEnabled());
    if (request.getAutoReplySubject() != null) account.setAutoReplySubject(request.getAutoReplySubject());
    if (request.getAutoReplyBody() != null) account.setAutoReplyBody(request.getAutoReplyBody());
    account = emailAccountRepository.save(account);
    return toResponse(account);
  }

  @Transactional
  public void deleteAccountByAdmin(UUID accountId) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    emailAccountRepository.delete(account);
  }

  @Transactional
  public void resetPasswordByAdmin(UUID accountId, String newPassword) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    account.setPasswordHash(passwordEncoder.encode(newPassword));
    emailAccountRepository.save(account);
  }

  @Transactional
  public void bulkOperation(EmailBulkRequest request) {
    if (request.getAccountIds() == null) return;
    for (UUID id : request.getAccountIds()) {
      emailAccountRepository.findById(id).ifPresent(account -> {
        switch (request.getOperation()) {
          case "activate": account.setIsActive(true); break;
          case "deactivate": account.setIsActive(false); break;
          case "set_quota":
            if (request.getValue() != null) account.setQuotaBytes(Long.parseLong(request.getValue()));
            break;
        }
        emailAccountRepository.save(account);
      });
    }
  }

  public void deactivateAccount(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    account.setIsActive(false);
    emailAccountRepository.save(account);
  }

  public void activateAccount(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    account.setIsActive(true);
    emailAccountRepository.save(account);
  }

  public List<EmailAccountResponse> getAllAccounts() {
    return emailAccountRepository.findAll()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public void setQuota(UUID accountId, Long quotaBytes) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    account.setQuotaBytes(quotaBytes);
    emailAccountRepository.save(account);
  }

  @Transactional
  public void toggleActive(UUID accountId) {
    EmailAccount account = emailAccountRepository.findById(accountId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    account.setIsActive(!Boolean.TRUE.equals(account.getIsActive()));
    emailAccountRepository.save(account);
  }

  public EmailAdminStatsResponse getAdminStats() {
    long totalAccounts = emailAccountRepository.count();
    long activeAccounts = emailAccountRepository.countByIsActiveTrue();
    long totalUsedBytes = emailAccountRepository.findAll().stream()
        .mapToLong(a -> a.getUsedBytes() != null ? a.getUsedBytes() : 0L)
        .sum();
    return EmailAdminStatsResponse.builder()
        .totalAccounts(totalAccounts)
        .activeAccounts(activeAccounts)
        .totalUsedBytes(totalUsedBytes)
        .build();
  }

  public EmailQuotaResponse getQuotaInfo(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    long quota = account.getQuotaBytes() != null ? account.getQuotaBytes() : defaultQuota;
    long used = account.getUsedBytes() != null ? account.getUsedBytes() : 0L;
    return EmailQuotaResponse.builder()
        .quotaBytes(quota)
        .usedBytes(used)
        .usagePercent(quota > 0 ? (double) used / quota * 100 : 0)
        .isQuotaExceeded(used >= quota)
        .lastSyncAt(account.getLastSyncAt())
        .build();
  }

  public List<EmailAliasResponse> getMyAliases(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailAliasRepository.findByAccountId(account.getId())
        .stream()
        .map(a -> EmailAliasResponse.builder()
            .id(a.getId())
            .accountId(a.getAccount().getId())
            .aliasAddress(a.getAliasAddress())
            .isActive(a.getIsActive())
            .createdAt(a.getCreatedAt())
            .build())
        .collect(Collectors.toList());
  }

  public List<EmailStorageReportResponse> getStorageReport() {
    return emailAccountRepository.findAll().stream()
        .map(a -> {
          long quota = a.getQuotaBytes() != null ? a.getQuotaBytes() : defaultQuota;
          long used = a.getUsedBytes() != null ? a.getUsedBytes() : 0L;
          return EmailStorageReportResponse.builder()
              .accountId(a.getId())
              .emailAddress(a.getEmailAddress())
              .displayName(a.getDisplayName())
              .quotaBytes(quota)
              .usedBytes(used)
              .usagePercent(quota > 0 ? (double) used / quota * 100 : 0)
              .build();
        })
        .collect(Collectors.toList());
  }

  public Page<EmailMessageResponse> getBouncedMessages(Pageable pageable) {
    return emailMessageRepository.findByDeliveryStatus("FAILED", pageable)
        .map(m -> EmailMessageResponse.builder()
            .id(m.getId())
            .accountId(m.getAccount() != null ? m.getAccount().getId() : null)
            .senderAddress(m.getSenderAddress())
            .subject(m.getSubject())
            .deliveryStatus(m.getDeliveryStatus())
            .createdAt(m.getCreatedAt())
            .build());
  }

  private EmailAccountResponse toResponse(EmailAccount account) {
    return EmailAccountResponse.builder()
        .id(account.getId())
        .userId(account.getUser().getId())
        .emailAddress(account.getEmailAddress())
        .username(account.getUsername())
        .displayName(account.getDisplayName())
        .quotaBytes(account.getQuotaBytes())
        .usedBytes(account.getUsedBytes())
        .isActive(account.getIsActive())
        .isVerified(account.getIsVerified())
        .autoReplyEnabled(account.getAutoReplyEnabled())
        .autoReplySubject(account.getAutoReplySubject())
        .autoReplyBody(account.getAutoReplyBody())
        .forwardTo(account.getForwardTo())
        .forwardKeepCopy(account.getForwardKeepCopy())
        .signature(account.getSignature())
        .lastSyncAt(account.getLastSyncAt())
        .createdAt(account.getCreatedAt())
        .updatedAt(account.getUpdatedAt())
        .build();
  }
}
