package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailAttachment;
import java.util.List;
import java.util.UUID;

public interface EmailAttachmentRepository extends JpaRepository<EmailAttachment, UUID> {

  List<EmailAttachment> findByMessageId(UUID messageId);
}
