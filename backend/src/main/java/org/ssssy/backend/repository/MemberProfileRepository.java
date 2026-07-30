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
  Optional<MemberProfile> findBySlug(String slug);

  @Query("SELECT mp FROM MemberProfile mp JOIN mp.user u WHERE mp.isPublic = true AND " +
      "(:keyword IS NULL OR LOWER(CAST(u.firstNameEn AS string)) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
      "LOWER(CAST(u.lastNameEn AS string)) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
      "LOWER(CAST(mp.nameAr AS string)) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
      "LOWER(CAST(mp.nameEn AS string)) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
      "(:specialization IS NULL OR mp.specialization = :specialization) AND " +
      "(:institution IS NULL OR LOWER(CAST(u.institution AS string)) LIKE LOWER(CONCAT('%', CAST(:institution AS string), '%'))) AND " +
      "(:membershipType IS NULL OR mp.membershipType = :membershipType)")
  Page<MemberProfile> searchPublicProfiles(@Param("keyword") String keyword,
      @Param("specialization") String specialization,
      @Param("institution") String institution,
      @Param("membershipType") String membershipType,
      Pageable pageable);

  @Query("SELECT DISTINCT mp.specialization FROM MemberProfile mp WHERE mp.isPublic = true AND mp.specialization IS NOT NULL AND mp.specialization <> ''")
  List<String> findDistinctSpecializations();

  @Query("SELECT DISTINCT mp.membershipType FROM MemberProfile mp WHERE mp.isPublic = true AND mp.membershipType IS NOT NULL AND mp.membershipType <> ''")
  List<String> findDistinctMembershipTypes();
}
