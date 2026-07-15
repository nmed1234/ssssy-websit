package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.DistributionListMember;
import java.util.List;
import java.util.UUID;

public interface DistributionListMemberRepository extends JpaRepository<DistributionListMember, UUID> {

  List<DistributionListMember> findByListId(UUID listId);

  List<DistributionListMember> findByUserId(UUID userId);
}
