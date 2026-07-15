package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.ssssy.backend.model.entity.EmailMessage;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailMessageRepository extends JpaRepository<EmailMessage, UUID> {

  Page<EmailMessage> findByFolderIdOrderByCreatedAtDesc(UUID folderId, Pageable pageable);

  Page<EmailMessage> findByAccountIdAndFolderIdOrderByCreatedAtDesc(UUID accountId, UUID folderId, Pageable pageable);

  List<EmailMessage> findByThreadIdOrderByCreatedAtAsc(UUID threadId);

  long countByFolderIdAndIsReadFalse(UUID folderId);

  Page<EmailMessage> findByAccountIdAndIsDraftTrueOrderByUpdatedAtDesc(UUID accountId, Pageable pageable);

  long countByFolderId(UUID folderId);

  Optional<EmailMessage> findByMessageId(String messageId);

  Page<EmailMessage> findByAccountIdAndIsStarredTrueOrderByCreatedAtDesc(UUID accountId, Pageable pageable);

  Page<EmailMessage> findByDeliveryStatus(String deliveryStatus, Pageable pageable);

  @Query(value = "SELECT DISTINCT e.thread_id FROM email_messages e WHERE e.account_id = :accountId AND e.thread_id IS NOT NULL ORDER BY MAX(e.created_at) DESC", nativeQuery = true)
  List<UUID> findDistinctThreadIdsByAccountId(@Param("accountId") UUID accountId);
}
