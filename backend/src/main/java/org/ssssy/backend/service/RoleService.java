package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.PermissionResponse;
import org.ssssy.backend.model.dto.RoleRequest;
import org.ssssy.backend.model.dto.RoleResponse;
import org.ssssy.backend.model.entity.Permission;
import org.ssssy.backend.model.entity.Role;
import org.ssssy.backend.repository.PermissionRepository;
import org.ssssy.backend.repository.RoleRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

  private final RoleRepository roleRepository;
  private final PermissionRepository permissionRepository;

  public List<RoleResponse> getAllRoles() {
    return roleRepository.findAll().stream()
        .map(this::toRoleResponse)
        .collect(Collectors.toList());
  }

  public RoleResponse getRoleById(UUID id) {
    Role role = roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    return toRoleResponse(role);
  }

  public List<PermissionResponse> getRolePermissions(UUID id) {
    Role role = roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));
    return role.getPermissions().stream()
        .map(this::toPermissionResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public RoleResponse createRole(RoleRequest request) {
    if (roleRepository.findByName(request.getName()).isPresent()) {
      throw new BadRequestException("Role already exists: " + request.getName());
    }

    Role role = Role.builder()
        .name(request.getName().toUpperCase())
        .displayNameAr(request.getDisplayNameAr())
        .displayNameEn(request.getDisplayNameEn())
        .description(request.getDescription())
        .hierarchyLevel(request.getHierarchyLevel())
        .isSystem(false)
        .build();

    if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
      Set<Permission> permissions = request.getPermissionIds().stream()
          .map(id -> permissionRepository.findById(id)
              .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id)))
          .collect(Collectors.toSet());
      role.setPermissions(permissions);
    }

    role = roleRepository.save(role);
    return toRoleResponse(role);
  }

  @Transactional
  public RoleResponse updateRole(UUID id, RoleRequest request) {
    Role role = roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));

    if (role.getIsSystem()) {
      throw new BadRequestException("Cannot modify system roles");
    }

    if (request.getName() != null) role.setName(request.getName().toUpperCase());
    if (request.getDisplayNameAr() != null) role.setDisplayNameAr(request.getDisplayNameAr());
    if (request.getDisplayNameEn() != null) role.setDisplayNameEn(request.getDisplayNameEn());
    if (request.getDescription() != null) role.setDescription(request.getDescription());
    if (request.getHierarchyLevel() != null) role.setHierarchyLevel(request.getHierarchyLevel());

    role = roleRepository.save(role);
    return toRoleResponse(role);
  }

  @Transactional
  public void deleteRole(UUID id) {
    Role role = roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + id));

    if (role.getIsSystem()) {
      throw new BadRequestException("Cannot delete system roles");
    }

    roleRepository.delete(role);
  }

  @Transactional
  public RoleResponse updateRolePermissions(UUID roleId, List<UUID> permissionIds) {
    Role role = roleRepository.findById(roleId)
        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));

    if (role.getIsSystem()) {
      throw new BadRequestException("Cannot modify system role permissions");
    }

    Set<Permission> permissions = permissionIds.stream()
        .map(id -> permissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + id)))
        .collect(Collectors.toSet());

    role.setPermissions(permissions);
    role = roleRepository.save(role);
    return toRoleResponse(role);
  }

  public List<PermissionResponse> getAllPermissions() {
    return permissionRepository.findAll().stream()
        .map(this::toPermissionResponse)
        .collect(Collectors.toList());
  }

  private RoleResponse toRoleResponse(Role role) {
    return RoleResponse.builder()
        .id(role.getId())
        .name(role.getName())
        .displayNameAr(role.getDisplayNameAr())
        .displayNameEn(role.getDisplayNameEn())
        .description(role.getDescription())
        .hierarchyLevel(role.getHierarchyLevel())
        .isSystem(role.getIsSystem())
        .permissions(role.getPermissions().stream().map(Permission::getName).collect(Collectors.toList()))
        .build();
  }

  private PermissionResponse toPermissionResponse(Permission permission) {
    return PermissionResponse.builder()
        .id(permission.getId())
        .name(permission.getName())
        .displayName(permission.getDisplayName())
        .category(permission.getCategory())
        .description(permission.getDescription())
        .build();
  }
}
