package org.ssssy.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.ssssy.backend.model.dto.ApiResponse;
import org.ssssy.backend.model.dto.MenuItemRequest;
import org.ssssy.backend.model.dto.MenuItemResponse;
import org.ssssy.backend.model.dto.MenuItemWithMenuNameResponse;
import org.ssssy.backend.model.dto.MenuPlacementRequest;
import org.ssssy.backend.model.dto.MoveMenuItemRequest;
import org.ssssy.backend.model.dto.MenuRequest;
import org.ssssy.backend.model.dto.MenuResponse;
import org.ssssy.backend.service.MenuService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {

  private final MenuService menuService;

  @GetMapping("/public/menus")
  public ResponseEntity<ApiResponse<List<MenuResponse>>> getActiveMenus() {
    return ResponseEntity.ok(ApiResponse.ok(menuService.getActiveMenus()));
  }

  @GetMapping("/admin/menus")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MenuResponse>>> getAllMenus() {
    return ResponseEntity.ok(ApiResponse.ok(menuService.getMenus()));
  }

  @PostMapping("/admin/menus")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MenuResponse>> createMenu(@Valid @RequestBody MenuRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.createMenu(request)));
  }

  @PutMapping("/admin/menus/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MenuResponse>> updateMenu(@PathVariable UUID id, @Valid @RequestBody MenuRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.updateMenu(id, request)));
  }

  @DeleteMapping("/admin/menus/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteMenu(@PathVariable UUID id) {
    menuService.deleteMenu(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Menu deleted successfully")));
  }

  /**
   * Set the given menu as the site-wide style default.
   * Clears isDefaultStyle on all other menus atomically.
   */
  @PostMapping("/admin/menus/{id}/set-default")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MenuResponse>> setMenuAsDefault(@PathVariable UUID id) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.setMenuAsDefault(id)));
  }

  @GetMapping("/admin/menus/{menuId}/items")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(@PathVariable UUID menuId) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.getMenuItems(menuId)));
  }

  @PostMapping("/admin/menus/{menuId}/items")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(@PathVariable UUID menuId, @Valid @RequestBody MenuItemRequest request) {
    request.setMenuId(menuId);
    return ResponseEntity.ok(ApiResponse.ok(menuService.createMenuItem(request)));
  }

  @PutMapping("/admin/menus/items/{id}")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(@PathVariable UUID id, @Valid @RequestBody MenuItemRequest request) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.updateMenuItem(id, request)));
  }

  @DeleteMapping("/admin/menus/items/{id}")
  @PreAuthorize("hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> deleteMenuItem(@PathVariable UUID id) {
    menuService.deleteMenuItem(id);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Menu item deleted successfully")));
  }

  @PutMapping("/admin/menus/{menuId}/items/reorder")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> reorderMenuItems(@PathVariable UUID menuId, @RequestBody List<UUID> itemIds) {
    menuService.reorderMenuItems(menuId, itemIds);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Menu items reordered successfully")));
  }

  /**
   * Task 16.1 — Move a menu item (update sort_order and parent_id).
   * Requirements: 14.4, 14.5
   */
  @PatchMapping("/admin/menus/{menuId}/items")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> moveMenuItem(
      @PathVariable UUID menuId,
      @RequestBody MoveMenuItemRequest request) {
    try {
      menuService.moveMenuItem(menuId, request);
      return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Menu item moved successfully")));
    } catch (org.ssssy.backend.exception.BadRequestException | org.ssssy.backend.exception.ResourceNotFoundException e) {
      // Validation errors and not-found errors bubble through normal exception handlers
      throw e;
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(ApiResponse.error(e.getMessage()));
    }
  }

  /**
   * Task 16.2 — Find all menu items linked to a given page.
   * Used by the deletion safety dialog.
   * Requirements: 22.2
   * NOTE: path is /api/admin/menus/items (no {menuId}) to avoid conflict with /{menuId}/items
   */
  @GetMapping("/admin/menus/items")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<List<MenuItemWithMenuNameResponse>>> getMenuItemsByPage(
      @RequestParam UUID pageId) {
    return ResponseEntity.ok(ApiResponse.ok(menuService.findItemsByPageId(pageId)));
  }

  /**
   * Task 16.3 — Save page-menu placements (upsert/delete menu_items for a page).
   * Requirements: 13.4, 13.5, 13.6, 13.7
   */
  @PostMapping("/admin/pages/{pageId}/menu-placements")
  @PreAuthorize("hasRole('EDITOR') or hasRole('PUBLISHER') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
  public ResponseEntity<ApiResponse<Map<String, String>>> updateMenuPlacements(
      @PathVariable UUID pageId,
      @RequestBody List<MenuPlacementRequest> placements) {
    menuService.updatePageMenuPlacements(pageId, placements);
    return ResponseEntity.ok(ApiResponse.ok(Map.of("message", "Menu placements updated successfully")));
  }
}
