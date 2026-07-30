"use client";

import { useEffect, useState } from "react";
import { getMyAccount, updateAccount, changePassword } from "@/lib/email";
import type { EmailAccount } from "@/types/email";
import {
  Settings, Loader2, Eye, EyeOff, Server, Bell,
  ChevronRight, Check, X as XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Small Save SVG (no import conflict) ──────────────────────────────────────
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

type Tab = "profile" | "autoreply" | "forwarding" | "security" | "imap";

export default function EmailSettingsPage() {
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Profile
  const [displayName, setDisplayName] = useState("");
  const [signature, setSignature] = useState("");

  // Auto-reply
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState("");
  const [autoReplyBody, setAutoReplyBody] = useState("");
  const [autoReplyStart, setAutoReplyStart] = useState("");
  const [autoReplyEnd, setAutoReplyEnd] = useState("");

  // Forwarding
  const [forwardEnabled, setForwardEnabled] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [forwardKeepCopy, setForwardKeepCopy] = useState(true);

  // Security / password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    getMyAccount()
      .then((res) => {
        if (res.data.success) {
          const a = res.data.data;
          setAccount(a);
          setDisplayName(a.displayName || "");
          setSignature(a.signature || "");
          setForwardTo(a.forwardTo || "");
          setForwardKeepCopy(a.forwardKeepCopy ?? true);
          setForwardEnabled(!!a.forwardTo);
          setAutoReplyEnabled(a.autoReplyEnabled || false);
          setAutoReplySubject(a.autoReplySubject || "");
          setAutoReplyBody(a.autoReplyBody || "");
          setAutoReplyStart(a.autoReplyStartsAt ? a.autoReplyStartsAt.slice(0, 16) : "");
          setAutoReplyEnd(a.autoReplyEndsAt ? a.autoReplyEndsAt.slice(0, 16) : "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAccount({
        displayName,
        signature,
        autoReplyEnabled,
        autoReplySubject: autoReplyEnabled ? autoReplySubject : undefined,
        autoReplyBody: autoReplyEnabled ? autoReplyBody : undefined,
        autoReplyStartsAt: autoReplyEnabled && autoReplyStart ? autoReplyStart : undefined,
        autoReplyEndsAt: autoReplyEnabled && autoReplyEnd ? autoReplyEnd : undefined,
        forwardTo: forwardEnabled ? forwardTo : "",
        forwardKeepCopy,
      });
      showMsg("success", "Settings saved successfully");
    } catch {
      showMsg("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showMsg("success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      showMsg("error", "Failed to change password. Check your current password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
    { key: "autoreply", label: "Auto-Reply", icon: <Bell className="h-4 w-4" /> },
    { key: "forwarding", label: "Forwarding", icon: <ChevronRight className="h-4 w-4" /> },
    { key: "security", label: "Security", icon: <Eye className="h-4 w-4" /> },
    { key: "imap", label: "IMAP / Phase 2", icon: <Server className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-card shrink-0">
        <Settings className="h-5 w-5 text-soil-clay" />
        <h1 className="text-lg font-medium text-soil-dark">Email Settings</h1>
        {account && (
          <span className="ml-auto text-sm text-earth-gray">{account.emailAddress}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border bg-muted/20 shrink-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.key
                ? "border-soil-clay text-soil-dark font-medium"
                : "border-transparent text-earth-gray hover:text-soil-dark"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      {message && (
        <div className={`mx-6 mt-3 px-4 py-2 rounded-md text-sm flex items-center gap-2 border ${
          message.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {message.type === "success" ? <Check className="h-4 w-4" /> : <XIcon className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Profile ──────────────────────────────────── */}
        {activeTab === "profile" && (
          <>
            {/* Account info card */}
            <section>
              <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Account</h2>
              <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm border border-border">
                <div className="flex justify-between">
                  <span className="text-earth-gray">Email address</span>
                  <span className="text-soil-dark font-medium">{account?.emailAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-gray">Username</span>
                  <span className="text-soil-dark">{account?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-gray">Storage used</span>
                  <span className="text-soil-dark">
                    {((account?.usedBytes || 0) / 1_048_576).toFixed(0)} MB / {((account?.quotaBytes || 0) / 1_073_741_824).toFixed(0)} GB
                  </span>
                </div>
                {/* Storage bar */}
                <div className="w-full bg-border rounded-full h-1.5 mt-1">
                  <div
                    className="bg-soil-clay h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((account?.usedBytes || 0) / (account?.quotaBytes || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Display & Signature</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-soil-dark mb-1">Display Name</label>
                  <input
                    type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                    placeholder="Your name as it appears to recipients"
                  />
                </div>
                <div>
                  <label className="block text-sm text-soil-dark mb-1">Email Signature</label>
                  <textarea
                    value={signature} onChange={(e) => setSignature(e.target.value)} rows={4}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background resize-y"
                    placeholder="Add a signature to all your outgoing emails…"
                  />
                </div>
              </div>
            </section>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-soil-clay hover:bg-soil-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <SaveIcon className="h-4 w-4 mr-1" />}
                Save Changes
              </Button>
            </div>
          </>
        )}

        {/* ── Auto-Reply ───────────────────────────────── */}
        {activeTab === "autoreply" && (
          <>
            <section>
              <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Automatic Reply</h2>
              <div className="space-y-4">
                {/* Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setAutoReplyEnabled((e) => !e)}
                    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${autoReplyEnabled ? "bg-soil-clay" : "bg-border"}`}
                  >
                    <div className={`w-4 h-4 m-0.5 bg-white rounded-full shadow transition-transform ${autoReplyEnabled ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm text-soil-dark">
                    {autoReplyEnabled ? "Auto-reply is ON" : "Auto-reply is off"}
                  </span>
                </label>

                {autoReplyEnabled && (
                  <div className="space-y-3 pl-1 border-l-2 border-soil-clay/30 ml-1">
                    <div>
                      <label className="block text-sm text-soil-dark mb-1">Reply Subject</label>
                      <input
                        type="text" value={autoReplySubject} onChange={(e) => setAutoReplySubject(e.target.value)}
                        placeholder="e.g. I'm out of office until Dec 31"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-soil-dark mb-1">Reply Message</label>
                      <textarea
                        value={autoReplyBody} onChange={(e) => setAutoReplyBody(e.target.value)} rows={4}
                        placeholder="I'm currently unavailable and will respond when I return…"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-soil-dark mb-1">Active from</label>
                        <input
                          type="datetime-local" value={autoReplyStart} onChange={(e) => setAutoReplyStart(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-soil-dark mb-1">Active until</label>
                        <input
                          type="datetime-local" value={autoReplyEnd} onChange={(e) => setAutoReplyEnd(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-soil-clay hover:bg-soil-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <SaveIcon className="h-4 w-4 mr-1" />}
                Save Auto-Reply
              </Button>
            </div>
          </>
        )}

        {/* ── Forwarding ───────────────────────────────── */}
        {activeTab === "forwarding" && (
          <>
            <section>
              <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Email Forwarding</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForwardEnabled((e) => !e)}
                    className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 ${forwardEnabled ? "bg-soil-clay" : "bg-border"}`}
                  >
                    <div className={`w-4 h-4 m-0.5 bg-white rounded-full shadow transition-transform ${forwardEnabled ? "translate-x-5" : ""}`} />
                  </div>
                  <span className="text-sm text-soil-dark">
                    {forwardEnabled ? "Forwarding enabled" : "Forwarding disabled"}
                  </span>
                </label>

                {forwardEnabled && (
                  <div className="space-y-3 pl-1 border-l-2 border-soil-clay/30 ml-1">
                    <div>
                      <label className="block text-sm text-soil-dark mb-1">Forward to address</label>
                      <input
                        type="email" value={forwardTo} onChange={(e) => setForwardTo(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-soil-dark">
                      <input
                        type="checkbox" checked={forwardKeepCopy} onChange={(e) => setForwardKeepCopy(e.target.checked)}
                        className="rounded border-border accent-soil-clay"
                      />
                      Keep a copy in this inbox
                    </label>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-800">
                  <strong>Note:</strong> Forwarding only works to other <code className="text-xs">@ssssyria.org</code> addresses in Phase 1. External forwarding (Gmail, Outlook) requires Phase 2 (Mailcow).
                </div>
              </div>
            </section>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving} className="bg-soil-clay hover:bg-soil-dark text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <SaveIcon className="h-4 w-4 mr-1" />}
                Save Forwarding
              </Button>
            </div>
          </>
        )}

        {/* ── Security ─────────────────────────────────── */}
        {activeTab === "security" && (
          <section>
            <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider mb-3">Change Email Password</h2>
            <div className="space-y-3 max-w-sm">
              <div className="relative">
                <label className="block text-sm text-soil-dark mb-1">Current Password</label>
                <input
                  type={showPassword ? "text" : "password"} value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay pr-10 bg-background"
                />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-earth-gray hover:text-soil-dark">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <label className="block text-sm text-soil-dark mb-1">New Password</label>
                <input
                  type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                />
              </div>
              <Button
                size="sm" variant="outline"
                onClick={handleChangePassword}
                disabled={passwordSaving || !currentPassword || !newPassword}
              >
                {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Change Password
              </Button>
            </div>
          </section>
        )}

        {/* ── IMAP / Phase 2 info ──────────────────────── */}
        {activeTab === "imap" && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xs font-semibold text-earth-gray uppercase tracking-wider">IMAP / SMTP Access</h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Phase 2</span>
            </div>

            <div className="bg-muted/40 border border-border rounded-lg p-6 space-y-4 opacity-60 select-none">
              <p className="text-sm text-earth-gray">
                Connect Outlook, Thunderbird, or your phone&apos;s mail app using these settings. Available after Phase 2 (Mailcow) deployment.
              </p>
              <div className="grid gap-3 text-sm">
                {[
                  ["IMAP Server", "mail.ssssyria.org"],
                  ["IMAP Port", "993 (SSL/TLS)"],
                  ["SMTP Server", "mail.ssssyria.org"],
                  ["SMTP Port", "587 (STARTTLS)"],
                  ["Username", account?.emailAddress || "your@ssssyria.org"],
                  ["Password", "Your email account password"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="text-earth-gray font-medium">{label}</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded text-soil-dark">{value}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 bg-soil-clay/5 border border-soil-clay/20 rounded-lg p-4">
              <p className="text-sm text-soil-dark font-medium mb-1">🚀 Coming in Phase 2</p>
              <p className="text-sm text-earth-gray">
                Phase 2 integrates Mailcow mail server — enabling real IMAP access, sending to Gmail/Outlook, 
                SPF/DKIM authentication, and phone mail app support.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
