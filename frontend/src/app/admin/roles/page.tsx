"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Role, ApiResponse } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Pencil, X, Shield, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/lib/language-context";

const allPermissions = [
  "content:create", "content:read", "content:update", "content:delete", "content:publish",
  "user:create", "user:read", "user:update", "user:delete",
  "role:create", "role:read", "role:update", "role:delete",
  "media:upload", "media:delete",
  "page:create", "page:read", "page:update", "page:delete",
  "comment:moderate", "comment:delete",
  "settings:read", "settings:update",
  "crm:read", "crm:write",
  "email:send", "email:admin",
  "newsletter:send",
  "workflow:approve",
];

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Role[]>>("/roles");
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Role> }) => {
      await api.put(`/roles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setEditingId(null);
    },
  });

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setEditPermissions(role.permissions || []);
    setEditName(role.name);
    setEditDescription(role.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPermissions([]);
    setEditName("");
    setEditDescription("");
  };

  const togglePermission = (perm: string) => {
    setEditPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const saveEdit = (role: Role) => {
    updateMutation.mutate({
      id: role.id,
      data: { name: editName, description: editDescription, permissions: editPermissions },
    });
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Roles", "الأدوار")}
        description={t("Manage user roles and their permissions", "إدارة أدوار المستخدمين وصلاحياتهم")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Roles", "الأدوار") },
        ]}
      />

      <div className="grid gap-6">
        {isLoading ? (
          <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p>
        ) : (
          roles?.map((role: Role) => {
            const isEditing = editingId === role.id;
            const perms = isEditing ? editPermissions : (role.permissions || []);

            return (
              <Card key={role.id} className={isEditing ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-lg font-semibold bg-background border rounded px-2 py-1 w-full"
                          />
                          <input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="text-sm text-muted-foreground bg-background border rounded px-2 py-1 w-full"
                            placeholder={t("Description", "الوصف")}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <CardTitle>{role.displayNameEn || role.name}</CardTitle>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center gap-1">
                              <Shield className="h-3 w-3" /> {t("Level", "المستوى")} {role.hierarchyLevel}
                            </span>
                          </div>
                          {role.description && (
                            <CardDescription>{role.description}</CardDescription>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {perms.length} {t("permission", "صلاحية")}{perms.length !== 1 ? t("s", "") : ""}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0 ml-4">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={() => saveEdit(role)} disabled={updateMutation.isPending}>
                            <Save className="h-4 w-4 mr-1" /> {t("Save", "حفظ")}
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEdit(role)}>
                          <Pencil className="h-4 w-4 mr-1" /> {t("Edit", "تعديل")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
                    {allPermissions.map((perm) => {
                      const has = perms.includes(perm);
                      return (
                        <button
                          key={perm}
                          type="button"
                          onClick={() => isEditing && togglePermission(perm)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors text-left ${
                            has
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted"
                          } ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                          title={perm}
                        >
                          {isEditing ? (
                            <Switch checked={has} onCheckedChange={() => togglePermission(perm)} className="scale-75" />
                          ) : has ? (
                            <Check className="h-3 w-3 shrink-0" />
                          ) : (
                            <span className="w-3 shrink-0" />
                          )}
                          <span className="truncate">{perm.split(":").join(": ")}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
