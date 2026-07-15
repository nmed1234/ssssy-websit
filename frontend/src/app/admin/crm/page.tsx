"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchContacts, deleteContact } from "@/lib/crm";
import type { CrmContact } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Mail, Phone, Building2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function AdminCrmPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["crm-contacts", searchQuery],
    queryFn: async () => {
      const res = await searchContacts(searchQuery || undefined);
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["crm-contacts"] }),
  });

  return (
    <div>
      <AdminPageHeader
        title={t("CRM", "إدارة علاقات العملاء")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: t("CRM", "إدارة علاقات العملاء") }]}
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-light"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contacts ({data?.totalElements ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Organization</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content?.map((contact: CrmContact) => (
                    <tr key={contact.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{contact.firstName} {contact.lastName}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail size={14} />
                          <span>{contact.email}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone size={14} />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        {contact.organization && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Building2 size={14} />
                            <span>{contact.organization}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          {contact.contactType || "GENERAL"}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => {
                            if (confirm("Delete this contact?")) {
                              deleteMutation.mutate(contact.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!data?.content || data.content.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No contacts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
