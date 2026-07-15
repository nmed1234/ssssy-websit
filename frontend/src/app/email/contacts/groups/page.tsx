"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getContactGroups, createContactGroup, deleteContactGroup } from "@/lib/email";
import type { ContactGroup } from "@/types/email";
import { Users, Plus, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#558B2F" });

  useEffect(() => {
    getContactGroups()
      .then((res) => { if (res.data.success) setGroups(res.data.data); })
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
        setForm({ name: "", description: "", color: "#558B2F" });
      }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteContactGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Contact Groups</h2>
        <Button size="sm" onClick={() => setShowModal(true)}><Plus className="h-4 w-4 mr-1" /> New Group</Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Users className="h-12 w-12 mb-2 opacity-20" />
          <p>No contact groups</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowModal(true)}>Create your first group</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => router.push(`/email/contacts?groupId=${group.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color || "#6D4C41" }} />
                  <div>
                    <p className="font-medium text-sm">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.memberCount ?? 0} members{group.description ? ` - ${group.description}` : ""}</p>
                  </div>
                </div>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive cursor-pointer" onClick={(e) => { e.stopPropagation(); handleDelete(group.id); }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-lg p-6 w-96 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">New Contact Group</h3>
              <X className="h-4 w-4 cursor-pointer" onClick={() => setShowModal(false)} />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Group name" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-full h-10 rounded border cursor-pointer" />
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={!form.name.trim() || saving}>{saving ? "Creating..." : "Create Group"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
