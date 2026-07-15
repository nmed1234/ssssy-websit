package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.AdminNotification;
import java.util.UUID;

public interface AdminNotificationRepository extends JpaRepository<AdminNotification, UUID> {
    Page<AdminNotification> findByIsReadFalse(Pageable pageable);
    long countByIsReadFalse();
}