package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.AdminNotificationResponse;
import org.ssssy.backend.model.entity.AdminNotification;
import org.ssssy.backend.repository.AdminNotificationRepository;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    private final AdminNotificationRepository adminNotificationRepository;

    public Page<AdminNotificationResponse> getAllNotifications(Pageable pageable) {
        return adminNotificationRepository.findAll(pageable)
            .map(this::toResponse);
    }

    public AdminNotificationResponse getNotification(UUID id) {
        AdminNotification notification = adminNotificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        return toResponse(notification);
    }

    public AdminNotificationResponse createNotification(AdminNotificationResponse request) {
        AdminNotification notification = AdminNotification.builder()
            .title(request.getTitle())
            .body(request.getBody())
            .type(request.getType())
            .relatedEntityType(request.getRelatedEntityType())
            .relatedEntityId(request.getRelatedEntityId())
            .isRead(false)
            .createdBy(request.getCreatedBy())
            .build();
        notification = adminNotificationRepository.save(notification);
        return toResponse(notification);
    }

    @Transactional
    public void deleteNotification(UUID id) {
        if (!adminNotificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }
        adminNotificationRepository.deleteById(id);
    }

    public void markAsRead(UUID id) {
        AdminNotification notification = adminNotificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notification.setIsRead(true);
        adminNotificationRepository.save(notification);
    }

    public Page<AdminNotificationResponse> getUnreadNotifications(Pageable pageable) {
        return adminNotificationRepository.findByIsReadFalse(pageable)
            .map(this::toResponse);
    }

    public long getUnreadCount() {
        return adminNotificationRepository.countByIsReadFalse();
    }

    private AdminNotificationResponse toResponse(AdminNotification notification) {
        return AdminNotificationResponse.builder()
            .id(notification.getId())
            .title(notification.getTitle())
            .body(notification.getBody())
            .type(notification.getType())
            .relatedEntityType(notification.getRelatedEntityType())
            .relatedEntityId(notification.getRelatedEntityId())
            .isRead(notification.getIsRead())
            .createdBy(notification.getCreatedBy())
            .createdAt(notification.getCreatedAt())
            .updatedAt(notification.getUpdatedAt())
            .build();
    }
}