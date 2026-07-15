package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.ContactGroup;
import java.util.List;
import java.util.UUID;

public interface ContactGroupRepository extends JpaRepository<ContactGroup, UUID> {

  List<ContactGroup> findByOwnerIdOrderByNameAsc(UUID ownerId);
}
