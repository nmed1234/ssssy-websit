package org.ssssy.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.InsufficientPermissionsException;
import org.ssssy.backend.exception.InvalidStateTransitionException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.WorkflowTransitionResult;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.model.entity.PageAuditTrail;
import org.ssssy.backend.model.entity.PageWorkflowTransition;
import org.ssssy.backend.model.entity.Role;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.PageAuditTrailRepository;
import org.ssssy.backend.repository.PageRepository;
import org.ssssy.backend.repository.PageWorkflowTransitionRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link PageWorkflowService}.
 *
 * Validates: Requirements 9.2–9.10
 */
@ExtendWith(MockitoExtension.class)
class PageWorkflowServiceTest {

    @Mock
    PageRepository pageRepository;

    @Mock
    PageWorkflowTransitionRepository transitionRepository;

    @Mock
    PageAuditTrailRepository auditTrailRepository;

    @Mock
    PageWorkflowEmailService emailService;

    @InjectMocks
    PageWorkflowService pageWorkflowService;

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Page buildPage(UUID id, String workflowStatus) {
        Role role = Role.builder().name("EDITOR").build();
        User author = User.builder()
                .id(UUID.randomUUID())
                .username("author")
                .email("author@ssssy.org")
                .role(role)
                .build();

        Page page = new Page();
        page.setId(id);
        page.setWorkflowStatus(workflowStatus);
        page.setIsPublished(false);
        page.setAuthor(author);
        page.setTitleEn("Test Page");
        page.setTitleAr("صفحة تجريبية");
        page.setSlug("test-page");
        return page;
    }

    private User buildUser(String roleName) {
        Role role = Role.builder().name(roleName).build();
        return User.builder()
                .id(UUID.randomUUID())
                .username(roleName.toLowerCase())
                .email(roleName.toLowerCase() + "@ssssy.org")
                .role(role)
                .build();
    }

