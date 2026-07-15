package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.model.entity.Comment;
import org.ssssy.backend.model.entity.CommentEvent;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.CommentEventRepository;
import org.ssssy.backend.repository.CommentRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentWebSocketService {

    private final CommentRepository commentRepository;
    private final CommentEventRepository commentEventRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void handleCommentCreated(Comment comment, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        saveCommentEvent(comment, "CREATED", userId, "COMMENT", comment.getId());
        broadcastToTopic("/topic/comments", comment);
    }

    public void handleCommentUpdated(Comment comment, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        saveCommentEvent(comment, "UPDATED", userId, "COMMENT", comment.getId());
        broadcastToTopic("/topic/comments/updates", comment);
    }

    public void handleCommentApproved(Comment comment, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        saveCommentEvent(comment, "APPROVED", userId, "COMMENT", comment.getId());
        broadcastToTopic("/topic/comments/approved", comment);
    }

    public void handleCommentDeleted(UUID commentId, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        Comment comment = commentRepository.findById(commentId).orElse(null);
        saveCommentEvent(comment, "DELETED", userId, "COMMENT", commentId);
        broadcastToTopic("/topic/comments/deleted", commentId);
    }

    public void handleCommentReply(Comment reply, String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        saveCommentEvent(reply, "REPLIED", userId, "THREAD", reply.getParent().getId());
        broadcastToUser(reply.getParent().getAuthor().getId(), "/user/notifications/comment-replied", reply);
    }

    @Transactional
    private void saveCommentEvent(Comment comment, String eventType, UUID userId, String entityType, UUID entityId) {
        CommentEvent event = CommentEvent.builder()
            .comment(comment)
            .eventType(eventType)
            .eventData("{}")
            .entityType(entityType)
            .entityId(entityId)
            .initiatedBy(userRepository.findById(userId).orElseThrow())
            .recipients(determineNotificationRecipients(comment))
            .build();

        commentEventRepository.save(event);
    }

    private String[] determineNotificationRecipients(Comment comment) {
        List<UUID> recipientIds = new ArrayList<>();

        if (comment.getAuthor() != null) {
            recipientIds.add(comment.getAuthor().getId());
        }
        if (comment.getParent() != null && comment.getParent().getAuthor() != null) {
            recipientIds.add(comment.getParent().getAuthor().getId());
        }
        if (comment.getContentItem() != null && comment.getContentItem().getAuthor() != null) {
            recipientIds.add(comment.getContentItem().getAuthor().getId());
        }

        return recipientIds.stream().map(UUID::toString).toArray(String[]::new);
    }

    private void broadcastToTopic(String topic, Object payload) {
        messagingTemplate.convertAndSend(topic, payload);
    }

    private void broadcastToUser(UUID userId, String destination, Object payload) {
        messagingTemplate.convertAndSendToUser(userId.toString(), destination, payload);
    }

    public List<CommentEvent> getUnreadEvents(UUID userId) {
        return commentEventRepository.findUnreadByUser(userId);
    }

    public long getUnreadEventCount(UUID userId) {
        return commentEventRepository.findUnreadByUser(userId).size();
    }

    @Transactional
    public void markEventAsProcessed(UUID eventId) {
        commentEventRepository.markAsProcessed(eventId);
    }
}