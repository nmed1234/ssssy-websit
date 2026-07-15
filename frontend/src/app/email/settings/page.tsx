"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyAccount, updateAccount, changePassword } from "@/lib/email";
import type { EmailAccount } from "@/types/email";
import { Settings, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmailSettingsPage() {
  const router = useRouter();
  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [signature, setSignature] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardKeepCopy, setForwardKeepCopy] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState("");
  const [autoReplyBody, setAutoReplyBody] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
          setAutoReplyEnabled(a.autoReplyEnabled || false);
          setAutoReplySubject(a.autoReplySubject || "");
          setAutoReplyBody(a.autoReplyBody || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateAccount({ displayName, signature });
      setMessage({ type: "success", text: "Settings saved successfully" });
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setPasswordSaving(true);
    setMessage(null);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setMessage({ type: "error", text: "Failed to change password. Check your current password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>;
  }

  return (
    <div className="flex flex-col h-full bg-card overflow-y-auto">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <Settings className="h-5 w-5 text-soil-clay" />
        <h1 className="text-lg font-medium text-soil-dark">Email Settings</h1>
      </div>

      {message && (
        <div className={`mx-6 mt-4 px-4 py-2 rounded-md text-sm ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="p-6 space-y-8">
        {/* Account Info */}
        <section>
          <h2 className="text-sm font-medium text-earth-gray uppercase tracking-wider mb-3">Account</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-earth-gray">Email</span><span className="text-soil-dark">{account?.emailAddress}</span></div>
            <div className="flex justify-between"><span className="text-earth-gray">Username</span><span className="text-soil-dark">{account?.username}</span></div>
            <div className="flex justify-between"><span className="text-earth-gray">Storage</span><span className="text-soil-dark">{((account?.usedBytes || 0) / 1048576).toFixed(0)}MB / {((account?.quotaBytes || 0) / 1073741824).toFixed(0)}GB</span></div>
          </div>
        </section>

        {/* Display & Signature */}
        <section>
          <h2 className="text-sm font-medium text-earth-gray uppercase tracking-wider mb-3">Display & Signature</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-soil-dark mb-1">Display Name</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
            </div>
            <div>
              <label className="block text-sm text-soil-dark mb-1">Signature</label>
              <textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={3}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section>
          <h2 className="text-sm font-medium text-earth-gray uppercase tracking-wider mb-3">Change Password</h2>
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-sm text-soil-dark mb-1">Current Password</label>
              <input type={showPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay pr-10" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-earth-gray hover:text-soil-dark">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <label className="block text-sm text-soil-dark mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
            </div>
            <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={passwordSaving || !currentPassword || !newPassword}>
              {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Change Password
            </Button>
          </div>
        </section>

        {/* Save button */}
        <div className="pt-4 border-t border-gray-200">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
