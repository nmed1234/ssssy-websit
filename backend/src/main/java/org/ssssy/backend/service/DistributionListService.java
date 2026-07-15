package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.DistributionListRequest;
import org.ssssy.backend.model.dto.DistributionListResponse;
import org.ssssy.backend.model.entity.DistributionList;
import org.ssssy.backend.model.entity.DistributionListMember;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.DistributionListMemberRepository;
import org.ssssy.backend.repository.DistributionListRepository;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistributionListService {

  private final DistributionListRepository distributionListRepository;
  private final DistributionListMemberRepository distributionListMemberRepository;
  private final UserRepository userRepository;

  public List<DistributionListResponse> getAllLists() {
    return distributionListRepository.findAll()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public List<DistributionListResponse> getPublicLists() {
    return distributionListRepository.findByIsPublicTrue()
        .stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public DistributionListResponse createList(DistributionListRequest request, UUID userId) {
    User creator = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    DistributionList list = DistributionList.builder()
        .name(request.getName())
        .emailAddress(request.getEmailAddress())
        .description(request.getDescription())
        .listType(request.getListType() != null ? request.getListType() : "DEPARTMENT")
        .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
        .allowExternal(request.getAllowExternal() != null ? request.getAllowExternal() : false)
        .requiresModeration(request.getRequiresModeration() != null ? request.getRequiresModeration() : false)
        .createdBy(creator)
        .build();
    if (request.getModeratorId() != null) {
      User moderator = userRepository.findById(request.getModeratorId())
          .orElseThrow(() -> new ResourceNotFoundException("Moderator not found"));
      list.setModerator(moderator);
    }
    list = distributionListRepository.save(list);
    return toResponse(list);
  }

  @Transactional
  public void addMember(UUID listId, UUID userId) {
    DistributionList list = distributionListRepository.findById(listId)
        .orElseThrow(() -> new ResourceNotFoundException("Distribution list not found"));
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    DistributionListMember member = DistributionListMember.builder()
        .list(list)
        .user(user)
        .build();
    distributionListMemberRepository.save(member);
  }

  @Transactional
  public DistributionListResponse updateList(UUID listId, DistributionListRequest request) {
    DistributionList list = distributionListRepository.findById(listId)
        .orElseThrow(() -> new ResourceNotFoundException("Distribution list not found"));
    list.setName(request.getName());
    list.setEmailAddress(request.getEmailAddress());
    if (request.getDescription() != null) list.setDescription(request.getDescription());
    if (request.getListType() != null) list.setListType(request.getListType());
    if (request.getIsPublic() != null) list.setIsPublic(request.getIsPublic());
    if (request.getAllowExternal() != null) list.setAllowExternal(request.getAllowExternal());
    if (request.getRequiresModeration() != null) list.setRequiresModeration(request.getRequiresModeration());
    if (request.getModeratorId() != null) {
      User moderator = userRepository.findById(request.getModeratorId())
          .orElseThrow(() -> new ResourceNotFoundException("Moderator not found"));
      list.setModerator(moderator);
    }
    list = distributionListRepository.save(list);
    return toResponse(list);
  }

  @Transactional
  public void deleteList(UUID listId) {
    DistributionList list = distributionListRepository.findById(listId)
        .orElseThrow(() -> new ResourceNotFoundException("Distribution list not found"));
    distributionListMemberRepository.findByListId(listId)
        .forEach(distributionListMemberRepository::delete);
    distributionListRepository.delete(list);
  }

  public void removeMember(UUID listId, UUID userId) {
    distributionListMemberRepository.findByListId(listId).stream()
        .filter(m -> m.getUser().getId().equals(userId))
        .findFirst()
        .ifPresent(distributionListMemberRepository::delete);
  }

  public List<User> getListMembers(UUID listId) {
    return distributionListMemberRepository.findByListId(listId)
        .stream()
        .map(DistributionListMember::getUser)
        .collect(Collectors.toList());
  }

  private DistributionListResponse toResponse(DistributionList list) {
    int memberCount = (int) distributionListMemberRepository.findByListId(list.getId()).size();
    return DistributionListResponse.builder()
        .id(list.getId())
        .name(list.getName())
        .emailAddress(list.getEmailAddress())
        .description(list.getDescription())
        .listType(list.getListType())
        .isPublic(list.getIsPublic())
        .allowExternal(list.getAllowExternal())
        .moderatorId(list.getModerator() != null ? list.getModerator().getId() : null)
        .requiresModeration(list.getRequiresModeration())
        .createdById(list.getCreatedBy().getId())
        .memberCount(memberCount)
        .createdAt(list.getCreatedAt())
        .build();
  }
}
