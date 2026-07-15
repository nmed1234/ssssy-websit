"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckCircle, XCircle, Send } from "lucide-react";

interface BulkActionsProps<T> {
  items: T[];
  idKey?: keyof T;
  onDelete?: (ids: string[]) => void;
  onApprove?: (ids: string[]) => void;
  onReject?: (ids: string[]) => void;
  onPublish?: (ids: string[]) => void;
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

export function BulkActions<T extends Record<string, any>>({
  items,
  idKey = "id" as keyof T,
  onDelete,
  onApprove,
  onReject,
  onPublish,
  children,
}: BulkActionsProps<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = items.map((item) => String(item[idKey]));
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      return new Set(allIds);
    });
  }, [allSelected, allIds]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedArray = Array.from(selectedIds);

  const SelectAllCheckbox = () => (
    <Checkbox checked={someSelected ? "indeterminate" as const : allSelected} onCheckedChange={toggleAll} />
  );

  const RowCheckbox = ({ id }: { id: string }) => (
    <Checkbox checked={selectedIds.has(id)} onCheckedChange={() => toggle(id)} />
  );

  return (
    <div>
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-muted rounded-lg text-sm">
          <span className="text-muted-foreground">{selectedIds.size} selected</span>
          <div className="flex gap-1 ml-auto">
            {onDelete && (
              <Button variant="ghost" size="sm" className="text-red-600 h-8" onClick={() => { onDelete(selectedArray); clearSelection(); }}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            {onApprove && (
              <Button variant="ghost" size="sm" className="text-green-600 h-8" onClick={() => { onApprove(selectedArray); clearSelection(); }}>
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
            )}
            {onReject && (
              <Button variant="ghost" size="sm" className="text-red-600 h-8" onClick={() => { onReject(selectedArray); clearSelection(); }}>
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            )}
            {onPublish && (
              <Button variant="ghost" size="sm" className="text-blue-600 h-8" onClick={() => { onPublish(selectedArray); clearSelection(); }}>
                <Send className="h-4 w-4 mr-1" /> Publish
              </Button>
            )}
          </div>
        </div>
      )}
      {children({ selectedIds, isSelected: (id: string) => selectedIds.has(id), toggle, toggleAll, allSelected, someSelected, clearSelection, SelectAllCheckbox, RowCheckbox })}
    </div>
  );
}
