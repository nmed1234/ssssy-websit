package org.ssssy.backend.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.ssssy.backend.service.CommentWebSocketService;
import org.ssssy.backend.model.entity.Comment;

import java.util.UUID;

@Controller
@MessageMapping("/comments")
public class CommentWebSocketController {

    private final CommentWebSocketService commentWebSocketService;
    private final SimpMessagingTemplate messagingTemplate;

    public CommentWebSocketController(CommentWebSocketService commentWebSocketService, SimpMessagingTemplate messagingTemplate) {
        this.commentWebSocketService = commentWebSocketService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/comment-created")
    public void handleCommentCreated(@Payload Comment comment, Authentication authentication) {
        commentWebSocketService.handleCommentCreated(comment, authentication.getName());
    }

    @MessageMapping("/comment-updated")
    public void handleCommentUpdated(@Payload Comment comment, Authentication authentication) {
        commentWebSocketService.handleCommentUpdated(comment, authentication.getName());
    }

    @MessageMapping("/comment-approved")
    public void handleCommentApproved(@Payload Comment comment, Authentication authentication) {
        commentWebSocketService.handleCommentApproved(comment, authentication.getName());
    }

    @MessageMapping("/comment-deleted")
    public void handleCommentDeleted(@Payload UUID commentId, Authentication authentication) {
        commentWebSocketService.handleCommentDeleted(commentId, authentication.getName());
    }

    @MessageMapping("/comment-replied")
    public void handleCommentReplied(@Payload Comment reply, Authentication authentication) {
        commentWebSocketService.handleCommentReply(reply, authentication.getName());
    }

    @MessageMapping("/ping")
    public void handlePing(Authentication authentication) {
        String username = authentication != null && authentication.isAuthenticated()
            ? authentication.getName() : "anonymous";
        messagingTemplate.convertAndSendToUser(username, "/queue/ping", "pong");
    }
}
