"use client";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { BreadcrumbItem } from "@/components/ui/breadcrumb";
import { useLanguage } from "@/lib/language-context";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const AUTO_TRANSLATE: Record<string, string> = {
  Home: "الرئيسية",
  Admin: "الإدارة",
  Email: "البريد",
  Inbox: "صندوق الوارد",
};

export function AdminPageHeader({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) {
  const { t } = useLanguage();

  const localizedCrumbs = breadcrumbs?.map((crumb) => ({
    ...crumb,
    label: AUTO_TRANSLATE[crumb.label] !== undefined
      ? t(crumb.label, AUTO_TRANSLATE[crumb.label])
      : crumb.label,
  }));

  return (
    <div className="mb-6">
      {localizedCrumbs && localizedCrumbs.length > 0 && (
        <Breadcrumb items={localizedCrumbs} separator="chevron" className="mb-2" />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
