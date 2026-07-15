package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.CrmContact;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CrmContactRepository extends JpaRepository<CrmContact, UUID> {
  Optional<CrmContact> findByEmail(String email);

  @Query("SELECT c FROM CrmContact c WHERE c.isActive = true AND " +
          "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
          "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
          "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
          "LOWER(c.organization) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
          "(:contactType IS NULL OR c.contactType = :contactType) AND " +
          "(:relationshipLevel IS NULL OR c.relationshipLevel = :relationshipLevel)")
  Page<CrmContact> searchContacts(@Param("query") String query,
      @Param("contactType") String contactType,
      @Param("relationshipLevel") String relationshipLevel,
      Pageable pageable);

  List<CrmContact> findByIsActiveTrue();

  List<CrmContact> findByContactTypeAndIsActiveTrue(String contactType);

  List<CrmContact> findByUserIdAndIsActiveTrue(UUID userId);

  long countByIsActiveTrue();

  boolean existsByEmailAndIdNot(String email, UUID id);
}