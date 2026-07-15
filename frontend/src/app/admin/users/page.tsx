"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User, Role, PaginatedResponse, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [assignRoleUser, setAssignRoleUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<User>>>("/users");
      return res.data.data;
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Role[]>>("/roles");
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (form: Record<string, string>) => {
      await api.post("/users", form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      await api.put(`/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async ({ id, roleId }: { id: string; roleId: string }) => {
      await api.put(`/users/${id}/role`, { roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAssignRoleUser(null);
      setSelectedRole("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const filtered = data?.content?.filter((u) =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminPageHeader
        title={t("Users", "المستخدمون")}
        description={t("Manage user accounts and permissions", "إدارة حسابات المستخدمين والصلاحيات")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Users", "المستخدمون") },
        ]}
        actions={<Button onClick={() => setShowCreateForm(true)}>{t("Create User", "إنشاء مستخدم")}</Button>}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("All Users", "جميع المستخدمين")}</CardTitle>
            <Input
              placeholder={t("Search users...", "بحث عن مستخدمين...")}
              className="max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">{t("Username", "اسم المستخدم")}</th>
                    <th className="pb-3 font-medium">{t("Email", "البريد الإلكتروني")}</th>
                    <th className="pb-3 font-medium">{t("Role", "الدور")}</th>
                    <th className="pb-3 font-medium">{t("Status", "الحالة")}</th>
                    <th className="pb-3 font-medium">{t("Joined", "تاريخ الانضمام")}</th>
                    <th className="pb-3 font-medium">{t("Actions", "الإجراءات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.map((user: User) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3">{user.username}</td>
                      <td className="py-3 text-muted-foreground">{user.email}</td>
                      <td className="py-3">
                        {assignRoleUser === user.id ? (
                          <div className="flex gap-2 items-center">
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                            >
                              <option value="">{t("Select role", "اختيار دور")}</option>
                              {roles?.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.displayNameEn || r.name}
                                </option>
                              ))}
                            </select>
                            <Button size="sm" onClick={() => assignRoleMutation.mutate({ id: user.id, roleId: selectedRole })} disabled={!selectedRole}>{t("Save", "حفظ")}</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setAssignRoleUser(null); setSelectedRole(""); }}>{t("Cancel", "إلغاء")}</Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => setAssignRoleUser(user.id)}
                          >
                            {user.roleDisplayNameEn || user.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingUser(user.id)}>{t("Edit", "تعديل")}</Button>
                          <Button size="sm" variant="destructive" onClick={() => { if (confirm(t("Delete user?", "حذف المستخدم؟"))) deleteMutation.mutate(user.id); }}>{t("Delete", "حذف")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!filtered || filtered.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        {t("No users found", "لا يوجد مستخدمون")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateForm && (
        <UserFormModal
          roles={roles || []}
          onSave={(form) => createMutation.mutate(form)}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={data?.content?.find((u) => u.id === editingUser)!}
          roles={roles || []}
          onSave={(form) => updateMutation.mutate({ id: editingUser, data: form })}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

function UserFormModal({ roles, onSave, onClose }: { roles: Role[]; onSave: (form: Record<string, string>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    firstNameAr: "", lastNameAr: "", firstNameEn: "", lastNameEn: "",
    phone: "", roleId: "",
    institution: "", department: "", position: "", specialization: "",
    biography: "", address: "", city: "", country: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Create User", "إنشاء مستخدم")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("Username *", "اسم المستخدم *")}</label>
            <Input value={form.username} onChange={set("username")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Email *", "البريد الإلكتروني *")}</label>
            <Input type="email" value={form.email} onChange={set("email")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Password *", "كلمة المرور *")}</label>
            <Input type="password" value={form.password} onChange={set("password")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Role *", "الدور *")}</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.roleId} onChange={set("roleId")}>
              <option value="">{t("Select role", "اختيار دور")}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.displayNameEn || r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("First Name (Ar)", "الاسم الأول (عربي)")}</label>
            <Input value={form.firstNameAr} onChange={set("firstNameAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Last Name (Ar)", "اسم العائلة (عربي)")}</label>
            <Input value={form.lastNameAr} onChange={set("lastNameAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("First Name (En)", "الاسم الأول (إنجليزي)")}</label>
            <Input value={form.firstNameEn} onChange={set("firstNameEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Last Name (En)", "اسم العائلة (إنجليزي)")}</label>
            <Input value={form.lastNameEn} onChange={set("lastNameEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Phone", "الهاتف")}</label>
            <Input value={form.phone} onChange={set("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Institution", "المؤسسة")}</label>
            <Input value={form.institution} onChange={set("institution")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Department", "القسم")}</label>
            <Input value={form.department} onChange={set("department")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Position", "المنصب")}</label>
            <Input value={form.position} onChange={set("position")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Specialization", "التخصص")}</label>
            <Input value={form.specialization} onChange={set("specialization")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("City", "المدينة")}</label>
            <Input value={form.city} onChange={set("city")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Country", "البلد")}</label>
            <Input value={form.country} onChange={set("country")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Address", "العنوان")}</label>
            <Input value={form.address} onChange={set("address")} />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">{t("Biography", "السيرة الذاتية")}</label>
            <textarea
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
              value={form.biography}
              onChange={set("biography")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)} disabled={!form.username || !form.email || !form.password || !form.roleId}>{t("Create", "إنشاء")}</Button>
        </div>
      </div>
    </div>
  );
}

function EditUserModal({ user, roles, onSave, onClose }: { user: User; roles: Role[]; onSave: (form: Record<string, unknown>) => void; onClose: () => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    firstNameAr: user.firstNameAr || "",
    lastNameAr: user.lastNameAr || "",
    firstNameEn: user.firstNameEn || "",
    lastNameEn: user.lastNameEn || "",
    phone: user.phone || "",
    isActive: user.isActive,
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">{t("Edit User", "تعديل المستخدم")} - {user.username}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("First Name (Ar)", "الاسم الأول (عربي)")}</label>
            <Input value={form.firstNameAr} onChange={set("firstNameAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Last Name (Ar)", "اسم العائلة (عربي)")}</label>
            <Input value={form.lastNameAr} onChange={set("lastNameAr")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("First Name (En)", "الاسم الأول (إنجليزي)")}</label>
            <Input value={form.firstNameEn} onChange={set("firstNameEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Last Name (En)", "اسم العائلة (إنجليزي)")}</label>
            <Input value={form.lastNameEn} onChange={set("lastNameEn")} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("Phone", "الهاتف")}</label>
            <Input value={form.phone} onChange={set("phone")} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
            <label htmlFor="isActive" className="text-sm font-medium">{t("Active", "نشط")}</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>{t("Cancel", "إلغاء")}</Button>
          <Button onClick={() => onSave(form)}>{t("Save", "حفظ")}</Button>
        </div>
      </div>
    </div>
  );
}
