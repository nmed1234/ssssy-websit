import { serverGetContentBySlug, serverGetContentByType } from "@/lib/server-api";
import type { ContentItem } from "@/types";
import NewsDetailClient from "./NewsDetailClient";

export const revalidate = 300;

export async function generateStaticParams() {
  const result = await serverGetContentByType<ContentItem>("NEWS", 0, 20, 3600);
  if (!result?.content) return [];
  return result.content.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await serverGetContentBySlug<ContentItem>(params.slug, 300);
  if (!article) return { title: "Article | SSSS" };
  return {
    title: `${article.titleEn || article.titleAr} | SSSS`,
    description: article.excerpt || "Read this article on the Soil Science Society of Syria website.",
    openGraph: {
      title: article.titleEn || article.titleAr || "",
      description: article.excerpt || "",
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await serverGetContentBySlug<ContentItem>(params.slug, 300);

  // Fetch related articles from same category (or general NEWS, fallback)
  let related: ContentItem[] = [];
  if (article) {
    const pool = await serverGetContentByType<ContentItem>("NEWS", 0, 10, 300);
    related = (pool?.content ?? [])
      .filter((item) => item.slug !== params.slug)
      .slice(0, 3);
  }

  return <NewsDetailClient initialArticle={article} relatedArticles={related} />;
}
