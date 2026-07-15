package org.ssssy.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.ssssy.backend.model.entity.MemberProfile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberProfileRepository extends JpaRepository<MemberProfile, UUID> {
  Optional<MemberProfile> findByUserId(UUID userId);
  List<MemberProfile> findByIsPublicTrue();
  Page<MemberProfile> findByIsPublicTrue(Pageable pageable);
  Optional<MemberProfile> findByMembershipNumber(String membershipNumber);

  @Query("SELECT mp FROM MemberProfile mp JOIN mp.user u WHERE mp.isPublic = true AND " +
      "(:keyword IS NULL OR LOWER(u.firstNameEn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
      "LOWER(u.lastNameEn) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
      "(:specialization IS NULL OR mp.specialization = :specialization) AND " +
      "(:institution IS NULL OR LOWER(u.institution) LIKE LOWER(CONCAT('%', :institution, '%'))) AND " +
      "(:membershipType IS NULL OR mp.membershipType = :membershipType)")
  Page<MemberProfile> searchPublicProfiles(@Param("keyword") String keyword,
      @Param("specialization") String specialization,
      @Param("institution") String institution,
      @Param("membershipType") String membershipType,
      Pageable pageable);
}
