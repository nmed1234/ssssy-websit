package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.ContactGroupMember;
import java.util.List;
import java.util.UUID;

public interface ContactGroupMemberRepository extends JpaRepository<ContactGroupMember, UUID> {

  List<ContactGroupMember> findByGroupId(UUID groupId);

  @Modifying
  @Query("DELETE FROM ContactGroupMember m WHERE m.group.id = :groupId AND m.contact.id = :contactId")
  void deleteByGroupIdAndContactId(@Param("groupId") UUID groupId, @Param("contactId") UUID contactId);
}
