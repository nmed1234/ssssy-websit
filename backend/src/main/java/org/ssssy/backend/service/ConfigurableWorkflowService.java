package org.ssssy.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.exception.WorkflowException;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.model.entity.*;
import org.ssssy.backend.repository.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfigurableWorkflowService {

  private final WorkflowRepository workflowRepository;
  private final WorkflowStateRepository workflowStateRepository;
  private final WorkflowTransitionRepository workflowTransitionRepository;
  private final WorkflowActionRepository workflowActionRepository;
  private final ContentItemRepository contentItemRepository;
  private final UserRepository userRepository;
  private final ContentService contentService;
  private final ObjectMapper objectMapper;

  @Transactional
  public WorkflowDefinitionResponse createWorkflow(WorkflowDefinitionRequest request) {
    if (workflowRepository.existsByContentType(request.getContentType())) {
      throw new BadRequestException("Workflow already exists for content type: " + request.getContentType());
    }

    Workflow workflow = Workflow.builder()
        .contentType(request.getContentType())
        .nameAr(request.getNameAr())
        .nameEn(request.getNameEn())
        .description(request.getDescription())
        .isActive(request.getIsActive() != null ? request.getIsActive() : true)
        .build();
    workflow = workflowRepository.save(workflow);

    List<WorkflowStateResponse> stateResponses = new ArrayList<>();
    if (request.getStates() != null) {
      for (WorkflowStateRequest sr : request.getStates()) {
        WorkflowState state = WorkflowState.builder()
            .workflow(workflow)
            .name(sr.getName())
            .labelAr(sr.getLabelAr())
            .labelEn(sr.getLabelEn())
            .color(sr.getColor())
            .isInitial(sr.getIsInitial())
            .isFinal(sr.getIsFinal())
            .sortOrder(sr.getSortOrder())
            .build();
        state = workflowStateRepository.save(state);
        stateResponses.add(toStateResponse(state));
      }
    }

    List<WorkflowTransitionResponse> transitionResponses = new ArrayList<>();
    if (request.getTransitions() != null) {
      Map<UUID, WorkflowState> stateMap = new HashMap<>();
      List<WorkflowState> savedStates = workflowStateRepository.findByWorkflowIdOrderBySortOrder(workflow.getId());
      for (WorkflowState s : savedStates) {
        stateMap.put(s.getId(), s);
      }

      for (WorkflowTransitionRequest tr : request.getTransitions()) {
        WorkflowState fromState = stateMap.get(tr.getFromStateId());
        WorkflowState toState = stateMap.get(tr.getToStateId());
        if (fromState == null || toState == null) {
          throw new BadRequestException("Invalid state reference in transition");
        }

        WorkflowTransition transition = WorkflowTransition.builder()
            .workflow(workflow)
            .fromState(fromState)
            .toState(toState)
            .name(tr.getName())
            .rolesAllowed(tr.getRolesAllowed() != null ? tr.getRolesAllowed() : "[]")
            .requireComment(tr.getRequireComment() != null ? tr.getRequireComment() : false)
            .conditions(tr.getConditions() != null ? tr.getConditions() : "{}")
            .sortOrder(tr.getSortOrder())
            .build();
        transition = workflowTransitionRepository.save(transition);
        transitionResponses.add(toTransitionResponse(transition));
      }
    }

    return WorkflowDefinitionResponse.builder()
        .id(workflow.getId())
        .contentType(workflow.getContentType())
        .nameAr(workflow.getNameAr())
        .nameEn(workflow.getNameEn())
        .description(workflow.getDescription())
        .isActive(workflow.getIsActive())
        .createdAt(workflow.getCreatedAt())
        .updatedAt(workflow.getUpdatedAt())
        .states(stateResponses)
        .transitions(transitionResponses)
        .build();
  }

  @Transactional
  public WorkflowDefinitionResponse updateWorkflow(UUID workflowId, WorkflowDefinitionRequest request) {
    Workflow workflow = workflowRepository.findById(workflowId)
        .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));

    workflow.setContentType(request.getContentType());
    workflow.setNameAr(request.getNameAr());
    workflow.setNameEn(request.getNameEn());
    workflow.setDescription(request.getDescription());
    if (request.getIsActive() != null) {
      workflow.setIsActive(request.getIsActive());
    }
    workflow = workflowRepository.save(workflow);

    if (request.getStates() != null) {
      workflowStateRepository.deleteByWorkflowId(workflowId);
      for (WorkflowStateRequest sr : request.getStates()) {
        WorkflowState state = WorkflowState.builder()
            .workflow(workflow)
            .name(sr.getName())
            .labelAr(sr.getLabelAr())
            .labelEn(sr.getLabelEn())
            .color(sr.getColor())
            .isInitial(sr.getIsInitial())
            .isFinal(sr.getIsFinal())
            .sortOrder(sr.getSortOrder())
            .build();
        workflowStateRepository.save(state);
      }
    }

    if (request.getTransitions() != null) {
      workflowTransitionRepository.deleteByWorkflowId(workflowId);
      List<WorkflowState> savedStates = workflowStateRepository.findByWorkflowIdOrderBySortOrder(workflow.getId());
      Map<UUID, WorkflowState> stateByName = new HashMap<>();
      for (WorkflowState s : savedStates) {
        if (request.getStates() != null) {
          for (WorkflowStateRequest sr : request.getStates()) {
            if (sr.getName().equals(s.getName()) && sr.getId() != null) {
              stateByName.put(sr.getId(), s);
            }
          }
        }
      }
      for (WorkflowTransitionRequest tr : request.getTransitions()) {
        WorkflowState fromState = stateByName.get(tr.getFromStateId());
        WorkflowState toState = stateByName.get(tr.getToStateId());
        if (fromState == null || toState == null) continue;
        WorkflowTransition transition = WorkflowTransition.builder()
            .workflow(workflow)
            .fromState(fromState)
            .toState(toState)
            .name(tr.getName())
            .rolesAllowed(tr.getRolesAllowed() != null ? tr.getRolesAllowed() : "[]")
            .requireComment(tr.getRequireComment())
            .conditions(tr.getConditions() != null ? tr.getConditions() : "{}")
            .sortOrder(tr.getSortOrder())
            .build();
        workflowTransitionRepository.save(transition);
      }
    }

    return getWorkflow(workflowId);
  }

  @Transactional(readOnly = true)
  public WorkflowDefinitionResponse getWorkflow(UUID workflowId) {
    Workflow workflow = workflowRepository.findById(workflowId)
        .orElseThrow(() -> new ResourceNotFoundException("Workflow not found: " + workflowId));
    return toDefinitionResponse(workflow);
  }

  @Transactional(readOnly = true)
  public WorkflowDefinitionResponse getWorkflowByContentType(String contentType) {
    Workflow workflow = workflowRepository.findByContentType(contentType)
        .orElseThrow(() -> new ResourceNotFoundException("No workflow found for content type: " + contentType));
    return toDefinitionResponse(workflow);
  }

  @Transactional(readOnly = true)
  public List<WorkflowDefinitionResponse> getAllWorkflows() {
    return workflowRepository.findAll().stream()
        .map(this::toDefinitionResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public void deleteWorkflow(UUID workflowId) {
    if (!workflowRepository.existsById(workflowId)) {
      throw new ResourceNotFoundException("Workflow not found: " + workflowId);
    }
    workflowRepository.deleteById(workflowId);
  }

  @Transactional
  public ContentResponse executeTransition(UUID contentId, UUID toStateId, UUID userId, String action, String comments) {
    ContentItem item = contentItemRepository.findById(contentId)
        .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));
    ContentItem finalItem = item;

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

    Workflow workflow = workflowRepository.findByContentType(finalItem.getContentType())
        .orElseThrow(() -> new WorkflowException("No configurable workflow for content type: " + finalItem.getContentType()));

    WorkflowState currentState = workflowStateRepository.findByWorkflowIdAndName(workflow.getId(), item.getStatus())
        .orElse(null);

    if (currentState == null) {
      throw new WorkflowException("Current state '" + item.getStatus() + "' not found in workflow definition");
    }

    WorkflowState targetState = workflowStateRepository.findById(toStateId)
        .orElseThrow(() -> new ResourceNotFoundException("Target state not found: " + toStateId));

    WorkflowTransition transition = workflowTransitionRepository
        .findByWorkflowIdAndFromStateIdAndToStateId(workflow.getId(), currentState.getId(), targetState.getId())
        .orElseThrow(() -> new WorkflowException("Transition from " + currentState.getName() + " to " + targetState.getName() + " is not allowed"));

    if (transition.getRequireComment() && (comments == null || comments.isBlank())) {
      throw new BadRequestException("Comments are required for this transition");
    }

    if (!isRoleAllowed(transition, user)) {
      throw new WorkflowException("User role not allowed for this transition");
    }

    WorkflowAction log = WorkflowAction.builder()
        .content(item)
        .workflow(workflow)
        .fromState(currentState)
        .toState(targetState)
        .action(action)
        .actor(user)
        .comments(comments)
        .metadata(toJson(Map.of("fromStatus", item.getStatus(), "toStatus", targetState.getName())))
        .build();
    workflowActionRepository.save(log);

    item.setStatus(targetState.getName());
    if ("PUBLISHED".equals(targetState.getName())) {
      item.setPublishedAt(LocalDateTime.now());
      item.setPublisher(user);
    }
    if ("ARCHIVED".equals(targetState.getName())) {
      item.setArchivedAt(LocalDateTime.now());
    }
    item = contentItemRepository.save(item);

    return contentService.toResponse(item);
  }

  @Transactional(readOnly = true)
  public List<WorkflowActionResponse> getActionsForContent(UUID contentId) {
    return workflowActionRepository.findByContentIdOrderByCreatedAtDesc(contentId).stream()
        .map(this::toActionResponse)
        .collect(Collectors.toList());
  }

  private boolean isRoleAllowed(WorkflowTransition transition, User user) {
    try {
      String rolesJson = transition.getRolesAllowed();
      if (rolesJson == null || rolesJson.isBlank() || "[]".equals(rolesJson)) {
        return true;
      }
      String[] allowedRoles = objectMapper.readValue(rolesJson, String[].class);
      String userRole = user.getRole().getName();
      for (String role : allowedRoles) {
        if (role.equalsIgnoreCase(userRole)) {
          return true;
        }
      }
      return false;
    } catch (JsonProcessingException e) {
      return true;
    }
  }

  private WorkflowDefinitionResponse toDefinitionResponse(Workflow workflow) {
    List<WorkflowState> states = workflowStateRepository.findByWorkflowIdOrderBySortOrder(workflow.getId());
    List<WorkflowTransition> transitions = workflowTransitionRepository.findByWorkflowIdOrderBySortOrder(workflow.getId());

    return WorkflowDefinitionResponse.builder()
        .id(workflow.getId())
        .contentType(workflow.getContentType())
        .nameAr(workflow.getNameAr())
        .nameEn(workflow.getNameEn())
        .description(workflow.getDescription())
        .isActive(workflow.getIsActive())
        .createdAt(workflow.getCreatedAt())
        .updatedAt(workflow.getUpdatedAt())
        .states(states.stream().map(this::toStateResponse).collect(Collectors.toList()))
        .transitions(transitions.stream().map(this::toTransitionResponse).collect(Collectors.toList()))
        .build();
  }

  private WorkflowStateResponse toStateResponse(WorkflowState state) {
    return WorkflowStateResponse.builder()
        .id(state.getId())
        .workflowId(state.getWorkflow().getId())
        .name(state.getName())
        .labelAr(state.getLabelAr())
        .labelEn(state.getLabelEn())
        .color(state.getColor())
        .isInitial(state.getIsInitial())
        .isFinal(state.getIsFinal())
        .sortOrder(state.getSortOrder())
        .build();
  }

  private WorkflowTransitionResponse toTransitionResponse(WorkflowTransition transition) {
    return WorkflowTransitionResponse.builder()
        .id(transition.getId())
        .workflowId(transition.getWorkflow().getId())
        .fromStateId(transition.getFromState().getId())
        .fromStateName(transition.getFromState().getName())
        .toStateId(transition.getToState().getId())
        .toStateName(transition.getToState().getName())
        .name(transition.getName())
        .rolesAllowed(transition.getRolesAllowed())
        .requireComment(transition.getRequireComment())
        .conditions(transition.getConditions())
        .sortOrder(transition.getSortOrder())
        .build();
  }

  private WorkflowActionResponse toActionResponse(WorkflowAction action) {
    return WorkflowActionResponse.builder()
        .id(action.getId())
        .contentId(action.getContent().getId())
        .workflowId(action.getWorkflow().getId())
        .fromStateId(action.getFromState() != null ? action.getFromState().getId() : null)
        .fromStateName(action.getFromState() != null ? action.getFromState().getName() : null)
        .toStateId(action.getToState().getId())
        .toStateName(action.getToState().getName())
        .action(action.getAction())
        .actorId(action.getActor().getId())
        .actorName(action.getActor().getFirstNameEn() + " " + action.getActor().getLastNameEn())
        .comments(action.getComments())
        .metadata(action.getMetadata())
        .createdAt(action.getCreatedAt())
        .build();
  }

  private String toJson(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      return "{}";
    }
  }
}
