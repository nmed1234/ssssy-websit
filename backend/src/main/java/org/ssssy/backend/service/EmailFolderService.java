package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.EmailFolderCountsResponse;
import org.ssssy.backend.model.dto.EmailFolderRequest;
import org.ssssy.backend.model.dto.EmailFolderResponse;
import org.ssssy.backend.model.entity.EmailAccount;
import org.ssssy.backend.model.entity.EmailFolder;
import org.ssssy.backend.repository.EmailAccountRepository;
import org.ssssy.backend.repository.EmailFolderRepository;
import org.ssssy.backend.repository.EmailMessageRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class EmailFolderService {

  private final EmailFolderRepository emailFolderRepository;
  private final EmailAccountRepository emailAccountRepository;
  private final EmailMessageRepository emailMessageRepository;

  public List<EmailFolderResponse> getFolders(UUID userId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    return emailFolderRepository.findByAccountIdOrderBySortOrderAsc(account.getId())
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public EmailFolderResponse createFolder(UUID userId, EmailFolderRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    if (emailFolderRepository.findByAccountIdAndFolderType(account.getId(), request.getName()).isPresent()) {
      throw new BadRequestException("Folder already exists");
    }
    EmailFolder folder = EmailFolder.builder()
        .account(account)
        .name(request.getName())
        .folderType("CUSTOM")
        .systemFolder(false)
        .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 99)
        .unreadCount(0)
        .totalCount(0)
        .build();
    if (request.getParentId() != null) {
      EmailFolder parent = emailFolderRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
      folder.setParent(parent);
    }
    folder = emailFolderRepository.save(folder);
    return toResponse(folder);
  }

  @Transactional
  public EmailFolderResponse updateFolder(UUID userId, UUID folderId, EmailFolderRequest request) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder folder = emailFolderRepository.findById(folderId)
        .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Folder does not belong to this account");
    }
    if (request.getName() != null) folder.setName(request.getName());
    if (request.getSortOrder() != null) folder.setSortOrder(request.getSortOrder());
    if (request.getParentId() != null) {
      if (request.getParentId().equals(folderId)) throw new BadRequestException("Cannot set self as parent");
      EmailFolder parent = emailFolderRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
      folder.setParent(parent);
    }
    folder = emailFolderRepository.save(folder);
    return toResponse(folder);
  }

  @Transactional
  public void deleteFolder(UUID userId, UUID folderId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder folder = emailFolderRepository.findById(folderId)
        .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Folder does not belong to this account");
    }
    if (folder.getSystemFolder()) {
      throw new BadRequestException("Cannot delete system folder");
    }
    emailFolderRepository.delete(folder);
  }

  public EmailFolderResponse getFolderByType(UUID userId, String folderType) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder folder = emailFolderRepository.findByAccountIdAndFolderType(account.getId(), folderType)
        .orElseThrow(() -> new ResourceNotFoundException("Folder not found: " + folderType));
    return toResponse(folder);
  }

  @Transactional
  public void reorderFolders(UUID userId, List<UUID> folderIds) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    IntStream.range(0, folderIds.size()).forEach(i -> {
      UUID fid = folderIds.get(i);
      emailFolderRepository.findById(fid).ifPresent(f -> {
        if (f.getAccount().getId().equals(account.getId())) {
          f.setSortOrder(i);
          emailFolderRepository.save(f);
        }
      });
    });
  }

  public EmailFolderCountsResponse getFolderCounts(UUID userId, UUID folderId) {
    EmailAccount account = emailAccountRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Email account not found"));
    EmailFolder folder = emailFolderRepository.findById(folderId)
        .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getAccount().getId().equals(account.getId())) {
      throw new BadRequestException("Folder does not belong to this account");
    }
    long total = emailMessageRepository.countByFolderId(folderId);
    long unread = emailMessageRepository.countByFolderIdAndIsReadFalse(folderId);
    return EmailFolderCountsResponse.builder()
        .folderId(folder.getId())
        .folderName(folder.getName())
        .totalCount((int) total)
        .unreadCount((int) unread)
        .build();
  }

  private EmailFolderResponse toResponse(EmailFolder folder) {
    return EmailFolderResponse.builder()
        .id(folder.getId())
        .accountId(folder.getAccount().getId())
        .parentId(folder.getParent() != null ? folder.getParent().getId() : null)
        .name(folder.getName())
        .folderType(folder.getFolderType())
        .systemFolder(folder.getSystemFolder())
        .sortOrder(folder.getSortOrder())
        .unreadCount(folder.getUnreadCount())
        .totalCount(folder.getTotalCount())
        .createdAt(folder.getCreatedAt())
        .build();
  }
}
