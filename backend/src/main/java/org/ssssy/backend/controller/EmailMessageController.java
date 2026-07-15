package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.EmailAttachment;
import org.ssssy.backend.repository.EmailAttachmentRepository;
import org.ssssy.backend.service.EmailMessageService;
import org.ssssy.backend.service.EmailSendService;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/email/messages")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class EmailMessageController {

  private final EmailMessageService emailMessageService;
  private final EmailSendService emailSendService;
  private final EmailAttachmentRepository emailAttachmentRepository;

  @GetMapping
  public ResponseEntity<ApiResponse<Page<EmailMessageResponse>>> getMessages(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestParam UUID folderId,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getMessages(getUserId(userDetails), folderId, pageable)));
  }

  @GetMapping("/starred")
  public ResponseEntity<ApiResponse<Page<EmailMessageResponse>>> getStarredMessages(
      @AuthenticationPrincipal UserDetails userDetails,
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getStarredMessages(getUserId(userDetails), pageable)));
  }

  @GetMapping("/drafts")
  public ResponseEntity<ApiResponse<Page<EmailMessageResponse>>> getDrafts(
      @AuthenticationPrincipal UserDetails userDetails,
      @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getDrafts(getUserId(userDetails), pageable)));
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> getMessage(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getMessage(getUserId(userDetails), id)));
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<ApiResponse<Void>> markAsRead(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.markAsRead(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/{id}/star")
  public ResponseEntity<ApiResponse<Void>> toggleStar(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.toggleStar(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/{id}/flag")
  public ResponseEntity<ApiResponse<Void>> toggleFlag(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.toggleFlag(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PutMapping("/move")
  public ResponseEntity<ApiResponse<Void>> moveToFolder(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailMoveRequest request) {
    emailMessageService.moveToFolder(getUserId(userDetails), request);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/delete")
  public ResponseEntity<ApiResponse<Void>> deleteMessages(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody List<UUID> messageIds) {
    emailMessageService.deleteMessages(getUserId(userDetails), messageIds);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @DeleteMapping("/draft/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteDraft(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.deleteDraft(getUserId(userDetails), id);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/threads")
  public ResponseEntity<ApiResponse<List<EmailMessageResponse>>> getThreads(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getThreads(getUserId(userDetails))));
  }

  @GetMapping("/thread/{threadId}")
  public ResponseEntity<ApiResponse<List<EmailMessageResponse>>> getThread(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID threadId) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getThread(getUserId(userDetails), threadId)));
  }

  @PostMapping("/{id}/reply-all")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> replyAll(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.replyAll(getUserId(userDetails), id, request)));
  }

  @PostMapping("/{id}/forward")
  public ResponseEntity<ApiResponse<EmailMessageResponse>> forward(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @RequestBody EmailMessageRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(emailSendService.forward(getUserId(userDetails), id, request)));
  }

  @PostMapping("/{id}/archive")
  public ResponseEntity<ApiResponse<Void>> archive(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.moveToFolderByType(getUserId(userDetails), id, "ARCHIVE");
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/{id}/spam")
  public ResponseEntity<ApiResponse<Void>> markSpam(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.moveToFolderByType(getUserId(userDetails), id, "SPAM");
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/{id}/untrash")
  public ResponseEntity<ApiResponse<Void>> untrash(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    emailMessageService.moveToFolderByType(getUserId(userDetails), id, "INBOX");
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PostMapping("/batch-action")
  public ResponseEntity<ApiResponse<Void>> batchAction(
      @AuthenticationPrincipal UserDetails userDetails,
      @RequestBody EmailBatchActionRequest request) {
    emailMessageService.batchAction(getUserId(userDetails), request);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @GetMapping("/{id}/attachments")
  public ResponseEntity<ApiResponse<List<EmailAttachmentResponse>>> getAttachments(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(emailMessageService.getAttachments(getUserId(userDetails), id)));
  }

  @GetMapping("/{id}/attachments/{attId}")
  public ResponseEntity<Resource> downloadAttachment(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @PathVariable UUID attId) {
    EmailAttachment attachment = emailMessageService.getAttachment(getUserId(userDetails), id, attId);
    try {
      Path filePath = Path.of(attachment.getStoragePath());
      Resource resource = new UrlResource(filePath.toUri());
      if (resource.exists() && resource.isReadable()) {
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(attachment.getMimeType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFilename() + "\"")
            .body(resource);
      }
    } catch (MalformedURLException e) { /* fall through */ }
    return ResponseEntity.notFound().build();
  }

  @GetMapping("/{id}/attachments/{attId}/preview")
  public ResponseEntity<Resource> previewAttachment(
      @AuthenticationPrincipal UserDetails userDetails,
      @PathVariable UUID id,
      @PathVariable UUID attId) {
    EmailAttachment attachment = emailMessageService.getAttachment(getUserId(userDetails), id, attId);
    try {
      Path filePath = Path.of(attachment.getStoragePath());
      Resource resource = new UrlResource(filePath.toUri());
      if (resource.exists() && resource.isReadable()) {
        String contentType = attachment.getMimeType();
        if (contentType.startsWith("image/") || contentType.startsWith("text/") || contentType.equals("application/pdf")) {
          return ResponseEntity.ok()
              .contentType(MediaType.parseMediaType(contentType))
              .body(resource);
        }
      }
    } catch (MalformedURLException e) { /* fall through */ }
    return ResponseEntity.notFound().build();
  }

  private UUID getUserId(UserDetails userDetails) {
    return UUID.fromString(userDetails.getUsername());
  }
}
