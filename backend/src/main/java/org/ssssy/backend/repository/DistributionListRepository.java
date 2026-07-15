package org.ssssy.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.ssssy.backend.model.entity.DistributionList;
import java.util.List;
import java.util.UUID;

public interface DistributionListRepository extends JpaRepository<DistributionList, UUID> {

  List<DistributionList> findByIsPublicTrue();

  List<DistributionList> findByListType(String listType);
}