    private void stubPageFound(UUID pageId, String workflowStatus) {
        Page page = buildPage(pageId, workflowStatus);
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        when(pageRepository.save(any(Page.class))).thenAnswer(inv -> inv.getArgument(0));
        when(transitionRepository.save(any(PageWorkflowTransition.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(auditTrailRepository.save(any(PageAuditTrail.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    // -------------------------------------------------------------------------
    // 1. DRAFT → REVIEW with EDITOR role
    // -------------------------------------------------------------------------

    @Test
    void validTransition_DraftToReview_EditorRole_shouldSucceed() {
        UUID pageId = UUID.randomUUID();
        stubPageFound(pageId, "DRAFT");
        User editor = buildUser("EDITOR");

        WorkflowTransitionResult result = pageWorkflowService.transition(pageId, "REVIEW", editor, null);

        assertThat(result.fromState()).isEqualTo("DRAFT");
        assertThat(result.toState()).isEqualTo("REVIEW");
        assertThat(result.pageId()).isEqualTo(pageId);

        verify(pageRepository, times(1)).save(any(Page.class));
        verify(transitionRepository, times(1)).save(any(PageWorkflowTransition.class));
        verify(auditTrailRepository, times(1)).save(any(PageAuditTrail.class));
    }

    // -------------------------------------------------------------------------
    // 2. REVIEW → APPROVED with PUBLISHER role
    // -------------------------------------------------------------------------

    @Test
    void validTransition_ReviewToApproved_PublisherRole_shouldSucceed() {
        UUID pageId = UUID.randomUUID();
        stubPageFound(pageId, "REVIEW");
        User publisher = buildUser("PUBLISHER");

        WorkflowTransitionResult result = pageWorkflowService.transition(pageId, "APPROVED", publisher, null);

        assertThat(result.toState()).isEqualTo("APPROVED");

        ArgumentCaptor<Page> pageCaptor = ArgumentCaptor.forClass(Page.class);
        verify(pageRepository).save(pageCaptor.capture());
        assertThat(pageCaptor.getValue().getWorkflowStatus()).isEqualTo("APPROVED");
    }

    // -------------------------------------------------------------------------
    // 3. APPROVED → PUBLISHED with ADMIN role — isPublished must become true
    // -------------------------------------------------------------------------

    @Test
    void validTransition_ApprovedToPublished_AdminRole_shouldSucceed() {
        UUID pageId = UUID.randomUUID();
        stubPageFound(pageId, "APPROVED");
        User admin = buildUser("ADMIN");

        WorkflowTransitionResult result = pageWorkflowService.transition(pageId, "PUBLISHED", admin, null);

        assertThat(result.toState()).isEqualTo("PUBLISHED");

        ArgumentCaptor<Page> pageCaptor = ArgumentCaptor.forClass(Page.class);
        verify(pageRepository).save(pageCaptor.capture());
        Page saved = pageCaptor.getValue();
        assertThat(saved.getWorkflowStatus()).isEqualTo("PUBLISHED");
        assertThat(saved.getIsPublished()).isTrue();
    }

    // -------------------------------------------------------------------------
    // 4. REVIEW → DRAFT (rejection) with notes
    // -------------------------------------------------------------------------

    @Test
    void validRejection_ReviewToDraft_withNotes_shouldSucceed() {
        UUID pageId = UUID.randomUUID();
        stubPageFound(pageId, "REVIEW");
        User publisher = buildUser("PUBLISHER");

        WorkflowTransitionResult result = pageWorkflowService.transition(
                pageId, "DRAFT", publisher, "Content needs more citations.");

        assertThat(result.fromState()).isEqualTo("REVIEW");
        assertThat(result.toState()).isEqualTo("DRAFT");

        ArgumentCaptor<Page> pageCaptor = ArgumentCaptor.forClass(Page.class);
        verify(pageRepository).save(pageCaptor.capture());
        assertThat(pageCaptor.getValue().getWorkflowStatus()).isEqualTo("DRAFT");
    }

    // -------------------------------------------------------------------------
    // 5. Wrong source state → 400
    // -------------------------------------------------------------------------

    @Test
    void invalidTransition_wrongSourceState_shouldThrow400() {
        UUID pageId = UUID.randomUUID();
        // Page is DRAFT but we're requesting APPROVED (no such transition)
        Page page = buildPage(pageId, "DRAFT");
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "APPROVED", buildUser("ADMIN"), null))
                .isInstanceOf(InvalidStateTransitionException.class);
    }

    // -------------------------------------------------------------------------
    // 6. Wrong role for the transition → 403
    // -------------------------------------------------------------------------

    @Test
    void invalidRole_EditorTryingToApprove_shouldThrow403() {
        UUID pageId = UUID.randomUUID();
        Page page = buildPage(pageId, "REVIEW");
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        User editor = buildUser("EDITOR");

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "APPROVED", editor, null))
                .isInstanceOf(InsufficientPermissionsException.class);
    }

    // -------------------------------------------------------------------------
    // 7. Rejection without notes → 400
    // -------------------------------------------------------------------------

    @Test
    void rejection_withoutNotes_shouldThrow400() {
        UUID pageId = UUID.randomUUID();
        Page page = buildPage(pageId, "REVIEW");
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        User publisher = buildUser("PUBLISHER");

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "DRAFT", publisher, null))
                .isInstanceOf(BadRequestException.class);
    }

    // -------------------------------------------------------------------------
    // 8. Rejection with blank notes → 400
    // -------------------------------------------------------------------------

    @Test
    void rejection_withBlankNotes_shouldThrow400() {
        UUID pageId = UUID.randomUUID();
        Page page = buildPage(pageId, "REVIEW");
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        User publisher = buildUser("PUBLISHER");

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "DRAFT", publisher, "   "))
                .isInstanceOf(BadRequestException.class);
    }

    // -------------------------------------------------------------------------
    // 9. Page not found → 404
    // -------------------------------------------------------------------------

    @Test
    void pageNotFound_shouldThrow404() {
        UUID pageId = UUID.randomUUID();
        when(pageRepository.findById(pageId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "REVIEW", buildUser("EDITOR"), null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // 10. Role mismatch → save is never called
    // -------------------------------------------------------------------------

    @Test
    void pageStateUnchangedOnRejection_whenInvalidRole() {
        UUID pageId = UUID.randomUUID();
        Page page = buildPage(pageId, "REVIEW");
        when(pageRepository.findById(pageId)).thenReturn(Optional.of(page));
        User editor = buildUser("EDITOR"); // EDITOR cannot reject

        assertThatThrownBy(() -> pageWorkflowService.transition(pageId, "DRAFT", editor, "some notes"))
                .isInstanceOf(InsufficientPermissionsException.class);

        verify(pageRepository, never()).save(any());
    }
}
