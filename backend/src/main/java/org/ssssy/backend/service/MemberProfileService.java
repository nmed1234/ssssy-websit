package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.MemberProfileRequest;
import org.ssssy.backend.model.dto.MemberProfileResponse;
import org.ssssy.backend.model.entity.MemberProfile;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.MemberProfileRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MemberProfileService {

  private final MemberProfileRepository memberProfileRepository;
  private final UserRepository userRepository;

  public Page<MemberProfileResponse> getPublicProfiles(Pageable pageable) {
    return memberProfileRepository.findByIsPublicTrue(pageable)
        .map(this::toResponse);
  }

  public Page<MemberProfileResponse> searchPublicProfiles(String keyword, String specialization, String institution,
      String membershipType, Pageable pageable) {
    return memberProfileRepository.searchPublicProfiles(keyword, specialization, institution, membershipType, pageable)
        .map(this::toResponse);
  }

  public MemberProfileResponse getProfile(UUID userId) {
    MemberProfile profile = memberProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
    return toResponse(profile);
  }

  public MemberProfileResponse getProfileBySlug(String slug) {
    MemberProfile profile = memberProfileRepository.findBySlug(slug)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + slug));
    return toResponse(profile);
  }

  public MemberProfileResponse getMyProfile(UUID userId) {
    MemberProfile profile = memberProfileRepository.findByUserId(userId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
    return toResponse(profile);
  }

  @Transactional
  public MemberProfileResponse createOrUpdateProfile(UUID userId, MemberProfileRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    MemberProfile profile = memberProfileRepository.findByUserId(userId)
        .orElse(MemberProfile.builder().user(user).build());
    profile.setMembershipType(request.getMembershipType());
    profile.setSpecialization(request.getSpecialization());
    profile.setSpecializationDetail(request.getSpecializationDetail());
    profile.setResearchInterests(request.getResearchInterests());
    profile.setEducation(request.getEducation());
    profile.setIsPublic(request.getIsPublic() != null && request.getIsPublic());
    profile.setJoinedAt(request.getJoinedAt());
    profile.setOrcidId(request.getOrcidId());
    profile.setGoogleScholarUrl(request.getGoogleScholarUrl());
    profile.setLinkedinUrl(request.getLinkedinUrl());
    profile.setNameAr(request.getNameAr());
    profile.setNameEn(request.getNameEn());
    profile.setTitleAr(request.getTitleAr());
    profile.setBirthYear(request.getBirthYear());
    profile.setBirthCity(request.getBirthCity());
    profile.setNationality(request.getNationality());
    profile.setMaritalStatus(request.getMaritalStatus());
    profile.setCareerSummary(request.getCareerSummary());
    profile.setMemberships(request.getMemberships());
    profile.setLanguages(request.getLanguages());
    if (request.getPhotoUrl() != null) profile.setPhotoUrl(request.getPhotoUrl());
    if (request.getSlug() != null) profile.setSlug(request.getSlug());
    profile = memberProfileRepository.save(profile);
    return toResponse(profile);
  }

  @Transactional
  public void deleteProfile(UUID profileId) {
    MemberProfile profile = memberProfileRepository.findById(profileId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));
    memberProfileRepository.delete(profile);
  }

  @Transactional
  public MemberProfileResponse toggleVisibility(UUID profileId) {
    MemberProfile profile = memberProfileRepository.findById(profileId)
        .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));
    profile.setIsPublic(!Boolean.TRUE.equals(profile.getIsPublic()));
    return toResponse(memberProfileRepository.save(profile));
  }

  public Page<MemberProfileResponse> getAllProfiles(Pageable pageable) {
    return memberProfileRepository.findAll(pageable).map(this::toResponse);
  }

  public List<String> getDistinctSpecializations() {
    return memberProfileRepository.findDistinctSpecializations();
  }

  public List<String> getDistinctMembershipTypes() {
    return memberProfileRepository.findDistinctMembershipTypes();
  }

  private MemberProfileResponse toResponse(MemberProfile profile) {
    User u = profile.getUser();
    // Prefer nameAr/nameEn stored on profile; fall back to user fields
    String displayNameEn = profile.getNameEn() != null ? profile.getNameEn()
        : ((u.getFirstNameEn() != null ? u.getFirstNameEn() : "") + " " +
           (u.getLastNameEn() != null ? u.getLastNameEn() : "")).trim();
    // photo: prefer profile.photoUrl, fall back to user.avatarUrl
    String photo = profile.getPhotoUrl() != null ? profile.getPhotoUrl() : u.getAvatarUrl();

    return MemberProfileResponse.builder()
        .id(profile.getId())
        .userId(u.getId())
        .firstName(u.getFirstNameEn())
        .lastName(u.getLastNameEn())
        .email(u.getEmail())
        .photo(photo)
        .institution(u.getInstitution())
        .department(u.getDepartment())
        .position(u.getPosition())
        .phone(u.getPhone())
        .membershipType(profile.getMembershipType())
        .membershipNumber(profile.getMembershipNumber())
        .specialization(profile.getSpecialization())
        .specializationDetail(profile.getSpecializationDetail())
        .researchInterests(profile.getResearchInterests())
        .education(profile.getEducation())
        .publicationsCount(profile.getPublicationsCount())
        .isPublic(profile.getIsPublic())
        .joinedAt(profile.getJoinedAt())
        .membershipExpiresAt(profile.getMembershipExpiresAt())
        .orcidId(profile.getOrcidId())
        .googleScholarUrl(profile.getGoogleScholarUrl())
        .linkedinUrl(profile.getLinkedinUrl())
        .nameAr(profile.getNameAr())
        .nameEn(displayNameEn)
        .titleAr(profile.getTitleAr())
        .birthYear(profile.getBirthYear())
        .birthCity(profile.getBirthCity())
        .nationality(profile.getNationality())
        .maritalStatus(profile.getMaritalStatus())
        .careerSummary(profile.getCareerSummary())
        .memberships(profile.getMemberships())
        .languages(profile.getLanguages())
        .photoUrl(photo)
        .slug(profile.getSlug())
        .createdAt(profile.getCreatedAt())
        .updatedAt(profile.getUpdatedAt())
        .build();
  }
}
