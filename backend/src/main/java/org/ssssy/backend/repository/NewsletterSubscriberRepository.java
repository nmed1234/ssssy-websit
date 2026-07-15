package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.NewsletterSubscriber;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, UUID> {
  Optional<NewsletterSubscriber> findByEmail(String email);
  boolean existsByEmail(String email);
  long countByIsActiveTrue();
  List<NewsletterSubscriber> findByIsActiveTrue();
}
