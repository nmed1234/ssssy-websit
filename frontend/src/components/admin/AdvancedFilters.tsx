"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/admin/SearchBar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterChip {
  label: string;
  value: string;
}

interface AdvancedFiltersProps {
  chips?: FilterChip[];
  statusOptions?: string[];
  dateRange?: boolean;
  searchPlaceholder?: string;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter?: string;
  onStatusChange?: (v: string) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange?: (v: string) => void;
  onDateToChange?: (v: string) => void;
}

export function AdvancedFilters({
  chips = [],
  statusOptions = [],
  dateRange = false,
  searchPlaceholder = "Search...",
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: AdvancedFiltersProps) {
  const hasActiveFilters = search || (statusFilter && statusFilter !== "ALL") || dateFrom || dateTo;

  const clearAll = () => {
    onSearchChange("");
    if (onStatusChange) onStatusChange("ALL");
    if (onDateFromChange) onDateFromChange("");
    if (onDateToChange) onDateToChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
        </div>
        {statusOptions.length > 0 && onStatusChange && (
          <div className="flex gap-1 flex-wrap">
            {statusOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => onStatusChange(opt === statusFilter ? "ALL" : opt)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  (statusFilter || "ALL") === opt
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {opt === "ALL" ? "All" : opt.charAt(0) + opt.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {dateRange && onDateFromChange && onDateToChange && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Date:</span>
          <input
            type="date"
            value={dateFrom || ""}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateTo || ""}
            onChange={(e) => onDateToChange(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
          />
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {chips.map((chip) => (
            <span key={chip.value} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
              {chip.label}
            </span>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
          <X className="h-3 w-3 mr-1" /> Clear filters
        </Button>
      )}
    </div>
  );
}
