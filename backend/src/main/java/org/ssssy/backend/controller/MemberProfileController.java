package org.ssssy.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.MemberProfileRequest;
import org.ssssy.backend.model.dto.MemberProfileResponse;
import org.ssssy.backend.service.MemberProfileService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MemberProfileController {

  private final MemberProfileService memberProfileService;

  // ── Public: list & search ─────────────────────────────────────────────────

  @GetMapping("/public/users/members")
  public ResponseEntity<ApiResponse<Page<MemberProfileResponse>>> getPublicUserMembers(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String specialization,
      @RequestParam(required = false) String institution,
      @RequestParam(required = false) String membershipType,
      @PageableDefault(size = 12, sort = "joinedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    if (keyword != null || specialization != null || institution != null || membershipType != null) {
      return ResponseEntity.ok(ApiResponse.ok(
          memberProfileService.searchPublicProfiles(keyword, specialization, institution, membershipType, pageable)));
    }
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getPublicProfiles(pageable)));
  }

  @GetMapping("/public/users/members/specializations")
  public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getDistinctSpecializations()));
  }

  @GetMapping("/public/users/members/membership-types")
  public ResponseEntity<ApiResponse<List<String>>> getMembershipTypes() {
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getDistinctMembershipTypes()));
  }

  // ── Public: alternate paths ────────────────────────────────────────────────

  @GetMapping("/public/members")
  public ResponseEntity<ApiResponse<Page<MemberProfileResponse>>> getPublicProfiles(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String specialization,
      @RequestParam(required = false) String institution,
      @RequestParam(required = false) String membershipType,
      @PageableDefault(size = 12, sort = "joinedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    if (keyword != null || specialization != null || institution != null || membershipType != null) {
      return ResponseEntity.ok(ApiResponse.ok(
          memberProfileService.searchPublicProfiles(keyword, specialization, institution, membershipType, pageable)));
    }
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getPublicProfiles(pageable)));
  }

  @GetMapping("/public/members/search")
  public ResponseEntity<ApiResponse<Page<MemberProfileResponse>>> searchMembers(
      @RequestParam(required = false) String keyword,
      @RequestParam(required = false) String specialization,
      @RequestParam(required = false) String institution,
      @RequestParam(required = false) String membershipType,
      @PageableDefault(size = 12, sort = "joinedAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(
        memberProfileService.searchPublicProfiles(keyword, specialization, institution, membershipType, pageable)));
  }

  @GetMapping("/public/members/{userId}")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> getProfile(@PathVariable String userId) {
    // Try as UUID first; if it looks like a slug fall back to slug lookup
    try {
      return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getProfile(java.util.UUID.fromString(userId))));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getProfileBySlug(userId)));
    }
  }

  @GetMapping("/public/members/slug/{slug}")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> getProfileBySlug(@PathVariable String slug) {
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getProfileBySlug(slug)));
  }

  // ── Authenticated: own profile ─────────────────────────────────────────────

  @GetMapping("/members/profile")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> getMyProfile(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        memberProfileService.getMyProfile(UUID.fromString(userDetails.getUsername()))));
  }

  @PutMapping("/members/profile")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> createOrUpdateProfile(
      @RequestBody MemberProfileRequest request,
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(ApiResponse.ok(
        memberProfileService.createOrUpdateProfile(UUID.fromString(userDetails.getUsername()), request)));
  }

  // ── Admin: full CRUD ───────────────────────────────────────────────────────

  @GetMapping("/admin/members")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Page<MemberProfileResponse>>> getAllProfiles(
      @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.getAllProfiles(pageable)));
  }

  @PutMapping("/admin/members/{profileId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> adminUpdateProfile(
      @PathVariable UUID profileId,
      @RequestBody MemberProfileRequest request) {
    // Reuse createOrUpdate via the profile's userId
    MemberProfileResponse existing = memberProfileService.getAllProfiles(Pageable.unpaged())
        .stream().filter(p -> p.getId().equals(profileId)).findFirst()
        .orElseThrow(() -> new org.ssssy.backend.exception.ResourceNotFoundException("Profile not found: " + profileId));
    return ResponseEntity.ok(ApiResponse.ok(
        memberProfileService.createOrUpdateProfile(existing.getUserId(), request)));
  }

  @DeleteMapping("/admin/members/{profileId}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable UUID profileId) {
    memberProfileService.deleteProfile(profileId);
    return ResponseEntity.ok(ApiResponse.ok(null));
  }

  @PatchMapping("/admin/members/{profileId}/toggle-visibility")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MemberProfileResponse>> toggleVisibility(@PathVariable UUID profileId) {
    return ResponseEntity.ok(ApiResponse.ok(memberProfileService.toggleVisibility(profileId)));
  }
}
