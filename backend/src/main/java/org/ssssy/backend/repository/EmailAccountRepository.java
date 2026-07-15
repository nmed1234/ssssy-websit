package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailAccountRepository extends JpaRepository<EmailAccount, UUID> {

  Optional<EmailAccount> findByUserId(UUID userId);

  Optional<EmailAccount> findByEmailAddress(String email);

  Optional<EmailAccount> findByUsername(String username);

  boolean existsByEmailAddress(String email);

  long countByIsActiveTrue();

  List<EmailAccount> findByImapSubscribedTrue();
}
