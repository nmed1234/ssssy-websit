"use client";

/**
 * PageHero — DB-driven hero banner for list pages (/news, /events, /jobs, /members, /search).
 *
 * Fetches the page config from /public/pages/{slug} and uses its titleEn / metaDescription.
 * Falls back to the provided `defaultTitle` / `defaultSubtitle` props when the API call fails
 * or the page record doesn't exist — so the page always renders something meaningful.
 */

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface HeroData {
  titleEn?: string;
  titleAr?: string;
  metaDescription?: string;
}

interface PageHeroProps {
  /** The DB page slug to fetch hero text from (e.g. "news", "events") */
  slug: string;
  /** Hard-coded fallback English title shown when DB has no record */
  defaultTitle: string;
  /** Optional hard-coded fallback Arabic subtitle */
  defaultSubtitleAr?: string;
  /** Optional hard-coded fallback description */
  defaultDescription?: string;
  /** Extra content rendered inside the hero (e.g. particle field, SVG) */
  children?: React.ReactNode;
  className?: string;
}

export function PageHero({
  slug,
  defaultTitle,
  defaultSubtitleAr,
  defaultDescription,
  children,
  className = "",
}: PageHeroProps) {
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: HeroData }>(`/public/pages/${slug}`)
      .then((res) => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {
        // Silently keep defaults — the hero is not critical
      });
  }, [slug]);

  const title = data?.titleEn || defaultTitle;
  const subtitleAr = data?.titleAr || defaultSubtitleAr;
  const description = data?.metaDescription || defaultDescription;

  return (
    <section
      className={`relative bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white overflow-hidden ${className}`}
    >
      {children}
      <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
        {subtitleAr && (
          <p className="text-soil-sand fluid-lg font-medium mb-2">{subtitleAr}</p>
        )}
        <h1 className="font-heading fluid-4xl md:fluid-5xl font-bold">{title}</h1>
        {description && (
          <p className="text-white/70 mt-3 max-w-xl fluid-lg">{description}</p>
        )}
      </div>
    </section>
  );
}
