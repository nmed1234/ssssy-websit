package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.EmailRecipient;
import java.util.List;
import java.util.UUID;

public interface EmailRecipientRepository extends JpaRepository<EmailRecipient, UUID> {

  List<EmailRecipient> findByMessageId(UUID messageId);

  Page<EmailRecipient> findByAddress(String address, Pageable pageable);

  @Modifying
  @Query("DELETE FROM EmailRecipient r WHERE r.message.id = :messageId")
  void deleteByMessageId(@Param("messageId") UUID messageId);
}
