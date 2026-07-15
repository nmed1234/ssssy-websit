package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.ssssy.backend.model.entity.EmailContact;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmailContactRepository extends JpaRepository<EmailContact, UUID> {

  List<EmailContact> findByOwnerIdOrderByDisplayNameAsc(UUID ownerId);

  Page<EmailContact> findByOwnerId(UUID ownerId, Pageable pageable);

  Optional<EmailContact> findByOwnerIdAndEmail(UUID ownerId, String email);

  List<EmailContact> findByOwnerIdAndDisplayNameContainingIgnoreCase(UUID ownerId, String query);

  List<EmailContact> findByOwnerIdAndIsFavoriteTrue(UUID ownerId);
}
