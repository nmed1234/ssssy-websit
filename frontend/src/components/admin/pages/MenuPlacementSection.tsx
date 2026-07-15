"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { Menu, MenuItem } from "@/types/index";

// ─── Types ────────────────────────────────────────────────────────────────────

/** One entry in the POST /api/admin/pages/{pageId}/menu-placements array. */
interface MenuPlacementPayload {
  menuId: string;
  parentId: string | null;
}

/** Shape of a menu item linked to a page (from GET /api/admin/menus/items?pageId=). */
interface LinkedMenuItemResponse {
  id: string;
  menuId: string;
  menuName?: string;
  parentId?: string | null;
  labelAr?: string;
  labelEn?: string;
  url?: string;
  pageId?: string;
  isActive?: boolean;
}

/** Per-menu state managed locally. */
interface MenuState {
  checked: boolean;
  /** ID of selected parent item, or null / "" for top-level. */
  parentId: string | null;
  /** Top-level items fetched for this menu (null = not yet fetched). */
  topLevelItems: MenuItem[] | null;
  loadingItems: boolean;
  itemsError: string | null;
}

export interface MenuPlacementSectionProps {
  pageId: string;
  pageSlug: string;
  pageTitleEn: string;
  pageTitleAr: string;
  onSaveComplete?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function unwrap<T>(res: { data: { data?: T; success?: boolean } | T }): T {
  const d = res.data;
  if (d && typeof d === "object" && "data" in d) {
    return (d as { data: T }).data as T;
  }
  return d as T;
}

// ─── MenuPlacementSection ─────────────────────────────────────────────────────

/**
 * Collapsible "Menu Placement" section for the page settings sidebar.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */
export function MenuPlacementSection({
  pageId,
  pageSlug,
  pageTitleEn,
  pageTitleAr,
  onSaveComplete,
}: MenuPlacementSectionProps) {
  // ── Section collapse ──
  const [expanded, setExpanded] = useState(false);

  // ── Menus master list ──
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [menusError, setMenusError] = useState<string | null>(null);

  // ── Per-menu state map: menuId → MenuState ──
  const [menuStates, setMenuStates] = useState<Record<string, MenuState>>({});

  // ── Save state ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // ── Fetch menus + current linkages on first expand ────────────────────────

  const fetchData = useCallback(async () => {
    setMenusLoading(true);
    setMenusError(null);

    try {
      // Parallel: all menus + items already linked to this page
      const [menusRes, linkedRes] = await Promise.all([
        api.get<{ data: Menu[] }>("/admin/menus"),
        api.get<{ data: LinkedMenuItemResponse[] }>("/admin/menus/items", {
          params: { pageId },
        }),
      ]);

      const allMenus: Menu[] = unwrap(menusRes) ?? [];
      const linkedItems: LinkedMenuItemResponse[] = unwrap(linkedRes) ?? [];

      setMenus(allMenus);

      // Build initial state from linked items
      const initial: Record<string, MenuState> = {};
      for (const menu of allMenus) {
        const menuId = String(menu.id);
        const linked = linkedItems.find((li) => String(li.menuId) === menuId);
        initial[menuId] = {
          checked: !!linked,
          parentId: linked?.parentId ?? null,
          topLevelItems: null,
          loadingItems: false,
          itemsError: null,
        };
      }
      setMenuStates(initial);
    } catch (err) {
      console.error("MenuPlacementSection: failed to load menus", err);
      setMenusError("Failed to load menus. Please try again.");
    } finally {
      setMenusLoading(false);
    }
  }, [pageId]);

  // Fetch once when the section is first expanded
  useEffect(() => {
    if (expanded && menus.length === 0 && !menusLoading) {
      fetchData();
    }
  }, [expanded, menus.length, menusLoading, fetchData]);

  // ── Fetch top-level items for a menu ──────────────────────────────────────

  const fetchTopLevelItems = useCallback(async (menuId: string) => {
    setMenuStates((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], loadingItems: true, itemsError: null },
    }));
    try {
      const res = await api.get<{ data: MenuItem[] }>(
        `/admin/menus/${menuId}/items`
      );
      const items: MenuItem[] = unwrap(res) ?? [];
      // Keep only top-level items (parentId === null or undefined)
      const topLevel = items.filter((it) => !it.parentId);
      setMenuStates((prev) => ({
        ...prev,
        [menuId]: { ...prev[menuId], topLevelItems: topLevel, loadingItems: false },
      }));
    } catch (err) {
      console.error("MenuPlacementSection: failed to load menu items", err);
      setMenuStates((prev) => ({
        ...prev,
        [menuId]: {
          ...prev[menuId],
          loadingItems: false,
          itemsError: "Failed to load menu items.",
        },
      }));
    }
  }, []);

  // ── Handle checkbox toggle ─────────────────────────────────────────────────

  function handleCheckboxChange(menuId: string, checked: boolean) {
    setMenuStates((prev) => {
      const current = prev[menuId];
      const next: MenuState = { ...current, checked };
      if (checked && current.topLevelItems === null && !current.loadingItems) {
        // Trigger fetch asynchronously
        setTimeout(() => fetchTopLevelItems(menuId), 0);
        next.loadingItems = true;
      }
      if (!checked) {
        // Reset parent selection when unchecking
        next.parentId = null;
      }
      return { ...prev, [menuId]: next };
    });
  }

  // ── Handle parent selection ───────────────────────────────────────────────

  function handleParentChange(menuId: string, parentId: string | null) {
    setMenuStates((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], parentId },
    }));
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    // Build the placements array: one entry per checked menu
    const placements: MenuPlacementPayload[] = Object.entries(menuStates)
      .filter(([, state]) => state.checked)
      .map(([menuId, state]) => ({
        menuId,
        parentId: state.parentId || null,
      }));

    // Unchecked menus should result in deletion of any existing menu_item.
    // The backend endpoint handles upsert + delete automatically:
    // it creates items for all entries in the list and deletes any existing
    // items for this page that are not in the list.
    try {
      await api.post(`/admin/pages/${pageId}/menu-placements`, placements);
      setSavedAt(Date.now());
      onSaveComplete?.();
    } catch (err) {
      console.error("MenuPlacementSection: save failed", err);
      setSaveError("Failed to save menu placements. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Computed state ────────────────────────────────────────────────────────

  const checkedCount = Object.values(menuStates).filter((s) => s.checked).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section
      aria-label="Menu Placement"
      className="rounded-lg border bg-card overflow-hidden"
    >
      {/* ── Section header / toggle ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3",
          "text-sm font-semibold text-foreground hover:bg-accent/40 transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-soil-clay/50"
        )}
        aria-expanded={expanded}
        aria-controls="menu-placement-panel"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden />
          )}
          <span>Menu Placement</span>
          {checkedCount > 0 && (
            <span className="ml-1 rounded-full bg-soil-clay/15 text-soil-clay text-xs font-medium px-2 py-0.5">
              {checkedCount}
            </span>
          )}
        </div>
        {savedAt && !saving && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-normal">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
      </button>

      {/* ── Panel body ── */}
      {expanded && (
        <div id="menu-placement-panel" className="border-t px-4 py-4 space-y-4">

          {/* Loading state */}
          {menusLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading menus…</span>
            </div>
          )}

          {/* Error state */}
          {menusError && !menusLoading && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span>{menusError}</span>
                <button
                  type="button"
                  onClick={fetchData}
                  className="ml-2 underline hover:no-underline text-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!menusLoading && !menusError && menus.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No menus found. Create a menu first in the{" "}
              <a
                href="/admin/menus"
                className="underline hover:no-underline text-foreground"
                target="_blank"
                rel="noopener noreferrer"
              >
                Menu Builder
              </a>
              .
            </p>
          )}

          {/* Menu list */}
          {!menusLoading && !menusError && menus.length > 0 && (
            <ul className="space-y-3" role="list">
              {menus.map((menu) => {
                const menuId = String(menu.id);
                const state = menuStates[menuId];
                if (!state) return null;

                return (
                  <li key={menuId} className="space-y-2">
                    {/* Checkbox row */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={state.checked}
                        onChange={(e) =>
                          handleCheckboxChange(menuId, e.target.checked)
                        }
                        className="w-4 h-4 rounded border-input accent-soil-clay focus:ring-2 focus:ring-soil-clay/40"
                        aria-label={`Add page to menu: ${menu.name}`}
                      />
                      <span className="text-sm text-foreground group-hover:text-foreground/80">
                        {menu.name}
                      </span>
                      {!menu.isActive && (
                        <span className="text-xs text-muted-foreground">(inactive)</span>
                      )}
                    </label>

                    {/* Parent item dropdown — only shown when checked */}
                    {state.checked && (
                      <div className="ml-6 space-y-1.5">
                        <label
                          htmlFor={`parent-select-${menuId}`}
                          className="block text-xs font-medium text-muted-foreground"
                        >
                          Parent item
                        </label>

                        {/* Loading items spinner */}
                        {state.loadingItems && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Loading items…</span>
                          </div>
                        )}

                        {/* Items load error */}
                        {state.itemsError && !state.loadingItems && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            {state.itemsError}
                          </p>
                        )}

                        {/* Dropdown */}
                        {!state.loadingItems && !state.itemsError && (
                          <select
                            id={`parent-select-${menuId}`}
                            value={state.parentId ?? ""}
                            onChange={(e) =>
                              handleParentChange(
                                menuId,
                                e.target.value === "" ? null : e.target.value
                              )
                            }
                            className={cn(
                              "w-full border rounded-md px-3 py-1.5 text-sm outline-none",
                              "bg-background border-input",
                              "focus:ring-2 focus:ring-soil-clay/40 transition-colors"
                            )}
                            aria-label={`Parent item in menu ${menu.name}`}
                          >
                            {/* Requirement 13.3 — "(None — top level)" option */}
                            <option value="">
                              (None — top level)
                            </option>
                            {(state.topLevelItems ?? []).map((item) => (
                              <option key={String(item.id)} value={String(item.id)}>
                                {item.labelEn || item.labelAr || item.url || String(item.id)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Save error banner */}
          {saveError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Save button */}
          {!menusLoading && !menusError && menus.length > 0 && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "w-full flex items-center justify-center gap-2",
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "bg-soil-dark text-white hover:bg-soil-darker",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-soil-clay/50"
              )}
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? "Saving…" : "Save Menu Placement"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default MenuPlacementSection;
