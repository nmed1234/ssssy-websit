"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getMenus,
  createMenu,
  updateMenu,
  updateMenuStyle,
  setMenuAsDefault,
  deleteMenu,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  moveMenuItem,
} from "@/lib/menus";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NavDropdown } from "@/components/layout/NavDropdown";
import type { Menu, MenuItem } from "@/types";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";
import {
  PencilLine,
  Trash2,
  Plus,
  Link2,
  GripVertical,
  Star,
  Save,
  LayoutList,
  LayoutGrid,
  Minus,
  CreditCard,
  Sparkles,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenItems(items: MenuItem[], parentId: string | null = null, depth = 0): FlatMenuItem[] {
  const result: FlatMenuItem[] = [];
  for (const item of items) {
    const { children: _children, ...rest } = item;
    result.push({ ...rest, parentId: parentId ?? item.parentId ?? null, depth });
    if (_children && _children.length > 0) {
      result.push(...flattenItems(_children, item.id, depth + 1));
    }
  }
  return result;
}

function getDepth(flat: FlatMenuItem[], parentId: string | null): number {
  if (!parentId) return 0;
  const parent = flat.find((i) => i.id === parentId);
  if (!parent) return 0;
  return 1 + getDepth(flat, parent.parentId ?? null);
}

function maxSubtreeDepth(flat: FlatMenuItem[], itemId: string): number {
  const children = flat.filter((i) => i.parentId === itemId);
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map((c) => maxSubtreeDepth(flat, c.id)));
}

const URL_PATTERN = /^(https?:\/\/|\/)[^\s]{0,2047}$/;
function isValidUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FlatMenuItem = Omit<MenuItem, "children" | "parentId"> & {
  depth: number;
  parentId: string | null;
};

// ─── Depth indicator colours per level ───────────────────────────────────────
const DEPTH_COLORS = ["bg-soil-clay/40", "bg-soil-rich/40", "bg-soil-dark/30"];

// ─── Template / animation metadata ───────────────────────────────────────────
const TEMPLATES = [
  {
    id: "classic",
    icon: LayoutList,
    label: "Classic",
    desc: "Standard dropdown list",
  },
  {
    id: "mega",
    icon: LayoutGrid,
    label: "Mega Menu",
    desc: "Wide 2-column panel",
  },
  {
    id: "minimal",
    icon: Minus,
    label: "Minimal",
    desc: "Clean floating links",
  },
  {
    id: "modern",
    icon: CreditCard,
    label: "Modern",
    desc: "Card items with accents",
  },
];

const ANIM_STYLES = [
  { id: "fade",  label: "Fade" },
  { id: "slide", label: "Slide" },
  { id: "scale", label: "Scale" },
  { id: "flip",  label: "Flip" },
];

// ─── SortableItemRow ──────────────────────────────────────────────────────────

interface SortableItemRowProps {
  item: FlatMenuItem;
  onEdit: (item: FlatMenuItem) => void;
  onDelete: (id: string) => void;
  isDragOverlay?: boolean;
}

