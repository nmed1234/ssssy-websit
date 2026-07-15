package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.*;
import org.ssssy.backend.service.RoleService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

  private final RoleService roleService;

  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
    return ResponseEntity.ok(ApiResponse.ok(roleService.getAllRoles()));
  }

  @PostMapping
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(roleService.createRole(request)));
  }

  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(roleService.getRoleById(id)));
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
      @PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(roleService.updateRole(id, request)));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable UUID id) {
    roleService.deleteRole(id);
    return ResponseEntity.ok(ApiResponse.ok("Role deleted successfully", null));
  }

  @GetMapping("/{id}/permissions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<PermissionResponse>>> getRolePermissions(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(roleService.getRolePermissions(id)));
  }

  @PutMapping("/{id}/permissions")
  @PreAuthorize("hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<RoleResponse>> updateRolePermissions(
      @PathVariable UUID id, @RequestBody List<UUID> permissionIds) {
    return ResponseEntity.ok(ApiResponse.ok(roleService.updateRolePermissions(id, permissionIds)));
  }

  @GetMapping("/permissions")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
    return ResponseEntity.ok(ApiResponse.ok(roleService.getAllPermissions()));
  }
}
