"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllContacts, deleteContact, createContact } from "@/lib/email";
import type { EmailContact } from "@/types/email";
import { Users, Search, Trash2, Mail, Loader2, Star, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactsPage() {
  const router = useRouter();
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
    await deleteContact(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
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

  const filtered = searchQuery
    ? contacts.filter((c) =>
        (c.displayName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <h1 className="text-lg font-medium text-soil-dark">Contacts</h1>
        <Button size="sm" variant="outline" onClick={() => setShowModal(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> New Contact
        </Button>
      </div>

      <div className="px-4 py-2 border-b border-border bg-card">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-earth-gray" />
          <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-soil-clay" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-earth-gray">
            <Users className="h-12 w-12 mb-3 text-soil-sand" />
            <p className="text-lg font-medium">No contacts</p>
            <p className="text-sm">Add contacts to your address book</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-soil-clay/10 flex items-center justify-center text-soil-clay font-medium text-sm">
                    {(contact.displayName || contact.firstName || contact.email)[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-soil-dark">{contact.displayName || `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email}</p>
                    <p className="text-xs text-earth-gray">{contact.email}</p>
                    {contact.company && <p className="text-xs text-earth-gray">{contact.company}</p>}
                  </div>
                  {contact.isFavorite && <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/email/compose?to=${contact.email}`)} className="p-1.5 hover:bg-gray-100 rounded text-soil-clay">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(contact.id)} className="p-1.5 hover:bg-gray-100 rounded text-earth-gray hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-soil-dark">New Contact</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5 text-earth-gray" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-earth-gray mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-earth-gray mb-1">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
                </div>
                <div>
                  <label className="block text-sm text-earth-gray mb-1">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-earth-gray mb-1">Display Name</label>
                <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
              </div>
              <div>
                <label className="block text-sm text-earth-gray mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving || !form.email.trim()}>
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
