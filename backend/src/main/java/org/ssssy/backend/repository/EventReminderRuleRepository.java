package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.EventReminderRule;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface EventReminderRuleRepository extends JpaRepository<EventReminderRule, UUID> {

  List<EventReminderRule> findByEventIdOrderByFireAtAsc(UUID eventId);

  /** Scheduler query: rules due now that haven't fired yet */
  @Query("SELECT r FROM EventReminderRule r WHERE r.fireAt <= :now AND r.isFired = false")
  List<EventReminderRule> findDueReminders(@Param("now") LocalDateTime now);

  void deleteByEventId(UUID eventId);
}
