"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { staggerContainer, listItem } from "@/lib/animation-variants";
import {
  Users, HardDrive, Mail, AlertCircle, RefreshCw,
  Search, ToggleLeft, ToggleRight, Key, Trash2, Inbox,
  CheckSquare, Square, BarChart2, ExternalLink, PlusCircle,
  ShieldCheck, ShieldOff, Copy, Check, X,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────── */
interface EmailStats {
  totalAccounts: number;
  activeAccounts: number;
  totalStorageUsedBytes: number;
  totalStorageQuotaBytes?: number;
  totalEmailsSent?: number;
  totalEmailsReceived?: number;
}
interface EmailAccount {
  id: string;
  userId?: string;
  emailAddress: string;
  displayName?: string;
  isActive: boolean;
  quotaBytes: number;
  usedBytes: number;
  lastSyncAt?: string;
  createdAt?: string;
}
interface StorageReport {
  totalAccounts: number;
  totalStorageBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercent: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function fmtBytes(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), u.length - 1);
  return `${(b / Math.pow(1024, i)).toFixed(1)} ${u[i]}`;
}
function calcPct(used: number, quota: number) {
  if (!quota) return 0;
  return Math.min(Math.round((used / quota) * 100), 100);
}
function barColor(pct: number) {
  if (pct > 80) return "bg-red-500";
  if (pct > 50) return "bg-amber-400";
  return "bg-forest";
}