function SortableItemRow({ item, onEdit, onDelete, isDragOverlay = false }: SortableItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const indentPx = item.depth * 24;
  const depthColor = DEPTH_COLORS[Math.min(item.depth, 2)];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center justify-between py-2 px-3 rounded-xl group transition-all
        ${isDragOverlay
          ? "shadow-lg bg-white border border-gray-200"
          : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }`}
    >
      {/* Depth accent bar */}
      {item.depth > 0 && (
        <div
          className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${depthColor}`}
          style={{ marginLeft: indentPx - 4 }}
        />
      )}

      <div className="flex items-center gap-2 min-w-0" style={{ paddingLeft: indentPx }}>
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none flex-shrink-0 p-0.5 rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`text-sm font-semibold truncate ${item.isActive === false ? "text-gray-400 line-through" : "text-gray-800"}`}>
              {item.labelEn || item.labelAr || "Untitled"}
            </p>
            {item.isActive === false && (
              <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-wide">
                hidden
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{item.url || "/"}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(item)}
          title="Edit"
          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <PencilLine className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="Delete"
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── StructureTab ─────────────────────────────────────────────────────────────

interface StructureTabProps {
  selectedMenu: Menu;
  onReloadMenus: () => void;
}

function StructureTab({ selectedMenu, onReloadMenus }: StructureTabProps) {
  const { t } = useLanguage();

  const [flatItems, setFlatItems] = useState<FlatMenuItem[]>([]);
  const [activeItem, setActiveItem] = useState<FlatMenuItem | null>(null);
  const preDragRef = useRef<FlatMenuItem[]>([]);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editItem, setEditItem] = useState<FlatMenuItem | null>(null);
  const [itemLabelEn, setItemLabelEn] = useState("");
  const [itemLabelAr, setItemLabelAr] = useState("");
  const [itemUrl, setItemUrl] = useState("/");
  const [itemTarget, setItemTarget] = useState<"_self" | "_blank">("_self");
  const [itemParentId, setItemParentId] = useState<string | null>(null);
  const [itemIsActive, setItemIsActive] = useState(true);
  const [itemSaving, setItemSaving] = useState(false);

  const [showCustomLinkForm, setShowCustomLinkForm] = useState(false);
  const [clLabelEn, setClLabelEn] = useState("");
  const [clLabelAr, setClLabelAr] = useState("");
  const [clUrl, setClUrl] = useState("");
  const [clTarget, setClTarget] = useState<"_self" | "_blank">("_self");
  const [clSaving, setClSaving] = useState(false);
  const [clUrlError, setClUrlError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const loadItems = useCallback(async () => {
    try {
      const res = await getMenuItems(selectedMenu.id);
      setFlatItems(flattenItems(res.data.data ?? []));
    } catch {
      toast.error("Failed to load menu items");
    }
  }, [selectedMenu.id]);

  useEffect(() => {
    setFlatItems([]);
    loadItems();
  }, [loadItems]);

  // ── Item CRUD ──

  function openCreateItem() {
    setEditItem(null);
    setItemLabelEn("");
    setItemLabelAr("");
    setItemUrl("/");
    setItemTarget("_self");
    setItemParentId(null);
    setItemIsActive(true);
    setShowItemForm(true);
  }

  function openEditItem(item: FlatMenuItem) {
    setEditItem(item);
    setItemLabelEn(item.labelEn || "");
    setItemLabelAr(item.labelAr || "");
    setItemUrl(item.url || "/");
    setItemTarget((item.target === "_blank" ? "_blank" : "_self") as "_self" | "_blank");
    setItemParentId(item.parentId ?? null);
    setItemIsActive(item.isActive !== false);
    setShowItemForm(true);
  }

  async function handleSaveItem() {
    if (!itemLabelEn.trim()) return;
    setItemSaving(true);
    try {
      if (editItem) {
        await updateMenuItem(editItem.id, {
          labelEn: itemLabelEn,
          labelAr: itemLabelAr || undefined,
          url: itemUrl,
          target: itemTarget,
          isActive: itemIsActive,
          // Send parentId when set; send clearParent:true when explicitly removed
          ...(itemParentId
            ? { parentId: itemParentId }
            : { clearParent: true }
          ),
        });
        toast.success("Item updated");
      } else {
        await createMenuItem(selectedMenu.id, {
          labelEn: itemLabelEn,
          labelAr: itemLabelAr || undefined,
          url: itemUrl,
          target: itemTarget,
          parentId: itemParentId ?? undefined,
          sortOrder: flatItems.length,
          isActive: itemIsActive,
        });
        toast.success("Item added");
      }
      setShowItemForm(false);
      await loadItems();
    } catch {
      toast.error("Failed to save item");
    }
    setItemSaving(false);
  }

  async function handleDeleteItem(id: string) {
    if (!confirm("Delete this menu item?")) return;
    try {
      await deleteMenuItem(id);
      toast.success("Item deleted");
      await loadItems();
    } catch {
      toast.error("Failed to delete item");
    }
  }

  // ── Custom Link ──

  function openCustomLinkForm() {
    setClLabelEn("");
    setClLabelAr("");
    setClUrl("");
    setClTarget("_self");
    setClUrlError("");
    setShowCustomLinkForm(true);
  }

  function handleClUrlChange(val: string) {
    setClUrl(val);
    if (val && !isValidUrl(val)) {
      setClUrlError("Please enter a valid URL (e.g. /about or https://example.com)");
    } else if (val.length > 2048) {
      setClUrlError("URL must be 2048 characters or fewer");
    } else {
      setClUrlError("");
    }
  }

  const clFormValid =
    clLabelEn.trim().length > 0 &&
    clLabelEn.trim().length <= 100 &&
    isValidUrl(clUrl) &&
    clUrl.length <= 2048;

  async function handleSaveCustomLink() {
    if (!clFormValid) return;
    setClSaving(true);
    try {
      await createMenuItem(selectedMenu.id, {
        labelEn: clLabelEn.trim(),
        labelAr: clLabelAr.trim() || undefined,
        url: clUrl.trim(),
        target: clTarget,
        sortOrder: flatItems.length,
        isActive: true,
      });
      toast.success("Custom link added");
      setShowCustomLinkForm(false);
      await loadItems();
    } catch {
      toast.error("Failed to add custom link");
    }
    setClSaving(false);
  }

  // ── Drag & Drop ──

  function handleDragStart(event: DragStartEvent) {
    const dragged = flatItems.find((i) => i.id === event.active.id);
    if (dragged) {
      setActiveItem(dragged);
      preDragRef.current = [...flatItems];
    }
  }

  function handleDragOver(_event: DragOverEvent) { /* depth check done in handleDragEnd */ }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = flatItems.findIndex((i) => i.id === active.id);
    const overIndex = flatItems.findIndex((i) => i.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const draggedItem = flatItems[activeIndex];
    const overItem = flatItems[overIndex];
    const newParentId = draggedItem.parentId;

    if (overItem.parentId !== newParentId) return;

    const ownDepth = getDepth(flatItems, newParentId);
    const subtreeHeight = maxSubtreeDepth(flatItems, draggedItem.id);
    if (ownDepth + subtreeHeight > 2) {
      toast.error("Maximum 3 levels of nesting", { id: "depth-toast" });
      setFlatItems(preDragRef.current);
      return;
    }

    const siblings = flatItems.filter(
      (i) => i.parentId === newParentId && i.id !== draggedItem.id
    );
    const overSiblingIndex = siblings.findIndex((i) => i.id === overItem.id);
    if (overSiblingIndex === -1) return;

    let newSortOrder: number;
    const movingDown = overIndex > activeIndex;
    if (movingDown) {
      const prev = siblings[overSiblingIndex];
      const next = siblings[overSiblingIndex + 1];
      const prevOrder = prev?.sortOrder ?? 0;
      const nextOrder = next?.sortOrder ?? prevOrder + 2;
      newSortOrder = (prevOrder + nextOrder) / 2;
    } else {
      const prev = siblings[overSiblingIndex - 1];
      const next = siblings[overSiblingIndex];
      const prevOrder = prev?.sortOrder ?? (next?.sortOrder ?? 0) - 2;
      const nextOrder = next?.sortOrder ?? prevOrder + 2;
      newSortOrder = (prevOrder + nextOrder) / 2;
    }

    const newFlat = flatItems.filter((i) => i.id !== draggedItem.id);
    const insertAt = overIndex > activeIndex ? overIndex : overIndex;
    newFlat.splice(insertAt, 0, { ...draggedItem, sortOrder: newSortOrder, parentId: newParentId });
    setFlatItems(newFlat);

    try {
      await moveMenuItem(selectedMenu.id, {
        itemId: draggedItem.id,
        parentId: newParentId,
        sortOrder: newSortOrder,
      });
    } catch {
      setFlatItems(preDragRef.current);
      toast.error("Failed to save new order. Reverted.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-base text-gray-800">{selectedMenu.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {flatItems.length} item{flatItems.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCustomLinkForm}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-soil-dark/30 text-soil-dark rounded-lg text-xs font-semibold hover:bg-soil-dark/5 transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" />
            {t("Add Link", "رابط مخصص")}
          </button>
          <button
            onClick={openCreateItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-soil-dark text-white rounded-lg text-xs font-semibold hover:bg-soil-clay transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("Add Item", "إضافة عنصر")}
          </button>
        </div>
      </div>

      {/* Item tree */}
      {flatItems.length === 0 ? (
        <div className="py-14 text-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
          <LayoutList className="h-8 w-8 mx-auto mb-2 opacity-30" />
          {t("No items yet — use the buttons above.", "لا توجد عناصر بعد.")}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={flatItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
              {flatItems.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  onEdit={openEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeItem && (
              <SortableItemRow
                item={activeItem}
                onEdit={() => {}}
                onDelete={() => {}}
                isDragOverlay
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* Custom Link inline form */}
      <AnimatePresence>
        {showCustomLinkForm && (
          <motion.div
            key="cl-form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="border border-dashed border-gray-300 rounded-2xl p-4 space-y-3 bg-gray-50/60"
          >
            <p className="text-sm font-bold text-gray-700">{t("Add Custom Link", "إضافة رابط مخصص")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Label (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={clLabelEn}
                  onChange={(e) => setClLabelEn(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                  placeholder="Home"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label (AR)</label>
                <input
                  type="text"
                  maxLength={100}
                  value={clLabelAr}
                  onChange={(e) => setClLabelAr(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                  placeholder="الرئيسية"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={2048}
                value={clUrl}
                onChange={(e) => handleClUrlChange(e.target.value)}
                className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30 ${clUrlError ? "border-red-400" : "border-gray-200"}`}
                placeholder="/about or https://example.com"
              />
              {clUrlError && <p className="text-xs text-red-500 mt-0.5">{clUrlError}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Open in</label>
              <select
                value={clTarget}
                onChange={(e) => setClTarget(e.target.value as "_self" | "_blank")}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
              >
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCustomLinkForm(false)}
                className="px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("Cancel", "إلغاء")}
              </button>
              <button
                onClick={handleSaveCustomLink}
                disabled={!clFormValid || clSaving}
                className="px-3 py-1.5 text-sm text-white bg-soil-dark rounded-lg hover:bg-soil-clay disabled:opacity-50 transition-colors"
              >
                {clSaving ? t("Saving…", "جارٍ الحفظ…") : t("Add Link", "إضافة رابط")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit / Create Item Modal */}
      <AnimatePresence>
        {showItemForm && (
          <motion.div
            key="item-modal"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <h2 className="font-bold text-lg mb-4 text-gray-800">
                {editItem ? t("Edit Menu Item", "تعديل عنصر القائمة") : t("Add Menu Item", "إضافة عنصر للقائمة")}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Label (EN)", "التسمية (إنجليزي)")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={itemLabelEn}
                    onChange={(e) => setItemLabelEn(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                    placeholder="About Us"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Label (AR)", "التسمية (عربي)")}
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={itemLabelAr}
                    onChange={(e) => setItemLabelAr(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                    placeholder="من نحن"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={itemUrl}
                    onChange={(e) => setItemUrl(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                    placeholder="/about"
                  />
                </div>

                {/* ── Parent Item selector ── */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("Parent Item", "العنصر الأب")}
                    <span className="ms-1.5 text-xs font-normal text-gray-400">
                      {t("(makes this a dropdown child)", "(يجعله عنصرًا فرعيًا)")}
                    </span>
                  </label>
                  <select
                    value={itemParentId ?? ""}
                    onChange={(e) => setItemParentId(e.target.value || null)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30 bg-white"
                  >
                    <option value="">— {t("Top level (no parent)", "مستوى أعلى (بلا أب)")} —</option>
                    {flatItems
                      .filter((fi) => fi.id !== editItem?.id && fi.parentId === null)
                      .map((fi) => (
                        <option key={fi.id} value={fi.id}>
                          {fi.labelEn || fi.labelAr || "Untitled"}
                        </option>
                      ))}
                  </select>
                  {itemParentId && (
                    <p className="text-[11px] text-soil-clay mt-1 flex items-center gap-1">
                      <span>↳</span>
                      <span>
                        {t("This item will appear in the dropdown of", "سيظهر هذا العنصر في قائمة")}{" "}
                        <strong>
                          {flatItems.find((fi) => fi.id === itemParentId)?.labelEn || "the selected parent"}
                        </strong>
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("Open in", "فتح في")}</label>
                  <select
                    value={itemTarget}
                    onChange={(e) => setItemTarget(e.target.value as "_self" | "_blank")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="_self">{t("Same tab", "نفس التبويب")}</option>
                    <option value="_blank">{t("New tab", "تبويب جديد")}</option>
                  </select>
                </div>

                {/* Active toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={itemIsActive}
                    onChange={(e) => setItemIsActive(e.target.checked)}
                    className="w-4 h-4 rounded accent-soil-clay"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t("Active (visible on site)", "نشط (مرئي في الموقع)")}
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowItemForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t("Cancel", "إلغاء")}
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={itemSaving || !itemLabelEn.trim()}
                  className="px-4 py-2 text-sm text-white bg-soil-dark rounded-xl hover:bg-soil-clay disabled:opacity-50 transition-colors"
                >
                  {itemSaving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MenuStylePreview ─────────────────────────────────────────────────────────

const FAKE_CHILDREN: MenuItem[] = [
  { id: "fc1", menuId: "preview", labelEn: "Overview",    labelAr: "نظرة عامة",  url: "#", isActive: true },
  { id: "fc2", menuId: "preview", labelEn: "Our Team",    labelAr: "فريقنا",     url: "#", isActive: true },
  { id: "fc3", menuId: "preview", labelEn: "Contact Us",  labelAr: "تواصل معنا", url: "#", isActive: true },
];

interface MenuStylePreviewProps {
  template: string;
  animStyle: string;
  bgColor: string;
  textColor: string;
  direction: string;
}

function MenuStylePreview({ template, animStyle, bgColor, textColor, direction }: MenuStylePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
      {/* Mock header bar */}
      <div className="flex items-center gap-1 px-4 py-3 bg-white border-b border-gray-100">
        {/* Fake logo */}
        <div className="w-7 h-7 rounded-lg bg-soil-clay/20 flex-shrink-0 mr-2" />
        {/* Fake items */}
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-soil-dark/55 hover:text-soil-dark cursor-pointer">
          Home
        </span>
        {/* Dropdown trigger */}
        <div className="relative">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              previewOpen ? "text-soil-clay bg-soil-clay/10" : "text-soil-dark/55 hover:text-soil-dark"
            }`}
            onClick={() => setPreviewOpen((o) => !o)}
          >
            About
            <motion.span animate={{ rotate: previewOpen ? 180 : 0 }} transition={{ duration: 0.18 }}>
              <ChevronDown className="h-3 w-3" />
            </motion.span>
          </button>
          <NavDropdown
            items={FAKE_CHILDREN}
            isOpen={previewOpen}
            template={template}
            animStyle={animStyle}
            direction={direction}
            bgColor={bgColor || undefined}
            textColor={textColor || undefined}
            onItemClick={() => setPreviewOpen(false)}
          />
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-soil-dark/55 hover:text-soil-dark cursor-pointer">
          Events
        </span>
      </div>
      {/* Preview caption */}
      <div className="px-4 py-2 text-center text-[11px] text-gray-400">
        Click <strong>About</strong> to preview the dropdown
      </div>
    </div>
  );
}

// ─── DesignStudioTab ──────────────────────────────────────────────────────────

interface DesignStudioTabProps {
  selectedMenu: Menu;
  draftTemplate: string;
  draftAnimStyle: string;
  draftBgColor: string;
  draftTextColor: string;
  setDraftTemplate: (v: string) => void;
  setDraftAnimStyle: (v: string) => void;
  setDraftBgColor: (v: string) => void;
  setDraftTextColor: (v: string) => void;
  onSaveStyle: () => Promise<void>;
  onSetDefault: () => Promise<void>;
  styleConfigSaving: boolean;
  direction: string;
}

function DesignStudioTab({
  selectedMenu,
  draftTemplate,
  draftAnimStyle,
  draftBgColor,
  draftTextColor,
  setDraftTemplate,
  setDraftAnimStyle,
  setDraftBgColor,
  setDraftTextColor,
  onSaveStyle,
  onSetDefault,
  styleConfigSaving,
  direction,
}: DesignStudioTabProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6">

      {/* ── Live Preview ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Live Preview</p>
        <MenuStylePreview
          template={draftTemplate}
          animStyle={draftAnimStyle}
          bgColor={draftBgColor}
          textColor={draftTextColor}
          direction={direction}
        />
      </div>

      {/* ── Template Picker ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Dropdown Template</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const selected = draftTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => setDraftTemplate(tpl.id)}
                className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all
                  ${selected
                    ? "border-soil-clay bg-soil-clay/6 ring-1 ring-soil-clay/20"
                    : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                  }`}
              >
                {selected && (
                  <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-soil-clay" />
                )}
                <div className={`p-2 rounded-lg ${selected ? "bg-soil-clay/15" : "bg-gray-100"}`}>
                  <Icon className={`h-4 w-4 ${selected ? "text-soil-clay" : "text-gray-500"}`} />
                </div>
                <span className={`text-sm font-bold ${selected ? "text-soil-clay" : "text-gray-700"}`}>
                  {tpl.label}
                </span>
                <span className="text-[11px] text-gray-400 leading-snug">{tpl.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Animation Style ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Animation Style</p>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {ANIM_STYLES.map((anim) => {
            const selected = draftAnimStyle === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => setDraftAnimStyle(anim.id)}
                className={`flex-1 py-2 text-xs font-semibold transition-all border-r last:border-r-0 border-gray-200
                  ${selected
                    ? "bg-soil-dark text-white"
                    : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                {anim.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Colour Overrides ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Colour Overrides</p>
        <p className="text-xs text-gray-400 mb-3">
          Leave empty to use the default site palette automatically.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Dropdown Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draftBgColor || "#ffffff"}
                onChange={(e) => setDraftBgColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={draftBgColor}
                onChange={(e) => setDraftBgColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
              />
            </div>
            {draftBgColor && (
              <button
                onClick={() => setDraftBgColor("")}
                className="mt-1 text-[11px] text-soil-clay hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Text Colour
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={draftTextColor || "#1a1a1a"}
                onChange={(e) => setDraftTextColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={draftTextColor}
                onChange={(e) => setDraftTextColor(e.target.value)}
                placeholder="#1a1a1a"
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
              />
            </div>
            {draftTextColor && (
              <button
                onClick={() => setDraftTextColor("")}
                className="mt-1 text-[11px] text-soil-clay hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
        <button
          onClick={onSaveStyle}
          disabled={styleConfigSaving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-soil-dark hover:bg-soil-clay disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          {styleConfigSaving ? t("Saving…", "جارٍ الحفظ…") : t("Save Style", "حفظ الأسلوب")}
        </button>

        <button
          onClick={onSetDefault}
          disabled={selectedMenu.isDefaultStyle}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all
            ${selectedMenu.isDefaultStyle
              ? "bg-amber-50 text-amber-600 border border-amber-200 cursor-default"
              : "border border-amber-300 text-amber-600 hover:bg-amber-50"
            }`}
        >
          <Star className={`h-4 w-4 ${selectedMenu.isDefaultStyle ? "fill-amber-500 text-amber-500" : ""}`} />
          {selectedMenu.isDefaultStyle
            ? t("Current Default Style", "الأسلوب الافتراضي الحالي")
            : t("Make This the Default Style", "تعيين كأسلوب افتراضي")
          }
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminMenusPage() {
  const { t, direction } = useLanguage();

  // Menu list state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [activeTab, setActiveTab] = useState<"structure" | "design">("structure");

  // Menu create / edit modal
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [menuName, setMenuName] = useState("");
  const [menuLocation, setMenuLocation] = useState("");
  const [menuActive, setMenuActive] = useState(true);
  const [menuTemplate, setMenuTemplate] = useState("classic");
  const [menuDropdownStyle, setMenuDropdownStyle] = useState("slide");
  const [menuSaving, setMenuSaving] = useState(false);

  // Design Studio draft state
  const [draftTemplate, setDraftTemplate] = useState("classic");
  const [draftAnimStyle, setDraftAnimStyle] = useState("slide");
  const [draftBgColor, setDraftBgColor] = useState("");
  const [draftTextColor, setDraftTextColor] = useState("");
  const [styleConfigSaving, setStyleConfigSaving] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMenus(); }, []);

  // Sync draft state when selected menu changes
  useEffect(() => {
    if (selectedMenu) {
      setDraftTemplate(selectedMenu.menuTemplate ?? "classic");
      setDraftAnimStyle(selectedMenu.dropdownStyle ?? "slide");
      try {
        const cfg = selectedMenu.styleConfig ? JSON.parse(selectedMenu.styleConfig) : {};
        setDraftBgColor(cfg.bgColor ?? "");
        setDraftTextColor(cfg.textColor ?? "");
      } catch {
        setDraftBgColor("");
        setDraftTextColor("");
      }
    }
  }, [selectedMenu]);

  async function fetchMenus() {
    setLoading(true);
    try {
      const res = await getMenus();
      const list: Menu[] = res.data.data ?? [];
      setMenus(list);
      // Keep selectedMenu in sync
      if (selectedMenu) {
        const updated = list.find((m) => m.id === selectedMenu.id);
        if (updated) setSelectedMenu(updated);
      }
    } catch {
      toast.error("Failed to load menus");
    }
    setLoading(false);
  }

  // ── Menu CRUD ──

  function openCreateMenu() {
    setEditMenu(null);
    setMenuName("");
    setMenuLocation("");
    setMenuActive(true);
    setMenuTemplate("classic");
    setMenuDropdownStyle("slide");
    setShowMenuForm(true);
  }

  function openEditMenu(menu: Menu, e: React.MouseEvent) {
    e.stopPropagation();
    setEditMenu(menu);
    setMenuName(menu.name);
    setMenuLocation(menu.location ?? "");
    setMenuActive(menu.isActive);
    setMenuTemplate(menu.menuTemplate ?? "classic");
    setMenuDropdownStyle(menu.dropdownStyle ?? "slide");
    setShowMenuForm(true);
  }

  async function handleSaveMenu() {
    if (!menuName.trim()) return;
    setMenuSaving(true);
    try {
      if (editMenu) {
        await updateMenu(editMenu.id, {
          name: menuName,
          location: menuLocation || undefined,
          isActive: menuActive,
          menuTemplate,
          dropdownStyle: menuDropdownStyle,
        });
        toast.success("Menu updated");
      } else {
        await createMenu({
          name: menuName,
          location: menuLocation || undefined,
          isActive: menuActive,
          menuTemplate,
          dropdownStyle: menuDropdownStyle,
        });
        toast.success("Menu created");
      }
      setShowMenuForm(false);
      await fetchMenus();
    } catch {
      toast.error("Failed to save menu");
    }
    setMenuSaving(false);
  }

  async function handleDeleteMenu(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this menu and all its items?")) return;
    try {
      await deleteMenu(id);
      toast.success("Menu deleted");
      if (selectedMenu?.id === id) {
        setSelectedMenu(null);
      }
      await fetchMenus();
    } catch {
      toast.error("Failed to delete menu");
    }
  }

  // ── Design Studio handlers ──

  async function handleSaveStyle() {
    if (!selectedMenu) return;
    setStyleConfigSaving(true);
    try {
      await updateMenuStyle(selectedMenu.id, {
        menuTemplate: draftTemplate,
        dropdownStyle: draftAnimStyle,
        styleConfig: JSON.stringify({
          bgColor: draftBgColor,
          textColor: draftTextColor,
        }),
      });
      toast.success("Style saved");
      await fetchMenus();
    } catch {
      toast.error("Failed to save style");
    }
    setStyleConfigSaving(false);
  }

  async function handleSetDefault() {
    if (!selectedMenu) return;
    try {
      await setMenuAsDefault(selectedMenu.id);
      toast.success(`"${selectedMenu.name}" is now the default style`);
      await fetchMenus();
    } catch {
      toast.error("Failed to set default");
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      <AdminPageHeader
        title={t("Menus", "القوائم")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Menus", "القوائم") },
        ]}
        actions={
          <button
            onClick={openCreateMenu}
            className="flex items-center gap-2 px-4 py-2 bg-soil-dark text-white rounded-xl text-sm font-semibold hover:bg-soil-clay transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("New Menu", "قائمة جديدة")}
          </button>
        }
      />

      <div className="flex gap-6 min-h-[70vh]">

        {/* ── Left sidebar: Menu list ── */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-1">
            {t("All Menus", "جميع القوائم")}
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : menus.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
              {t("No menus yet", "لا توجد قوائم بعد")}
            </div>
          ) : (
            <div className="space-y-2">
              {menus.map((menu) => {
                const selected = selectedMenu?.id === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => {
                      setSelectedMenu(menu);
                      setActiveTab("structure");
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all group
                      ${selected
                        ? "border-soil-clay/40 bg-soil-clay/4 ring-1 ring-soil-clay/20"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-sm font-bold truncate ${selected ? "text-soil-clay" : "text-gray-800"}`}>
                            {menu.name}
                          </span>
                          {menu.isDefaultStyle && (
                            <span title="Default style">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {menu.location && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-mono">
                              {menu.location}
                            </span>
                          )}
                          {menu.menuTemplate && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-soil-clay/10 text-soil-clay font-semibold capitalize">
                              {menu.menuTemplate}
                            </span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                            menu.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {menu.isActive ? "Active" : "Off"}
                          </span>
                        </div>
                      </div>
                      {/* Edit / Delete icon buttons */}
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => openEditMenu(menu, e)}
                          onKeyDown={(e) => e.key === "Enter" && openEditMenu(menu, e as unknown as React.MouseEvent)}
                          title="Edit menu"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteMenu(menu.id, e)}
                          onKeyDown={(e) => e.key === "Enter" && handleDeleteMenu(menu.id, e as unknown as React.MouseEvent)}
                          title="Delete menu"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* ── Right panel: Tabs ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {!selectedMenu ? (
            <div className="flex-1 flex items-center justify-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
              <div className="text-center text-gray-400">
                <LayoutList className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {t("Select a menu to manage it", "اختر قائمة لإدارتها")}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start">
                {(["structure", "design"] as const).map((tab) => {
                  const TabIcon = tab === "structure" ? LayoutList : Sparkles;
                  const tabLabel = tab === "structure"
                    ? t("Structure", "البنية")
                    : t("Design Studio", "استوديو التصميم");
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors
                        ${activeTab === tab ? "text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {activeTab === tab && (
                        <motion.span
                          layoutId="tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <TabIcon className="h-3.5 w-3.5 relative z-10 flex-shrink-0" />
                      <span className="relative z-10">{tabLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <AnimatePresence mode="wait">
                  {activeTab === "structure" ? (
                    <motion.div
                      key="structure"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <StructureTab
                        key={selectedMenu.id}
                        selectedMenu={selectedMenu}
                        onReloadMenus={fetchMenus}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="design"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <DesignStudioTab
                        selectedMenu={selectedMenu}
                        draftTemplate={draftTemplate}
                        draftAnimStyle={draftAnimStyle}
                        draftBgColor={draftBgColor}
                        draftTextColor={draftTextColor}
                        setDraftTemplate={setDraftTemplate}
                        setDraftAnimStyle={setDraftAnimStyle}
                        setDraftBgColor={setDraftBgColor}
                        setDraftTextColor={setDraftTextColor}
                        onSaveStyle={handleSaveStyle}
                        onSetDefault={handleSetDefault}
                        styleConfigSaving={styleConfigSaving}
                        direction={direction}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New / Edit Menu Modal ── */}
      <AnimatePresence>
        {showMenuForm && (
          <motion.div
            key="menu-modal-bg"
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            >
              <h2 className="font-bold text-xl mb-5 text-gray-800">
                {editMenu ? t("Edit Menu", "تعديل القائمة") : t("New Menu", "قائمة جديدة")}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("Name", "الاسم")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                    placeholder={t("Main Navigation", "القائمة الرئيسية")}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {t("Location", "الموقع")}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      ({t("e.g. header, footer", "مثال: header, footer")})
                    </span>
                  </label>
                  <input
                    type="text"
                    value={menuLocation}
                    onChange={(e) => setMenuLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soil-clay/30"
                    placeholder="header"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Template</label>
                    <select
                      value={menuTemplate}
                      onChange={(e) => setMenuTemplate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    >
                      {TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Animation</label>
                    <select
                      value={menuDropdownStyle}
                      onChange={(e) => setMenuDropdownStyle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    >
                      {ANIM_STYLES.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${menuActive ? "bg-soil-dark" : "bg-gray-200"}`}
                    onClick={() => setMenuActive(!menuActive)}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${menuActive ? "right-0.5" : "left-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {t("Active", "نشط")}
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowMenuForm(false)}
                  className="px-4 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {t("Cancel", "إلغاء")}
                </button>
                <button
                  onClick={handleSaveMenu}
                  disabled={menuSaving || !menuName.trim()}
                  className="px-4 py-2.5 text-sm text-white bg-soil-dark rounded-xl hover:bg-soil-clay disabled:opacity-50 transition-colors"
                >
                  {menuSaving ? t("Saving…", "جارٍ الحفظ…") : t("Save", "حفظ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
