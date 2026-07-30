"use client";

/**
 * VersionDiffViewer — side-by-side diff between two content version snapshots.
 *
 * Compares any two `ContentVersionHistory` records fetched from
 *   GET /api/admin/version-history/{contentType}/{contentId}/{versionNumber}
 *
 * Renders a two-column table: left = version A (older), right = version B (newer).
 * Each row shows one top-level JSON field; changed values are highlighted.
 */

import { useState, useEffect, useCallback } from "react";
import { getVersionHistory, getVersionByNumber, rollbackContentItem } from "@/lib/content-versions";
import type { ContentVersionHistory } from "@/lib/content-versions";
import { RotateCcw, ChevronDown } from "lucide-react";

interface VersionDiffViewerProps {
  contentType: string;
  contentId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tryParse(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw) as Record<string, unknown>; } catch { return { raw }; }
}

function stringify(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v, null, 2);
  return String(v);
}

function DiffCell({ a, b, isLeft }: { a: unknown; b: unknown; isLeft: boolean }) {
  const aStr = stringify(a);
  const bStr = stringify(b);
  const changed = aStr !== bStr;
  const value  = isLeft ? aStr : bStr;
  const absent = isLeft ? a === undefined : b === undefined;

  const bg = absent
    ? "bg-gray-50 text-gray-300 italic"
    : changed
      ? isLeft
        ? "bg-red-50 text-red-800"
        : "bg-green-50 text-green-800"
      : "bg-white text-gray-700";

  return (
    <td className={`px-3 py-2 align-top text-xs font-mono whitespace-pre-wrap break-words max-w-[300px] w-1/2 ${bg}`}>
      {absent ? "not present" : value}
    </td>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function VersionDiffViewer({ contentType, contentId }: VersionDiffViewerProps) {
  const [versions, setVersions] = useState<ContentVersionHistory[]>([]);
  const [loading, setLoading]   = useState(false);
  const [versionA, setVersionA] = useState<number | null>(null);
  const [versionB, setVersionB] = useState<number | null>(null);
  const [snapA, setSnapA]       = useState<ContentVersionHistory | null>(null);
  const [snapB, setSnapB]       = useState<ContentVersionHistory | null>(null);
  const [rolling, setRolling]   = useState(false);
  const [rollMsg, setRollMsg]   = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // Fetch version list
  useEffect(() => {
    setLoading(true);
    getVersionHistory(contentType, contentId)
      .then((res) => {
        const list = res.data.data ?? [];
        setVersions(list);
        if (list.length >= 2) {
          setVersionA(list[list.length - 1].versionNumber); // oldest
          setVersionB(list[0].versionNumber);               // newest
        } else if (list.length === 1) {
          setVersionA(list[0].versionNumber);
          setVersionB(list[0].versionNumber);
        }
      })
      .catch(() => setError("Failed to load version history."))
      .finally(() => setLoading(false));
  }, [contentType, contentId]);

  // Fetch snapshot details whenever selection changes
  const loadSnapshot = useCallback(
    async (ver: number, setter: (v: ContentVersionHistory | null) => void) => {
      const res = await getVersionByNumber(contentType, contentId, ver);
      setter(res.data.data ?? null);
    },
    [contentType, contentId]
  );

  useEffect(() => {
    if (versionA !== null) loadSnapshot(versionA, setSnapA);
  }, [versionA, loadSnapshot]);

  useEffect(() => {
    if (versionB !== null) loadSnapshot(versionB, setSnapB);
  }, [versionB, loadSnapshot]);

  const handleRollback = async (ver: number) => {
    if (!window.confirm(`Roll back to version ${ver}? This will create a new snapshot.`)) return;
    setRolling(true);
    setRollMsg(null);
    try {
      const res = await rollbackContentItem(contentId, ver);
      setRollMsg(`Rolled back — new version ${res.data.data?.newVersion ?? "created"}.`);
      // Refresh list
      const fresh = await getVersionHistory(contentType, contentId);
      setVersions(fresh.data.data ?? []);
    } catch {
      setRollMsg("Rollback failed. Please try again.");
    } finally {
      setRolling(false);
    }
  };

  // Compute diff rows
  const dataA = snapA ? tryParse(snapA.dataSnapshot) : null;
  const dataB = snapB ? tryParse(snapB.dataSnapshot) : null;
  const allKeys = dataA && dataB
    ? Array.from(new Set([...Object.keys(dataA), ...Object.keys(dataB)]))
    : [];
  const changedKeys = allKeys.filter((k) => stringify(dataA?.[k]) !== stringify(dataB?.[k]));
  const unchangedKeys = allKeys.filter((k) => !changedKeys.includes(k));

  if (loading) return <p className="text-sm text-muted-foreground p-4">Loading versions…</p>;
  if (error)   return <p className="text-sm text-red-600 p-4">{error}</p>;
  if (versions.length === 0) return <p className="text-sm text-muted-foreground p-4">No versions available yet.</p>;

  return (
    <div className="space-y-4">
      {/* Version selectors */}
      <div className="flex flex-wrap gap-4 items-end rounded-lg border bg-card p-4">
        {(["A", "B"] as const).map((side) => {
          const sel = side === "A" ? versionA : versionB;
          const setSel = side === "A" ? setVersionA : setVersionB;
          const label = side === "A" ? "Compare (older)" : "Against (newer)";
          return (
            <div key={side} className="flex flex-col gap-1 min-w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <div className="relative">
                <select
                  className="w-full appearance-none border rounded-md px-3 py-2 text-sm pr-8 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={sel ?? ""}
                  onChange={(e) => setSel(Number(e.target.value))}
                >
                  {versions.map((v) => (
                    <option key={v.versionNumber} value={v.versionNumber}>
                      v{v.versionNumber} — {v.createdByName ?? "unknown"} — {new Date(v.createdAt).toLocaleString()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              {sel !== null && (
                <button
                  disabled={rolling}
                  onClick={() => handleRollback(sel)}
                  className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 mt-1 disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" /> Rollback to v{sel}
                </button>
              )}
            </div>
          );
        })}
        {rollMsg && (
          <p className={`text-xs mt-1 ${rollMsg.includes("failed") ? "text-red-600" : "text-green-700"}`}>
            {rollMsg}
          </p>
        )}
      </div>

      {/* Diff table */}
      {dataA && dataB && (
        <div className="rounded-lg border overflow-hidden text-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground w-32">Field</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-red-700 w-1/2">
                  v{versionA} — {snapA?.createdByName}
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-green-700 w-1/2">
                  v{versionB} — {snapB?.createdByName}
                </th>
              </tr>
            </thead>
            <tbody>
              {changedKeys.length > 0 && (
                <>
                  <tr className="bg-amber-50">
                    <td colSpan={3} className="px-3 py-1 text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                      Changed ({changedKeys.length})
                    </td>
                  </tr>
                  {changedKeys.map((k) => (
                    <tr key={k} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-xs font-mono font-semibold text-gray-700 align-top">{k}</td>
                      <DiffCell a={dataA[k]} b={dataB[k]} isLeft={true} />
                      <DiffCell a={dataA[k]} b={dataB[k]} isLeft={false} />
                    </tr>
                  ))}
                </>
              )}
              {unchangedKeys.length > 0 && (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      Unchanged ({unchangedKeys.length})
                    </td>
                  </tr>
                  {unchangedKeys.map((k) => (
                    <tr key={k} className="border-t border-gray-100 opacity-60">
                      <td className="px-3 py-2 text-xs font-mono text-gray-500 align-top">{k}</td>
                      <DiffCell a={dataA[k]} b={dataB[k]} isLeft={true} />
                      <DiffCell a={dataA[k]} b={dataB[k]} isLeft={false} />
                    </tr>
                  ))}
                </>
              )}
              {allKeys.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No fields to compare — snapshots may be empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
