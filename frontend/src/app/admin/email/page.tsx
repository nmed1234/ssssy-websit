"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Mail, HardDrive, Users, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface EmailStats {
  totalAccounts: number;
  totalStorageUsedBytes: number;
  totalStorageQuotaBytes?: number;
  activeAccounts?: number;
  totalEmailsSent?: number;
  totalEmailsReceived?: number;
}

interface EmailAccount {
  id: string;
  email: string;
  displayName?: string;
  provider?: string;
  isActive: boolean;
  storageUsedBytes?: number;
  storageQuotaBytes?: number;
  emailsSent?: number;
  emailsReceived?: number;
  lastSyncAt?: string;
  createdAt?: string;
}

interface StorageReport {
  totalAccounts: number;
  totalStorageBytes: number;
  usedBytes: number;
  availableBytes: number;
  usagePercent: number;
  accounts: EmailAccount[];
}

export default function AdminEmailPage() {
  const { t } = useLanguage();
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["email-stats"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EmailStats>>("/admin/email/stats");
      return res.data.data;
    },
  });

  const { data: storageReport, isLoading: storageLoading, error: storageError } = useQuery({
    queryKey: ["email-storage-report"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<StorageReport>>("/admin/email/storage-report");
      return res.data.data;
    },
  });

  const { data: accounts, isLoading: accountsLoading, error: accountsError, refetch } = useQuery({
    queryKey: ["email-accounts"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EmailAccount[]>>("/admin/email/accounts");
      return res.data.data;
    },
  });

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const getUsagePercent = (used?: number, quota?: number) => {
    if (!quota || quota === 0) return 0;
    return Math.min(Math.round(((used || 0) / quota) * 100), 100);
  };

  const isLoading = statsLoading || storageLoading || accountsLoading;
  const hasError = statsError || storageError || accountsError;

  return (
    <div>
      <AdminPageHeader
        title={t("Email Administration", "إدارة البريد الإلكتروني")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Email" }]}
        actions={<Button variant="outline" onClick={() => refetch()} disabled={isLoading}>Refresh</Button>}
      />
      {hasError && (
        <Card className="border-red-200 bg-red-50/50 mb-6">
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">Failed to load some email data.</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalAccounts ?? storageReport?.totalAccounts ?? accounts?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.activeAccounts ?? "-"} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatBytes(stats?.totalStorageUsedBytes ?? storageReport?.usedBytes ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  of {formatBytes(stats?.totalStorageQuotaBytes ?? storageReport?.availableBytes ?? 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Emails</CardTitle>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.totalEmailsSent ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.totalEmailsReceived ?? 0} received
                </p>
              </CardContent>
            </Card>
          </div>

          {storageReport && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>Overall quota utilization across all email accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        {formatBytes(storageReport.usedBytes)} of {formatBytes(storageReport.availableBytes)}
                      </span>
                      <span className="font-medium">{storageReport.usagePercent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${storageReport.usagePercent > 80 ? "bg-red-500" : storageReport.usagePercent > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                        style={{ width: `${storageReport.usagePercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Accounts: </span>
                      <span className="font-medium">{storageReport.totalAccounts}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Capacity: </span>
                      <span className="font-medium">{formatBytes(storageReport.totalStorageBytes)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Email Accounts ({accounts?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Display Name</th>
                        <th className="pb-3 font-medium">Provider</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Storage</th>
                        <th className="pb-3 font-medium">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts?.map((account: EmailAccount) => {
                        const usagePct = getUsagePercent(account.storageUsedBytes, account.storageQuotaBytes);
                        return (
                          <tr key={account.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{account.email}</span>
                              </div>
                            </td>
                            <td className="py-3 text-muted-foreground">{account.displayName || "-"}</td>
                            <td className="py-3">
                              <span className="bg-muted px-2 py-0.5 rounded text-xs">{account.provider || "SMTP"}</span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${account.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {account.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${usagePct > 80 ? "bg-red-500" : usagePct > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                    style={{ width: `${usagePct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{formatBytes(account.storageUsedBytes ?? 0)}</span>
                              </div>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {account.lastSyncAt ? new Date(account.lastSyncAt).toLocaleString() : "Never"}
                            </td>
                          </tr>
                        );
                      })}
                      {(!accounts || accounts.length === 0) && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground">No email accounts found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
