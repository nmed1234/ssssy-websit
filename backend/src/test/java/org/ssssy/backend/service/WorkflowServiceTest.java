package org.ssssy.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.ssssy.backend.audit.AuditService;
import org.ssssy.backend.exception.WorkflowException;
import org.ssssy.backend.model.dto.ContentResponse;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkflowServiceTest {

    @Mock private ContentItemRepository contentItemRepository;
    @Mock private ContentVersionRepository contentVersionRepository;
    @Mock private WorkflowLogRepository workflowLogRepository;
    @Mock private UserRepository userRepository;
    @Mock private ContentService contentService;
    @Mock private NotificationService notificationService;
    @Mock private AuditService auditService;
    @Mock private JavaMailSender mailSender;

    @InjectMocks
    private WorkflowService workflowService;

    private User mockUser(UUID id) {
        return User.builder()
                .id(id).username("user").email("user@test.com")
                .firstNameEn("Test").lastNameEn("User").build();
    }

    private ContentItem mockContent(UUID id, String status) {
        User author = mockUser(UUID.randomUUID());
        return ContentItem.builder()
                .id(id).titleEn("Test Content").slug("test").status(status)
                .author(author).version(1).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void submit_fromDraft_succeeds() {
        UUID contentId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ContentItem item = mockContent(contentId, "DRAFT");
        User user = item.getAuthor();
        user.setId(userId);

        when(contentItemRepository.findById(contentId)).thenReturn(Optional.of(item));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(contentItemRepository.save(any())).thenReturn(item);
        when(contentVersionRepository.save(any())).thenReturn(null);
        when(contentService.toResponse(any())).thenReturn(new ContentResponse());

        ContentResponse result = workflowService.submit(contentId, userId, "Ready for review");

        assertNotNull(result);
        verify(contentItemRepository).save(any());
        verify(workflowLogRepository).save(any());
    }

    @Test
    void submit_fromPublished_throwsWorkflowException() {
        UUID contentId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ContentItem item = mockContent(contentId, "PUBLISHED");
        User user = item.getAuthor();
        user.setId(userId);

        when(contentItemRepository.findById(contentId)).thenReturn(Optional.of(item));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(WorkflowException.class, () -> workflowService.submit(contentId, userId, null));
    }

    @Test
    void approve_fromInReview_succeeds() {
        UUID contentId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();
        ContentItem item = mockContent(contentId, "IN_REVIEW");
        User reviewer = mockUser(reviewerId);
        item.setReviewer(reviewer);

        when(contentItemRepository.findById(contentId)).thenReturn(Optional.of(item));
        when(userRepository.findById(reviewerId)).thenReturn(Optional.of(reviewer));
        when(contentItemRepository.save(any())).thenReturn(item);
        when(contentService.toResponse(any())).thenReturn(new ContentResponse());
        when(mailSender.createMimeMessage()).thenReturn(mock(MimeMessage.class));

        ContentResponse result = workflowService.approve(contentId, reviewerId, "Looks good");

        assertNotNull(result);
        verify(notificationService).notifyWorkflowApproved(any(), any());
    }

    @Test
    void requestRevision_withoutComments_throwsBadRequestException() {
        UUID contentId = UUID.randomUUID();
        UUID reviewerId = UUID.randomUUID();

        assertThrows(org.ssssy.backend.exception.BadRequestException.class,
                () -> workflowService.requestRevision(contentId, reviewerId, ""));
    }
}
