package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.BoardMemberRequest;
import org.ssssy.backend.model.dto.BoardMemberResponse;
import org.ssssy.backend.model.entity.BoardMember;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.BoardMemberRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardMemberService {

  private final BoardMemberRepository boardMemberRepository;
  private final UserRepository userRepository;

  public List<BoardMemberResponse> getActiveMembers() {
    return boardMemberRepository.findByIsActiveTrueOrderBySortOrderAsc()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<BoardMemberResponse> getAllMembers() {
    return boardMemberRepository.findAllByOrderBySortOrderAsc()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public BoardMemberResponse createMember(BoardMemberRequest request) {
    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    BoardMember member = BoardMember.builder()
        .user(user)
        .positionAr(request.getPositionAr())
        .positionEn(request.getPositionEn())
        .termStart(request.getTermStart())
        .termEnd(request.getTermEnd())
        .bio(request.getBio())
        .photoUrl(request.getPhotoUrl())
        .sortOrder(request.getSortOrder())
        .isActive(request.getIsActive() != null && request.getIsActive())
        .build();
    member = boardMemberRepository.save(member);
    return toResponse(member);
  }

  @Transactional
  public BoardMemberResponse updateMember(UUID id, BoardMemberRequest request) {
    BoardMember member = boardMemberRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Board member not found: " + id));
    if (request.getUserId() != null) {
      User user = userRepository.findById(request.getUserId())
          .orElseThrow(() -> new ResourceNotFoundException("User not found"));
      member.setUser(user);
    }
    member.setPositionAr(request.getPositionAr());
    member.setPositionEn(request.getPositionEn());
    member.setTermStart(request.getTermStart());
    member.setTermEnd(request.getTermEnd());
    member.setBio(request.getBio());
    member.setPhotoUrl(request.getPhotoUrl());
    member.setSortOrder(request.getSortOrder());
    member.setIsActive(request.getIsActive());
    member = boardMemberRepository.save(member);
    return toResponse(member);
  }

  @Transactional
  public void deleteMember(UUID id) {
    if (!boardMemberRepository.existsById(id)) {
      throw new ResourceNotFoundException("Board member not found: " + id);
    }
    boardMemberRepository.deleteById(id);
  }

  private BoardMemberResponse toResponse(BoardMember member) {
    User u = member.getUser();
    String arName = (u.getFirstNameAr() != null ? u.getFirstNameAr() : "")
        + (u.getFirstNameAr() != null && u.getLastNameAr() != null ? " " : "")
        + (u.getLastNameAr() != null ? u.getLastNameAr() : "");
    return BoardMemberResponse.builder()
        .id(member.getId())
        .userId(u.getId())
        .memberName((u.getFirstNameEn() != null ? u.getFirstNameEn() : "")
            + " " + (u.getLastNameEn() != null ? u.getLastNameEn() : ""))
        .memberNameAr(arName.isBlank() ? null : arName)
        .memberPhoto(u.getAvatarUrl())
        .positionAr(member.getPositionAr())
        .positionEn(member.getPositionEn())
        .termStart(member.getTermStart())
        .termEnd(member.getTermEnd())
        .bio(member.getBio())
        .photoUrl(member.getPhotoUrl())
        .sortOrder(member.getSortOrder())
        .isActive(member.getIsActive())
        .createdAt(member.getCreatedAt())
        .updatedAt(member.getUpdatedAt())
        .build();
  }
}
