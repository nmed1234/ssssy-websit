package org.ssssy.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.ssssy.backend.exception.BadRequestException;
import org.ssssy.backend.exception.ResourceNotFoundException;
import org.ssssy.backend.model.dto.MenuItemRequest;
import org.ssssy.backend.model.dto.MenuItemResponse;
import org.ssssy.backend.model.dto.MenuItemWithMenuNameResponse;
import org.ssssy.backend.model.dto.MenuPlacementRequest;
import org.ssssy.backend.model.dto.MoveMenuItemRequest;
import org.ssssy.backend.model.dto.MenuRequest;
import org.ssssy.backend.model.dto.MenuResponse;
import org.ssssy.backend.model.entity.Menu;
import org.ssssy.backend.model.entity.MenuItem;
import org.ssssy.backend.model.entity.Page;
import org.ssssy.backend.repository.MenuItemRepository;
import org.ssssy.backend.repository.MenuRepository;
import org.ssssy.backend.repository.PageRepository;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

  private final MenuRepository menuRepository;
  private final MenuItemRepository menuItemRepository;
  private final PageRepository pageRepository;

  public List<MenuResponse> getActiveMenus() {
    return menuRepository.findAll().stream()
        .filter(Menu::getIsActive)
        .map(this::toMenuResponse)
        .collect(Collectors.toList());
  }

  public List<MenuResponse> getMenus() {
    return menuRepository.findAllByOrderByNameAsc().stream()
        .map(this::toMenuResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public MenuResponse createMenu(MenuRequest request) {
    Menu menu = Menu.builder()
        .name(request.getName())
        .location(request.getLocation())
        .isActive(request.getIsActive() != null && request.getIsActive())
        .menuTemplate(request.getMenuTemplate() != null ? request.getMenuTemplate() : "classic")
        .dropdownStyle(request.getDropdownStyle() != null ? request.getDropdownStyle() : "slide")
        .isDefaultStyle(request.getIsDefaultStyle() != null && request.getIsDefaultStyle())
        .styleConfig(request.getStyleConfig())
        .build();
    menu = menuRepository.save(menu);
    return toMenuResponse(menu);
  }

  @Transactional
  public MenuResponse updateMenu(UUID id, MenuRequest request) {
    Menu menu = menuRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + id));
    if (request.getName() != null) menu.setName(request.getName());
    if (request.getLocation() != null) menu.setLocation(request.getLocation());
    if (request.getIsActive() != null) menu.setIsActive(request.getIsActive());
    if (request.getMenuTemplate() != null) menu.setMenuTemplate(request.getMenuTemplate());
    if (request.getDropdownStyle() != null) menu.setDropdownStyle(request.getDropdownStyle());
    if (request.getIsDefaultStyle() != null) menu.setIsDefaultStyle(request.getIsDefaultStyle());
    if (request.getStyleConfig() != null) menu.setStyleConfig(request.getStyleConfig());
    menu = menuRepository.save(menu);
    return toMenuResponse(menu);
  }

  /**
   * Set this menu as the site-wide style default.
   * Clears isDefaultStyle on all other menus atomically.
   */
  @Transactional
  public MenuResponse setMenuAsDefault(UUID id) {
    Menu target = menuRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + id));
    // Clear default flag on all menus
    menuRepository.findAll().forEach(m -> {
      m.setIsDefaultStyle(false);
      menuRepository.save(m);
    });
    // Set this one as default
    target.setIsDefaultStyle(true);
    target = menuRepository.save(target);
    return toMenuResponse(target);
  }

  @Transactional
  public void deleteMenu(UUID id) {
    if (!menuRepository.existsById(id)) {
      throw new ResourceNotFoundException("Menu not found: " + id);
    }
    menuItemRepository.deleteByMenuId(id);
    menuRepository.deleteById(id);
  }

  public List<MenuItemResponse> getMenuItems(UUID menuId) {
    if (!menuRepository.existsById(menuId)) {
      throw new ResourceNotFoundException("Menu not found: " + menuId);
    }
    return menuItemRepository.findByMenuIdOrderBySortOrderAsc(menuId).stream()
        .map(this::toMenuItemResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public MenuItemResponse createMenuItem(MenuItemRequest request) {
    Menu menu = menuRepository.findById(request.getMenuId())
        .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + request.getMenuId()));
    MenuItem parent = null;
    if (request.getParentId() != null) {
      parent = menuItemRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found: " + request.getParentId()));
    }
    Page page = null;
    if (request.getPageId() != null) {
      page = pageRepository.findById(request.getPageId())
          .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + request.getPageId()));
    }
    MenuItem item = MenuItem.builder()
        .menu(menu)
        .parent(parent)
        .labelAr(request.getLabelAr())
        .labelEn(request.getLabelEn())
        .url(request.getUrl())
        .target(request.getTarget())
        .icon(request.getIcon())
        .page(page)
        .sortOrder(request.getSortOrder())
        // Default to true when the caller doesn't specify isActive (null → active)
        .isActive(!Boolean.FALSE.equals(request.getIsActive()))
        .build();
    item = menuItemRepository.save(item);
    return toMenuItemResponse(item);
  }

  @Transactional
  public MenuItemResponse updateMenuItem(UUID id, MenuItemRequest request) {
    MenuItem item = menuItemRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found: " + id));
    if (request.getMenuId() != null) {
      Menu menu = menuRepository.findById(request.getMenuId())
          .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + request.getMenuId()));
      item.setMenu(menu);
    }
    // Only update parent when parentId is explicitly present in the request.
    // Use a sentinel: if request carries a non-null UUID → set parent.
    // If request carries null AND labelEn/Ar are also being updated (i.e. a real edit call)
    // → clear the parent intentionally.
    // We distinguish "not sent" vs "sent as null" via the clearParent flag on the DTO.
    if (request.isClearParent()) {
      item.setParent(null);
    } else if (request.getParentId() != null) {
      MenuItem parent = menuItemRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found: " + request.getParentId()));
      item.setParent(parent);
    }
    if (request.getPageId() != null) {
      Page page = pageRepository.findById(request.getPageId())
          .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + request.getPageId()));
      item.setPage(page);
    } else {
      item.setPage(null);
    }
    if (request.getLabelAr() != null) item.setLabelAr(request.getLabelAr());
    if (request.getLabelEn() != null) item.setLabelEn(request.getLabelEn());
    if (request.getUrl() != null) item.setUrl(request.getUrl());
    if (request.getTarget() != null) item.setTarget(request.getTarget());
    if (request.getIcon() != null) item.setIcon(request.getIcon());
    if (request.getSortOrder() != null) item.setSortOrder(request.getSortOrder());
    if (request.getIsActive() != null) item.setIsActive(request.getIsActive());
    item = menuItemRepository.save(item);
    return toMenuItemResponse(item);
  }

  @Transactional
  public void deleteMenuItem(UUID id) {
    if (!menuItemRepository.existsById(id)) {
      throw new ResourceNotFoundException("MenuItem not found: " + id);
    }
    menuItemRepository.deleteById(id);
  }

  /**
   * Task 16.1 — Move a menu item: update its sort_order and parent_id.
   * Validates that the new nesting depth does not exceed 3 levels.
   * Requirements: 14.4, 14.5
   */
  @Transactional
  public void moveMenuItem(UUID menuId, MoveMenuItemRequest request) {
    MenuItem item = menuItemRepository.findById(request.getItemId())
        .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found: " + request.getItemId()));

    // Resolve new parent (nullable = top-level)
    MenuItem newParent = null;
    if (request.getParentId() != null) {
      newParent = menuItemRepository.findById(request.getParentId())
          .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found: " + request.getParentId()));

      // Validate nesting depth: walk the parent chain to count depth
      // The item itself is depth 1; its parent is depth 2; grandparent is depth 3.
      int depth = 2; // starting at the new parent
      MenuItem ancestor = newParent;
      while (ancestor.getParent() != null) {
        depth++;
        if (depth > 3) {
          throw new BadRequestException("Maximum nesting depth of 3 exceeded");
        }
        ancestor = ancestor.getParent();
      }
    }

    item.setParent(newParent);
    if (request.getSortOrder() != null) {
      item.setSortOrder(request.getSortOrder());
    }
    menuItemRepository.save(item);
  }

  /**
   * Task 16.2 — Find all menu items linked to a given page.
   * Used by the deletion safety dialog.
   * Requirements: 22.2
   */
  public List<MenuItemWithMenuNameResponse> findItemsByPageId(UUID pageId) {
    return menuItemRepository.findByPageId(pageId).stream()
        .map(this::toMenuItemWithMenuNameResponse)
        .collect(Collectors.toList());
  }

  /**
   * Task 16.3 — Update page-menu placements.
   * Given a pageId + list of {menuId, parentId} selections:
   * - Delete existing menu_items for this page that are NOT in the new list
   * - Upsert items for each selected menu
   * Requirements: 13.4, 13.5, 13.6, 13.7
   */
  @Transactional
  public void updatePageMenuPlacements(UUID pageId, List<MenuPlacementRequest> placements) {
    Page page = pageRepository.findById(pageId)
        .orElseThrow(() -> new ResourceNotFoundException("Page not found: " + pageId));

    // Collect the menu IDs we want to keep/upsert
    Set<UUID> targetMenuIds = placements.stream()
        .map(MenuPlacementRequest::getMenuId)
        .collect(Collectors.toSet());

    // Delete existing items for this page that are no longer in the placement list
    List<MenuItem> existing = menuItemRepository.findByPageId(pageId);
    for (MenuItem existingItem : existing) {
      if (!targetMenuIds.contains(existingItem.getMenu().getId())) {
        menuItemRepository.delete(existingItem);
      }
    }

    // Upsert an item for each placement
    boolean isActive = Boolean.TRUE.equals(page.getIsPublished());
    String url = "/" + page.getSlug();

    for (MenuPlacementRequest placement : placements) {
      Menu menu = menuRepository.findById(placement.getMenuId())
          .orElseThrow(() -> new ResourceNotFoundException("Menu not found: " + placement.getMenuId()));

      MenuItem parent = null;
      if (placement.getParentId() != null) {
        parent = menuItemRepository.findById(placement.getParentId())
            .orElseThrow(() -> new ResourceNotFoundException("Parent menu item not found: " + placement.getParentId()));
      }

      // Find existing item for this page+menu or create a new one
      MenuItem item = menuItemRepository.findByPageIdAndMenuId(pageId, placement.getMenuId())
          .orElse(null);

      if (item == null) {
        int nextSortOrder = menuItemRepository.findMaxSortOrderByMenuId(placement.getMenuId()) + 1;
        item = MenuItem.builder()
            .menu(menu)
            .page(page)
            .labelEn(page.getTitleEn())
            .labelAr(page.getTitleAr())
            .url(url)
            .parent(parent)
            .isActive(isActive)
            .sortOrder(nextSortOrder)
            .build();
      } else {
        // Update existing item fields
        item.setMenu(menu);
        item.setLabelEn(page.getTitleEn());
        item.setLabelAr(page.getTitleAr());
        item.setUrl(url);
        item.setParent(parent);
        item.setIsActive(isActive);
      }

      menuItemRepository.save(item);
    }
  }

  @Transactional
  public void reorderMenuItems(UUID menuId, List<UUID> itemIds) {
    if (!menuRepository.existsById(menuId)) {
      throw new ResourceNotFoundException("Menu not found: " + menuId);
    }
    for (int i = 0; i < itemIds.size(); i++) {
      UUID itemId = itemIds.get(i);
      MenuItem item = menuItemRepository.findById(itemId)
          .orElseThrow(() -> new ResourceNotFoundException("MenuItem not found: " + itemId));
      item.setSortOrder(i);
      menuItemRepository.save(item);
    }
  }

  private MenuResponse toMenuResponse(Menu menu) {
    // Use Boolean.TRUE.equals() — safe against null is_active values in the DB
    List<MenuItemResponse> items = menuItemRepository.findByMenuIdOrderBySortOrderAsc(menu.getId()).stream()
        .filter(i -> Boolean.TRUE.equals(i.getIsActive()))
        .map(this::toMenuItemResponse)
        .collect(Collectors.toList());
    return MenuResponse.builder()
        .id(menu.getId())
        .name(menu.getName())
        .location(menu.getLocation())
        .isActive(Boolean.TRUE.equals(menu.getIsActive()))
        .itemCount(items.size())
        .items(items)
        .createdAt(menu.getCreatedAt())
        .menuTemplate(menu.getMenuTemplate())
        .dropdownStyle(menu.getDropdownStyle())
        .isDefaultStyle(menu.getIsDefaultStyle())
        .styleConfig(menu.getStyleConfig())
        .build();
  }

  private MenuItemResponse toMenuItemResponse(MenuItem item) {
    return MenuItemResponse.builder()
        .id(item.getId())
        .menuId(item.getMenu() != null ? item.getMenu().getId() : null)
        .parentId(item.getParent() != null ? item.getParent().getId() : null)
        .labelAr(item.getLabelAr())
        .labelEn(item.getLabelEn())
        .url(item.getUrl())
        .target(item.getTarget())
        .icon(item.getIcon())
        .pageId(item.getPage() != null ? item.getPage().getId() : null)
        .sortOrder(item.getSortOrder())
        .isActive(Boolean.TRUE.equals(item.getIsActive()))
        .createdAt(item.getCreatedAt())
        .build();
  }

  private MenuItemWithMenuNameResponse toMenuItemWithMenuNameResponse(MenuItem item) {
    return MenuItemWithMenuNameResponse.builder()
        .id(item.getId())
        .menuId(item.getMenu() != null ? item.getMenu().getId() : null)
        .menuName(item.getMenu() != null ? item.getMenu().getName() : null)
        .parentId(item.getParent() != null ? item.getParent().getId() : null)
        .labelAr(item.getLabelAr())
        .labelEn(item.getLabelEn())
        .url(item.getUrl())
        .target(item.getTarget())
        .icon(item.getIcon())
        .pageId(item.getPage() != null ? item.getPage().getId() : null)
        .sortOrder(item.getSortOrder())
        .isActive(item.getIsActive())
        .createdAt(item.getCreatedAt())
        .build();
  }
}
