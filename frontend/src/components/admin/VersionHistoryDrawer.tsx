"use client";

import { useState, useEffect } from "react";
import { X, Clock, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import type { SiteSectionVersion } from "@/types";
import { getSiteSectionVersions, rollbackSiteSection } from "@/lib/site-sections";

interface Props {
  sectionId: string;
  sectionName: string;
  currentVersionCount: number;
  onClose: () => void;
  onRolledBack: () => void;
}

export default function VersionHistoryDrawer({ sectionId, sectionName, currentVersionCount, onClose, onRolledBack }: Props) {
  const [versions, setVersions] = useState<SiteSectionVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getSiteSectionVersions(sectionId)
      .then((res) => {
        const data = res.data?.data;
        if (data) setVersions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sectionId]);

  const handleRollback = async (versionNumber: number) => {
    if (!confirm(`Restore version ${versionNumber} to draft? The current draft will be replaced.`)) return;
    setRollingBack(versionNumber);
    try {
      await rollbackSiteSection(sectionId, versionNumber);
      setDone(versionNumber);
      setTimeout(() => {
        onRolledBack();
        onClose();
      }, 800);
    } catch {
      alert("Rollback failed. Please try again.");
    } finally {
      setRollingBack(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Version History</h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{sectionName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Clock className="h-8 w-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No version history yet</p>
              <p className="text-xs mt-1">Versions are created when you publish a section</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {versions.map((v, i) => {
                const isLatest = i === 0;
                const isRestored = done === v.versionNumber;
                return (
                  <div
                    key={v.id}
                    className={`relative border rounded-xl p-4 transition-all ${
                      isLatest
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-4 top-4 w-2 h-2 rounded-full ${isLatest ? "bg-green-600" : "bg-gray-300"}`} />
                    {i < versions.length - 1 && (
                      <div className="absolute left-[18px] top-6 bottom-[-14px] w-0.5 bg-gray-200" />
                    )}

                    <div className="pl-5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Version {v.versionNumber}</span>
                            {isLatest && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          {v.changeSummary && (
                            <p className="text-xs text-gray-500 mt-0.5">{v.changeSummary}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {v.createdAt ? new Date(v.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </span>
                        {v.publishedBy && (
                          <span className="text-gray-400">by <span className="text-gray-600 font-medium">{v.publishedBy}</span></span>
                        )}
                      </div>

                      {!isLatest && (
                        <button
                          onClick={() => handleRollback(v.versionNumber)}
                          disabled={rollingBack !== null}
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-green-700 transition-colors disabled:opacity-50"
                        >
                          {isRestored ? (
                            <><CheckCircle className="h-3.5 w-3.5 text-green-600" />Restored!</>
                          ) : rollingBack === v.versionNumber ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Restoring...</>
                          ) : (
                            <><RotateCcw className="h-3.5 w-3.5" />Restore to Draft</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 text-center">
            Restoring sets the section back to Draft — you must publish to make it live
          </p>
        </div>
      </div>
    </>
  );
}
