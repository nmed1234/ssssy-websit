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
        .orElse(MemberProfile.builder()
            .user(user)
            .build());
    profile.setMembershipType(request.getMembershipType());
    profile.setSpecialization(request.getSpecialization());
    profile.setResearchInterests(request.getResearchInterests());
    profile.setEducation(request.getEducation());
    profile.setIsPublic(request.getIsPublic() != null && request.getIsPublic());
    profile.setJoinedAt(request.getJoinedAt());
    profile.setOrcidId(request.getOrcidId());
    profile.setGoogleScholarUrl(request.getGoogleScholarUrl());
    profile.setLinkedinUrl(request.getLinkedinUrl());
    profile = memberProfileRepository.save(profile);
    return toResponse(profile);
  }

  public Page<MemberProfileResponse> getAllProfiles(Pageable pageable) {
    return memberProfileRepository.findAll(pageable).map(this::toResponse);
  }

  private MemberProfileResponse toResponse(MemberProfile profile) {
    return MemberProfileResponse.builder()
        .id(profile.getId())
        .userId(profile.getUser().getId())
        .firstName(profile.getUser().getFirstNameEn())
        .lastName(profile.getUser().getLastNameEn())
        .email(profile.getUser().getEmail())
        .photo(profile.getUser().getAvatarUrl())
        .membershipType(profile.getMembershipType())
        .membershipNumber(profile.getMembershipNumber())
        .specialization(profile.getSpecialization())
        .researchInterests(profile.getResearchInterests())
        .education(profile.getEducation())
        .publicationsCount(profile.getPublicationsCount())
        .isPublic(profile.getIsPublic())
        .joinedAt(profile.getJoinedAt())
        .membershipExpiresAt(profile.getMembershipExpiresAt())
        .orcidId(profile.getOrcidId())
        .googleScholarUrl(profile.getGoogleScholarUrl())
        .linkedinUrl(profile.getLinkedinUrl())
        .createdAt(profile.getCreatedAt())
        .updatedAt(profile.getUpdatedAt())
        .build();
  }
}
