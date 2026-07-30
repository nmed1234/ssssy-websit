import { serverGetContentByType } from "@/lib/server-api";
import type { ContentItem } from "@/types";
import NewsPageClient from "./NewsPageClient";

export const revalidate = 60;

export const metadata = {
  title: "News & Announcements | SSSS",
  description: "Latest news, announcements and articles from the Soil Science Society of Syria.",
};

export default async function NewsPage() {
  const initial = await serverGetContentByType<ContentItem>("NEWS", 0, 9, 60);
  return (
    <NewsPageClient
      initialItems={initial?.content ?? []}
      initialTotalPages={initial?.totalPages ?? 0}
    />
  );
}
