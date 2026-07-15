"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MediaFile, PaginatedResponse, ApiResponse } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLanguage } from "@/lib/language-context";

export default function MediaPage() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["media"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<MediaFile>>>("/media/files", { params: { size: 50 } });
      return res.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      await api.post("/media/files/upload-multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      setUploading(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });

  const handleUpload = () => {
    const files = fileInputRef.current?.files;
    if (files && files.length > 0) {
      setUploading(true);
      uploadMutation.mutate(files);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={t("Media Library", "مكتبة الوسائط")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Media Library", "مكتبة الوسائط") },
        ]}
        actions={
          <div className="flex gap-3 items-center">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              className="hidden"
              onChange={handleUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? t("Uploading...", "جارٍ الرفع...") : t("Upload Files", "رفع ملفات")}
            </Button>
          </div>
        }
      />
      <Card>
        <CardHeader><CardTitle>{t("All Files", "جميع الملفات")}</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground">{t("Loading...", "جارٍ التحميل...")}</p> : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data?.content?.map((file) => (
                <div key={file.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group">
                  <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs p-2 break-all">
                    {file.mimeType?.startsWith("image/") ? (
                      <img src={file.url} alt={file.originalFilename} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-center">{file.originalFilename}</span>
                    )}
                  </div>
                  <div className="p-2 text-xs truncate">{file.originalFilename}</div>
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    onClick={() => { if (confirm(t("Delete file?", "حذف الملف؟"))) deleteMutation.mutate(file.id); }}
                  >&times;</button>
                </div>
              ))}
              {(!data?.content || data.content.length === 0) && (
                <div className="col-span-full text-center py-12 text-muted-foreground">{t("No files uploaded", "لا توجد ملفات مرفوعة")}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
