"use client";

import { useEffect, useState } from "react";
import {
  getContactGroups, createContactGroup, deleteContactGroup,
  getAllContacts, addContactToGroup, removeContactFromGroup
} from "@/lib/email";
import type { ContactGroup, EmailContact } from "@/types/email";
import { Users, Plus, Trash2, Loader2, X, ChevronDown, ChevronUp, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactGroupsPage() {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6D4C41" });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [pickContact, setPickContact] = useState("");

  useEffect(() => {
    Promise.all([
      getContactGroups().then((r) => r.data.success ? r.data.data : []),
      getAllContacts().then((r) => r.data.success ? r.data.data : []),
    ])
      .then(([g, c]) => { setGroups(g); setContacts(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await createContactGroup(form);
      if (res.data.success) {
        setGroups((prev) => [...prev, res.data.data]);
        setShowModal(false);
        setForm({ name: "", description: "", color: "#6D4C41" });
      }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteContactGroup(id).catch(() => {});
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const handleAddMember = async (groupId: string, contactId: string) => {
    if (!contactId) return;
    await addContactToGroup(groupId, contactId).catch(() => {});
    // update local member list optimistically
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, groupIds: [...(c.groupIds || []), groupId] }
          : c
      )
    );
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, memberCount: (g.memberCount ?? 0) + 1 }
          : g
      )
    );
    setAddingTo(null);
    setPickContact("");
  };

  const handleRemoveMember = async (groupId: string, contactId: string) => {
    await removeContactFromGroup(groupId, contactId).catch(() => {});
    setContacts((prev) =>
      prev.map((c) =>
        c.id === contactId
          ? { ...c, groupIds: (c.groupIds || []).filter((id) => id !== groupId) }
          : c
      )
    );
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, memberCount: Math.max(0, (g.memberCount ?? 1) - 1) }
          : g
      )
    );
  };

  const getMembersOf = (groupId: string) =>
    contacts.filter((c) => c.groupIds?.includes(groupId));

  const getNonMembersOf = (groupId: string) =>
    contacts.filter((c) => !c.groupIds?.includes(groupId));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <h1 className="text-lg font-medium text-soil-dark flex items-center gap-2">
          <Users className="h-5 w-5 text-soil-clay" /> Contact Groups
        </h1>
        <Button size="sm" className="bg-soil-clay hover:bg-soil-dark text-white text-xs" onClick={() => setShowModal(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Group
        </Button>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-soil-clay" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-earth-gray">
            <Users className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-base font-medium text-soil-dark">No contact groups</p>
            <Button size="sm" className="mt-4 bg-soil-clay hover:bg-soil-dark text-white text-xs" onClick={() => setShowModal(true)}>
              Create first group
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {groups.map((group) => {
              const members = getMembersOf(group.id);
              const nonMembers = getNonMembersOf(group.id);
              const isExpanded = expanded === group.id;

              return (
                <div key={group.id}>
                  {/* Group row */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: group.color || "#6D4C41" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-soil-dark truncate">{group.name}</p>
                      <p className="text-xs text-earth-gray">
                        {group.memberCount ?? members.length} member{(group.memberCount ?? members.length) !== 1 ? "s" : ""}
                        {group.description ? ` — ${group.description}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : group.id)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-earth-gray"
                        title={isExpanded ? "Collapse" : "Manage members"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-earth-gray hover:text-red-500 transition-colors"
                        title="Delete group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Members panel */}
                  {isExpanded && (
                    <div className="bg-muted/20 border-t border-border px-5 py-3 space-y-2">
                      {/* Existing members */}
                      {members.length === 0 ? (
                        <p className="text-xs text-earth-gray italic">No members yet</p>
                      ) : (
                        members.map((c) => (
                          <div key={c.id} className="flex items-center gap-2 py-1">
                            <div className="w-6 h-6 rounded-full bg-soil-clay/15 flex items-center justify-center text-xs text-soil-clay font-semibold flex-shrink-0">
                              {(c.displayName || c.email)[0].toUpperCase()}
                            </div>
                            <span className="flex-1 text-sm text-soil-dark truncate">
                              {c.displayName || c.email}
                            </span>
                            <span className="text-xs text-earth-gray truncate">{c.email}</span>
                            <button
                              onClick={() => handleRemoveMember(group.id, c.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-earth-gray hover:text-red-500 transition-colors flex-shrink-0"
                              title="Remove from group"
                            >
                              <UserMinus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))
                      )}

                      {/* Add member */}
                      {addingTo === group.id ? (
                        <div className="flex items-center gap-2 pt-1">
                          <select
                            value={pickContact}
                            onChange={(e) => setPickContact(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-soil-clay bg-background"
                          >
                            <option value="">Select a contact…</option>
                            {nonMembers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.displayName || c.email}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => handleAddMember(group.id, pickContact)}
                            disabled={!pickContact}
                            className="text-xs"
                          >
                            Add
                          </Button>
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => { setAddingTo(null); setPickContact(""); }}
                            className="text-xs text-earth-gray"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        nonMembers.length > 0 && (
                          <button
                            onClick={() => setAddingTo(group.id)}
                            className="flex items-center gap-1 text-xs text-soil-clay hover:underline mt-1"
                          >
                            <Plus className="h-3 w-3" /> Add member
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-medium text-soil-dark">New Contact Group</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-4 w-4 text-earth-gray" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Name *</label>
                <Input
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Research Committee"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Description</label>
                <Input
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-xs text-earth-gray mb-1 font-medium">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color" value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-10 h-8 rounded border border-border cursor-pointer"
                  />
                  <span className="text-xs text-earth-gray">{form.color}</span>
                </div>
              </div>
              <Button
                className="w-full bg-soil-clay hover:bg-soil-dark text-white mt-2"
                onClick={handleCreate}
                disabled={!form.name.trim() || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
