package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.EmailRule;
import java.util.List;
import java.util.UUID;

public interface EmailRuleRepository extends JpaRepository<EmailRule, UUID> {

  List<EmailRule> findByAccountIdOrderByOrderIndexAsc(UUID accountId);
}
