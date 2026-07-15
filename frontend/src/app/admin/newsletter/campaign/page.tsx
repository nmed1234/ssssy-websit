"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ApiResponse, NewsletterSubscriber } from "@/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Eye } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function NewsletterCampaignPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: subscribers } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ content: NewsletterSubscriber[] }>>("/newsletter/subscribers");
      return res.data.data.content || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const emails = subscribers?.map(s => s.email) || [];
      if (emails.length === 0) throw new Error("No subscribers");
      await api.post("/newsletter/send", {
        subject,
        bodyHtml: body,
        toAddresses: emails,
      });
    },
    onSuccess: () => {
      setSent(true);
      setTimeout(() => router.push("/admin/newsletter"), 2000);
    },
  });

  const activeCount = subscribers?.filter(s => s.isActive).length || 0;

  return (
    <div className="max-w-4xl">
      <AdminPageHeader
        title={t("New Campaign", "حملة جديدة")}
        breadcrumbs={[
          { label: t("Home", "الرئيسية"), href: "/" },
          { label: t("Admin", "الإدارة"), href: "/admin" },
          { label: t("Newsletter", "النشرة البريدية"), href: "/admin/newsletter" },
          { label: t("Campaign", "حملة") },
        ]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              <Eye className="h-4 w-4 mr-2" /> {preview ? t("Edit", "تعديل") : t("Preview", "معاينة")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/newsletter")}>
              {t("Cancel", "إلغاء")}
            </Button>
          </div>
        }
      />

      {sent ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Send className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t("Campaign Sent!", "تم إرسال الحملة!")}</h2>
            <p className="text-muted-foreground">
              {t("Your newsletter will be delivered to", "سيتم تسليم نشرتك البريدية إلى")} {activeCount} {t("subscribers.", "مشترك.")}
            </p>
          </CardContent>
        </Card>
      ) : preview ? (
        <Card>
          <CardContent className="py-8">
            <h2 className="text-lg font-semibold mb-4">{t("Preview:", "معاينة:")} {subject || t("(no subject)", "(بدون موضوع)")}</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: body }} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  {t("Sending to", "الإرسال إلى")} <strong>{activeCount}</strong> {t("active subscribers", "مشترك نشط")}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{t("Subject *", "الموضوع *")}</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t("Enter campaign subject", "أدخل موضوع الحملة")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t("Email Body", "نص البريد")}</label>
                  <RichTextEditor
                    value={body}
                    onChange={setBody}
                    placeholder={t("Write your newsletter content here...", "اكتب محتوى النشرة هنا...")}
                    minHeight="400px"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || !subject.trim() || !body.trim()}
            >
              {sendMutation.isPending ? t("Sending...", "جارٍ الإرسال...") : t("Send Campaign", "إرسال الحملة")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
