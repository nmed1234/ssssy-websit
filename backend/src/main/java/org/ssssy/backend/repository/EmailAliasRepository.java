package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailAlias;
import java.util.List;
import java.util.UUID;

public interface EmailAliasRepository extends JpaRepository<EmailAlias, UUID> {

  List<EmailAlias> findByAccountId(UUID accountId);
}