/* ── Skeleton row ────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-muted rounded animate-shimmer" />
        </td>
      ))}
    </tr>
  );
}

/* ── Reset-password modal ────────────────────────────────────────────── */
function ResetPasswordModal({ account, onClose }: { account: EmailAccount; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState(
    Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + "!"
  );
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/email/accounts/${account.id}/password`, { newPassword });
      onClose();
    } catch { } finally { setSaving(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl shadow-elevation-xl w-full max-w-md mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Reset Password</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Setting new password for <span className="font-medium text-foreground">{account.emailAddress}</span>
        </p>
        <div className="flex items-center gap-2 mb-4">
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-soil-clay/40"
          />
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-forest" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !newPassword.trim()}>
            {saving ? "Saving…" : "Set Password"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Provision modal ─────────────────────────────────────────────────── */
function ProvisionModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleProvision = async () => {
    if (!userId.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/email/account/provision", {}, { params: { userId } });
      onDone();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to provision account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-xl shadow-elevation-xl w-full max-w-md mx-4 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-foreground">Provision Email Account</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Creates a <span className="font-medium text-foreground">@ssssyria.org</span> inbox for an existing user.
        </p>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID (UUID)"
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-soil-clay/40 mb-3"
        />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleProvision} disabled={saving || !userId.trim()}>
            {saving ? "Provisioning…" : "Provision"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/*  Main Page                                                             */
/* ══════════════════════════════════════════════════════════════════════ */
export default function AdminEmailPage() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "accounts">("overview");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [resetTarget, setResetTarget] = useState<EmailAccount | null>(null);
  const [showProvision, setShowProvision] = useState(false);

  /* ── Queries ──────────────────────────────────────────────────────── */
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["admin-email-stats"],
    queryFn: async () => (await api.get<ApiResponse<EmailStats>>("/admin/email/stats")).data.data,
  });

  const { data: storage, isLoading: storageLoading } = useQuery({
    queryKey: ["admin-email-storage"],
    queryFn: async () => (await api.get<ApiResponse<StorageReport>>("/admin/email/storage-report")).data.data,
  });

  const { data: accounts, isLoading: accountsLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ["admin-email-accounts"],
    queryFn: async () => (await api.get<ApiResponse<EmailAccount[]>>("/admin/email/accounts")).data.data ?? [],
  });

  const refetchAll = useCallback(() => {
    refetchStats();
    refetchAccounts();
    qc.invalidateQueries({ queryKey: ["admin-email-storage"] });
  }, [refetchStats, refetchAccounts, qc]);

  /* ── Mutations ────────────────────────────────────────────────────── */
  const toggleActive = async (acct: EmailAccount) => {
    // Optimistic update
    qc.setQueryData<EmailAccount[]>(["admin-email-accounts"], (old) =>
      old?.map((a) => a.id === acct.id ? { ...a, isActive: !a.isActive } : a) ?? []
    );
    try {
      await api.put(`/admin/email/accounts/${acct.id}`, { isActive: !acct.isActive });
    } catch {
      // Revert
      qc.setQueryData<EmailAccount[]>(["admin-email-accounts"], (old) =>
        old?.map((a) => a.id === acct.id ? { ...a, isActive: acct.isActive } : a) ?? []
      );
    }
  };

  const handleBulkToggle = async (activate: boolean) => {
    const ids = Array.from(selectedIds);
    await api.post("/admin/email/accounts/bulk", { accountIds: ids, operation: activate ? "ACTIVATE" : "DEACTIVATE" });
    setSelectedIds(new Set());
    refetchAccounts();
  };

  /* ── Filtering ────────────────────────────────────────────────────── */
  const filtered = (accounts ?? []).filter((a) =>
    !search ||
    a.emailAddress.toLowerCase().includes(search.toLowerCase()) ||
    (a.displayName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };

  /* ── Stat cards ───────────────────────────────────────────────────── */
  const statCards = useMemo(() => [
    {
      label: t("Total Accounts", "إجمالي الحسابات"),
      value: stats?.totalAccounts ?? 0,
      sub: `${stats?.activeAccounts ?? 0} active`,
      icon: Users,
      bg: "bg-blue-100 dark:bg-blue-900/30",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: t("Storage Used", "المساحة المستخدمة"),
      value: fmtBytes(stats?.totalStorageUsedBytes ?? 0),
      sub: storage ? `${(storage.usagePercent ?? 0).toFixed(1)}% of total` : "",
      icon: HardDrive,
      bg: "bg-amber-100 dark:bg-amber-900/30",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t("Emails Sent", "الرسائل المرسلة"),
      value: stats?.totalEmailsSent ?? 0,
      sub: `${stats?.totalEmailsReceived ?? 0} received`,
      icon: Mail,
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t("Active Accounts", "الحسابات النشطة"),
      value: stats?.activeAccounts ?? 0,
      sub: stats ? `${Math.round(((stats.activeAccounts ?? 0) / Math.max(stats.totalAccounts, 1)) * 100)}% of total` : "",
      icon: ShieldCheck,
      bg: "bg-purple-100 dark:bg-purple-900/30",
      color: "text-purple-600 dark:text-purple-400",
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [stats, storage]);

  const isLoading = statsLoading || storageLoading;

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <AdminPageHeader
        title={t("Email Administration", "إدارة البريد الإلكتروني")}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Email" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/email/inbox">
              <Button variant="outline" size="sm">
                <Inbox className="h-4 w-4 mr-1.5" />
                {t("Open Inbox", "فتح البريد الوارد")}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={refetchAll}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              {t("Refresh", "تحديث")}
            </Button>
            <Button size="sm" onClick={() => setShowProvision(true)}>
              <PlusCircle className="h-4 w-4 mr-1.5" />
              {t("Provision Account", "إنشاء حساب")}
            </Button>
          </div>
        }
      />

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(["overview", "accounts"] as const).map((tabId) => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === tabId
                ? "border-soil-clay text-soil-clay"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tabId === "overview" ? t("Overview", "نظرة عامة") : t("Accounts", "الحسابات")}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  OVERVIEW TAB                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {tab === "overview" && (
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoading
              ? [...Array(4)].map((_, i) => (
                  <motion.div key={i} variants={listItem}>
                    <div className="bg-card border border-border rounded-xl p-5">
                      <div className="h-4 w-24 bg-muted rounded animate-shimmer mb-3" />
                      <div className="h-8 w-16 bg-muted rounded animate-shimmer" />
                    </div>
                  </motion.div>
                ))
              : statCards.map((sc) => (
                  <motion.div key={sc.label} variants={listItem}>
                    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-elevation-md transition-shadow overflow-hidden">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm text-muted-foreground">{sc.label}</p>
                        <div className={`p-2 rounded-lg ${sc.bg}`}>
                          <sc.icon className={`h-5 w-5 ${sc.color}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{sc.value}</p>
                      {sc.sub && <p className="text-xs text-muted-foreground mt-1">{sc.sub}</p>}
                      <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-4 -mx-5" />
                    </div>
                  </motion.div>
                ))}
          </div>

          {/* Storage bar */}
          {storage && (
            <motion.div variants={listItem}>
              <div className="bg-card border border-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-soil-clay" />
                    {t("Storage Usage", "استخدام المساحة")}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {fmtBytes(storage.usedBytes)} / {fmtBytes(storage.totalStorageBytes)}
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storage.usagePercent ?? 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${barColor(storage.usagePercent)}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{(storage.usagePercent ?? 0).toFixed(1)}% used</span>
                  <span>{fmtBytes(storage.availableBytes)} available</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick links */}
          <motion.div variants={listItem}>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">{t("Quick Actions", "إجراءات سريعة")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link href="/admin/email/inbox" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-soil-clay/10"><Inbox className="h-4 w-4 text-soil-clay" /></div>
                  <span className="text-sm font-medium">{t("View Inbox", "عرض البريد الوارد")}</span>
                </Link>
                <Link href="/email/compose" className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                  <div className="p-2 rounded-lg bg-forest/10"><Mail className="h-4 w-4 text-forest" /></div>
                  <span className="text-sm font-medium">{t("Compose Email", "إنشاء رسالة")}</span>
                </Link>
                <button
                  onClick={() => setShowProvision(true)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30"><PlusCircle className="h-4 w-4 text-purple-600" /></div>
                  <span className="text-sm font-medium">{t("Provision Account", "إنشاء حساب")}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/*  ACCOUNTS TAB                                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {tab === "accounts" && (
        <div>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search accounts…", "ابحث عن حساب…")}
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-soil-clay/40"
              />
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 bg-soil-clay/10 border border-soil-clay/30 rounded-lg px-3 py-1.5">
                <span className="text-sm font-medium text-soil-clay">{selectedIds.size} selected</span>
                <div className="w-px h-4 bg-soil-clay/30" />
                <button
                  onClick={() => handleBulkToggle(true)}
                  className="text-xs text-foreground hover:text-forest transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> Activate
                </button>
                <button
                  onClick={() => handleBulkToggle(false)}
                  className="text-xs text-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <ShieldOff className="h-3.5 w-3.5" /> Deactivate
                </button>
                <button onClick={() => setSelectedIds(new Set())} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <button onClick={toggleAll}>
                        {allSelected
                          ? <CheckSquare className="h-4 w-4 text-soil-clay" />
                          : <Square className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground">{t("Account", "الحساب")}</th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground hidden md:table-cell">{t("Storage", "التخزين")}</th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground">{t("Status", "الحالة")}</th>
                    <th className="py-3 px-4 text-left font-semibold text-muted-foreground hidden lg:table-cell">{t("Last Sync", "آخر مزامنة")}</th>
                    <th className="py-3 px-4 text-right font-semibold text-muted-foreground">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {accountsLoading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                    : filtered.length === 0
                      ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-muted-foreground">
                            <Mail className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>{search ? "No accounts match your search" : "No email accounts yet"}</p>
                          </td>
                        </tr>
                      )
                      : filtered.map((acct) => {
                          const pct = calcPct(acct.usedBytes, acct.quotaBytes);
                          return (
                            <tr
                              key={acct.id}
                              className={`border-b border-border transition-colors hover:bg-muted/30 ${
                                selectedIds.has(acct.id) ? "bg-soil-clay/5" : ""
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-3 px-4">
                                <button onClick={() => {
                                  setSelectedIds((prev) => {
                                    const n = new Set(prev);
                                    n.has(acct.id) ? n.delete(acct.id) : n.add(acct.id);
                                    return n;
                                  });
                                }}>
                                  {selectedIds.has(acct.id)
                                    ? <CheckSquare className="h-4 w-4 text-soil-clay" />
                                    : <Square className="h-4 w-4 text-muted-foreground" />}
                                </button>
                              </td>

                              {/* Account */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-soil-dark text-soil-sand flex items-center justify-center text-xs font-bold shrink-0">
                                    {(acct.displayName || acct.emailAddress).charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">{acct.emailAddress}</p>
                                    {acct.displayName && (
                                      <p className="text-xs text-muted-foreground truncate">{acct.displayName}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Storage */}
                              <td className="py-3 px-4 hidden md:table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${barColor(pct)}`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {fmtBytes(acct.usedBytes)}
                                  </span>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => toggleActive(acct)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                                    acct.isActive
                                      ? "bg-forest/10 text-forest hover:bg-forest/20"
                                      : "bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200"
                                  }`}
                                  title="Click to toggle"
                                >
                                  {acct.isActive
                                    ? <><ToggleRight className="h-3.5 w-3.5" /> Active</>
                                    : <><ToggleLeft className="h-3.5 w-3.5" /> Inactive</>}
                                </button>
                              </td>

                              {/* Last sync */}
                              <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell">
                                {acct.lastSyncAt ? new Date(acct.lastSyncAt).toLocaleString() : "Never"}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href="/admin/email/inbox"
                                    title="View inbox"
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                  <button
                                    onClick={() => setResetTarget(acct)}
                                    title="Reset password"
                                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors"
                                  >
                                    <Key className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      {resetTarget && (
        <ResetPasswordModal account={resetTarget} onClose={() => setResetTarget(null)} />
      )}
      {showProvision && (
        <ProvisionModal onClose={() => setShowProvision(false)} onDone={refetchAll} />
      )}
    </div>
  );
}
