"use client";

/**
 * BulkActions — generic bulk-operation toolbar with:
 *   • delete, approve, reject, publish (existing)
 *   • bulk edit modal (status, tags, categories, publish date) — NEW
 *   • bulk duplicate — NEW
 *   • bulk archive — NEW
 */

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2, CheckCircle, XCircle, Send,
  Pencil, Copy, Archive, X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BulkEditValues {
  status?: string;
  tags?: string;          // comma-separated tag names
  categoryId?: string;
  publishDate?: string;   // ISO date string
}

interface BulkActionsProps<T> {
  items: T[];
  idKey?: keyof T;
  /** Available statuses shown in the bulk-edit dropdown (e.g. ["DRAFT","PUBLISHED"]) */
  statusOptions?: string[];
  onDelete?: (ids: string[]) => void;
  onApprove?: (ids: string[]) => void;
  onReject?: (ids: string[]) => void;
  onPublish?: (ids: string[]) => void;
  /** Called with ids + field changes from the bulk-edit modal */
  onBulkEdit?: (ids: string[], values: BulkEditValues) => void;
  onDuplicate?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  children: (props: {
    selectedIds: Set<string>;
    isSelected: (id: string) => boolean;
    toggle: (id: string) => void;
    toggleAll: () => void;
    allSelected: boolean;
    someSelected: boolean;
    clearSelection: () => void;
    SelectAllCheckbox: () => JSX.Element;
    RowCheckbox: ({ id }: { id: string }) => JSX.Element;
  }) => React.ReactNode;
}

// ── Bulk Edit Modal ───────────────────────────────────────────────────────────

function BulkEditModal({
  count,
  statusOptions,
  onApply,
  onClose,
}: {
  count: number;
  statusOptions: string[];
  onApply: (values: BulkEditValues) => void;
  onClose: () => void;
}) {
  const [status, setStatus]          = useState("");
  const [tags, setTags]              = useState("");
  const [categoryId, setCategoryId]  = useState("");
  const [publishDate, setPublishDate] = useState("");

  const hasChanges = status || tags || categoryId || publishDate;

  const handleApply = () => {
    const values: BulkEditValues = {};
    if (status)      values.status      = status;
    if (tags)        values.tags        = tags;
    if (categoryId)  values.categoryId  = categoryId;
    if (publishDate) values.publishDate = publishDate;
    onApply(values);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-md mx-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-base font-semibold">Bulk Edit</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Editing {count} selected item{count !== 1 ? "s" : ""}. Only filled fields will be updated.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="p-4 space-y-4">
          {statusOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">— keep unchanged —</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              placeholder="tag1, tag2, tag3 (comma separated)"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-0.5">Replaces existing tags on all selected items.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category ID</label>
            <input
              type="text"
              placeholder="Enter category UUID (leave blank to keep)"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Publish Date</label>
            <input
              type="datetime-local"
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-0.5">Schedules all selected items to publish at this time.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            disabled={!hasChanges}
            onClick={handleApply}
            className="bg-primary text-primary-foreground"
          >
            Apply to {count} item{count !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl shadow-xl w-full max-w-sm mx-4 border border-border p-6 space-y-4">
        <p className="text-sm">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className={danger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground"}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main BulkActions ──────────────────────────────────────────────────────────

export function BulkActions<T extends Record<string, any>>({
  items,
  idKey = "id" as keyof T,
  statusOptions = [],
  onDelete,
  onApprove,
  onReject,
  onPublish,
  onBulkEdit,
  onDuplicate,
  onArchive,
  children,
}: BulkActionsProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editModalOpen, setEditModalOpen]       = useState(false);
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [confirmArchive, setConfirmArchive]     = useState(false);
  const [confirmDelete, setConfirmDelete]       = useState(false);

  const allIds     = items.map((item) => String(item[idKey]));
  const allSelected  = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, allIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);
  const selectedArray  = Array.from(selectedIds);

  const SelectAllCheckbox = () => (
    <Checkbox
      checked={someSelected ? ("indeterminate" as const) : allSelected}
      onCheckedChange={toggleAll}
    />
  );

  const RowCheckbox = ({ id }: { id: string }) => (
    <Checkbox checked={selectedIds.has(id)} onCheckedChange={() => toggle(id)} />
  );

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 mb-3 bg-muted rounded-lg text-sm">
          <span className="text-muted-foreground font-medium">{selectedIds.size} selected</span>
          <div className="flex flex-wrap gap-1 ml-auto">
            {/* Bulk Edit */}
            {onBulkEdit && (
              <Button
                variant="ghost" size="sm" className="h-8 text-blue-700"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            {/* Duplicate */}
            {onDuplicate && (
              <Button
                variant="ghost" size="sm" className="h-8 text-indigo-700"
                onClick={() => setConfirmDuplicate(true)}
              >
                <Copy className="h-4 w-4 mr-1" /> Duplicate
              </Button>
            )}
            {/* Approve */}
            {onApprove && (
              <Button
                variant="ghost" size="sm" className="h-8 text-green-700"
                onClick={() => { onApprove(selectedArray); clearSelection(); }}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            {/* Reject */}
            {onReject && (
              <Button
                variant="ghost" size="sm" className="h-8 text-orange-700"
                onClick={() => { onReject(selectedArray); clearSelection(); }}
              >
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            )}
            {/* Publish */}
            {onPublish && (
              <Button
                variant="ghost" size="sm" className="h-8 text-sky-700"
                onClick={() => { onPublish(selectedArray); clearSelection(); }}
              >
                <Send className="h-4 w-4 mr-1" /> Publish
              </Button>
            )}
            {/* Archive */}
            {onArchive && (
              <Button
                variant="ghost" size="sm" className="h-8 text-amber-700"
                onClick={() => setConfirmArchive(true)}
              >
                <Archive className="h-4 w-4 mr-1" /> Archive
              </Button>
            )}
            {/* Delete */}
            {onDelete && (
              <Button
                variant="ghost" size="sm" className="h-8 text-red-600"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {children({
        selectedIds,
        isSelected: (id) => selectedIds.has(id),
        toggle,
        toggleAll,
        allSelected,
        someSelected,
        clearSelection,
        SelectAllCheckbox,
        RowCheckbox,
      })}

      {/* Bulk Edit Modal */}
      {editModalOpen && onBulkEdit && (
        <BulkEditModal
          count={selectedIds.size}
          statusOptions={statusOptions}
          onApply={(values) => { onBulkEdit(selectedArray, values); clearSelection(); }}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {/* Duplicate confirm */}
      {confirmDuplicate && onDuplicate && (
        <ConfirmDialog
          message={`Duplicate ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""}? Each will be created as a draft copy.`}
          confirmLabel="Duplicate"
          onConfirm={() => { onDuplicate(selectedArray); clearSelection(); setConfirmDuplicate(false); }}
          onCancel={() => setConfirmDuplicate(false)}
        />
      )}

      {/* Archive confirm */}
      {confirmArchive && onArchive && (
        <ConfirmDialog
          message={`Archive ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""}? They will be hidden from public views.`}
          confirmLabel="Archive"
          onConfirm={() => { onArchive(selectedArray); clearSelection(); setConfirmArchive(false); }}
          onCancel={() => setConfirmArchive(false)}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && onDelete && (
        <ConfirmDialog
          message={`Permanently delete ${selectedIds.size} item${selectedIds.size !== 1 ? "s" : ""}? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { onDelete(selectedArray); clearSelection(); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
