"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllContacts, deleteContact, createContact, toggleContactFavorite } from "@/lib/email";
import type { EmailContact } from "@/types/email";
import { Users, Search, Trash2, Mail, Loader2, Star, UserPlus, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function ContactsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "", displayName: "", phone: "" });

  useEffect(() => {
    getAllContacts()
      .then((res) => { if (res.data.success) setContacts(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deleteContact(id).catch(() => {});
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggleFav = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleContactFavorite(id).catch(() => {});
    setContacts((prev) =>
      prev.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c)
    );
  };

  const handleCreate = async () => {
    if (!form.email.trim()) return;
    setSaving(true);
    try {
      const res = await createContact(form);
      if (res.data.success) {
        setContacts((prev) => [...prev, res.data.data]);
        setShowModal(false);
        setForm({ email: "", firstName: "", lastName: "", displayName: "", phone: "" });
      }
    } catch {} finally { setSaving(false); }
  };

  // Filter by search + optional groupId
  const filtered = useMemo(() => {
    let list = contacts;
    if (groupId) {
      list = list.filter((c) => c.groupIds?.includes(groupId));
    }
    if (searchQuery) {
      const ql = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.displayName ?? "").toLowerCase().includes(ql) ||
          (c.firstName ?? "").toLowerCase().includes(ql) ||
          (c.lastName ?? "").toLowerCase().includes(ql) ||
          c.email.toLowerCase().includes(ql) ||
          (c.company ?? "").toLowerCase().includes(ql)
      );
    }
    // Favorites first
    return [...list].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return (a.displayName || a.email).localeCompare(b.displayName || b.email);
    });
  }, [contacts, searchQuery, groupId]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-medium text-soil-dark flex items-center gap-2">
          <Users className="h-5 w-5 text-soil-clay" />
          Contacts
          {filtered.length > 0 && (
            <span className="text-xs text-earth-gray font-normal">({filtered.length})</span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/email/contacts/groups")} className="text-xs text-earth-gray">
            Groups
          </Button>
          <Button size="sm" className="bg-soil-clay hover:bg-soil-dark text-white text-xs" onClick={() => setShowModal(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1" /> New Contact
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
          <input
            type="text" placeholder="Search by name, email, or company…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-earth-gray">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-base font-medium text-soil-dark">No contacts</p>
            <p className="text-sm mt-0.5">Add contacts to your address book</p>
            <Button size="sm" className="mt-4 bg-soil-clay hover:bg-soil-dark text-white" onClick={() => setShowModal(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Add First Contact
            </Button>
          </div>
        ) : (
          filtered.map((contact) => {
            const initials = ((contact.displayName || contact.firstName || contact.email)[0] || "?").toUpperCase();
            const displayLabel = contact.displayName || `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email;
            return (
              <div key={contact.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-soil-clay/15 flex items-center justify-center text-soil-clay font-semibold text-sm flex-shrink-0">
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-soil-dark truncate">{displayLabel}</p>
                    {contact.isFavorite && <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-earth-gray truncate">{contact.email}</p>
                  {contact.company && <p className="text-xs text-earth-gray/70 truncate">{contact.company}</p>}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleToggleFav(contact.id, e)}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title={contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`h-3.5 w-3.5 transition-colors ${contact.isFavorite ? "text-amber-400 fill-amber-400" : "text-earth-gray hover:text-amber-400"}`} />
                  </button>
                  <button
                    onClick={() => router.push(`/email/compose?to=${contact.email}`)}
                    className="p-1.5 hover:bg-muted rounded text-earth-gray hover:text-soil-clay transition-colors"
                    title="Send email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                  </button>
                  {contact.phone && (
                    <span className="p-1.5 text-earth-gray" title={contact.phone}>
                      <Phone className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-earth-gray hover:text-red-500 transition-colors"
                    title="Delete contact"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-medium text-soil-dark">New Contact</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-5 w-5 text-earth-gray" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Email *</label>
                <input
                  type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-earth-gray mb-1 font-medium">First Name</label>
                  <input
                    type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                  />
                </div>
                <div>
                  <label className="block text-xs text-earth-gray mb-1 font-medium">Last Name</label>
                  <input
                    type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Display Name</label>
                <input
                  type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="How this contact appears in your list"
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                />
              </div>
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Phone</label>
                <input
                  type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={saving || !form.email.trim()}
                className="bg-soil-clay hover:bg-soil-dark text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Save Contact
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>}>
      <ContactsPageContent />
    </Suspense>
  );
}
