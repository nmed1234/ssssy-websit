"use client";

/**
 * CustomSection.tsx
 * Public-facing renderer for "custom" type site sections.
 * Renders an array of Block items with their full props.
 * Bilingual-aware — uses language context to pick EN vs AR content.
 */

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import type { Block } from "@/types";

interface Props {
  blocks: Block[];
  className?: string;
}

export default function CustomSection({ blocks, className = "" }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <section className={`py-12 ${className}`} style={{ background: "var(--style-color-bg)" }}>
      <div className="container mx-auto px-4">
        <div className="space-y-6">
          {blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const p = block.props;

  function t(en: unknown, ar: unknown): string {
    return ((isAr ? ar : en) ?? en ?? "") as string;
  }

  switch (block.type) {
    case "heading": {
      const level = (p.level as string) || "h2";
      const sizeMap: Record<string, string> = {
        h1: "text-4xl font-bold",
        h2: "text-3xl font-bold",
        h3: "text-2xl font-semibold",
        h4: "text-xl font-semibold",
      };
      const cls = `${sizeMap[level] ?? "text-3xl font-bold"} text-soil-dark`;
      const style: React.CSSProperties = { textAlign: (p.align as "left" | "center" | "right") || "left" };
      const text = t(p.textEn, p.textAr) || "Heading";
      if (level === "h1") return <h1 className={cls} style={style} dir={isAr ? "rtl" : "ltr"}>{text}</h1>;
      if (level === "h3") return <h3 className={cls} style={style} dir={isAr ? "rtl" : "ltr"}>{text}</h3>;
      if (level === "h4") return <h4 className={cls} style={style} dir={isAr ? "rtl" : "ltr"}>{text}</h4>;
      return (
        <h2
          className={cls}
          style={style}
          dir={isAr ? "rtl" : "ltr"}
        >
          {text}
        </h2>
      );
    }

    case "paragraph":
      return (
        <p
          className="text-gray-600 leading-relaxed"
          style={{ textAlign: (p.align as "left" | "center" | "right") || "left" }}
          dir={isAr ? "rtl" : "ltr"}
        >
          {t(p.textEn, p.textAr)}
        </p>
      );

    case "image":
      return (
        <figure dir={isAr ? "rtl" : "ltr"}>
          {(p.src as string) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.src as string}
              alt={t(p.altEn, p.altAr) || ""}
              className={`w-full object-cover ${(p.rounded as boolean) ? "rounded-xl" : ""}`}
              loading="lazy"
            />
          ) : null}
          {t(p.captionEn, p.captionAr) && (
            <figcaption className="text-xs text-gray-400 text-center mt-2">{t(p.captionEn, p.captionAr)}</figcaption>
          )}
        </figure>
      );

    case "button": {
      const variants: Record<string, string> = {
        primary: "bg-soil-clay text-white hover:bg-soil-dark",
        secondary: "bg-gray-800 text-white hover:bg-gray-900",
        outline: "border-2 border-soil-clay text-soil-clay hover:bg-soil-clay/10",
      };
      const align = (p.align as string) || "left";
      return (
        <div style={{ textAlign: align as "left" | "center" | "right" }} dir={isAr ? "rtl" : "ltr"}>
          <Link
            href={(p.url as string) || "#"}
            className={`inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${variants[(p.variant as string)] ?? variants.primary}`}
          >
            {t(p.labelEn, p.labelAr) || "Button"}
          </Link>
        </div>
      );
    }

    case "divider":
      return (
        <hr
          className={`border-t ${p.thickness ? "" : "border"} ${(p.color as string) || "border-gray-200"} ${(p.margin as string) || "my-8"}`}
          style={(p.style as string) === "dashed" ? { borderStyle: "dashed" } : (p.style as string) === "dotted" ? { borderStyle: "dotted" } : {}}
        />
      );

    case "spacer":
      return <div className={(p.height as string) || "h-8"} />;

    case "columns": {
      const count = (p.columnCount as number) || 2;
      const gapMap: Record<string, string> = { sm: "gap-3", md: "gap-6", lg: "gap-10" };
      const gap = gapMap[(p.gap as string)] || "gap-6";
      return (
        <div className={`grid grid-cols-1 md:grid-cols-${count} ${gap}`}>
          {[...Array(count)].map((_, i) => (
            <div key={i} className="space-y-4">
              {(block.columns?.[i] ?? []).map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    case "video": {
      const src = (p.src as string) || "";
      const isYoutube = src.includes("youtube.com") || src.includes("youtu.be");
      const embedUrl = isYoutube
        ? src.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
        : src;
      return (
        <figure dir={isAr ? "rtl" : "ltr"}>
          {embedUrl ? (
            isYoutube ? (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <iframe src={embedUrl} className="absolute inset-0 w-full h-full" allowFullScreen title="video" />
              </div>
            ) : (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={embedUrl}
                controls={p.controls !== false}
                autoPlay={p.autoplay as boolean}
                className="w-full rounded-xl"
              />
            )
          ) : (
            <div className="bg-gray-900 rounded-xl h-48 flex items-center justify-center text-gray-400">
              Video placeholder
            </div>
          )}
          {t(p.captionEn, p.captionAr) && (
            <figcaption className="text-xs text-gray-400 text-center mt-2">{t(p.captionEn, p.captionAr)}</figcaption>
          )}
        </figure>
      );
    }

    case "icon":
      return (
        <div className="flex flex-col items-center gap-2" style={{ textAlign: "center" }} dir={isAr ? "rtl" : "ltr"}>
          <div className={`text-5xl ${(p.color as string) || "text-soil-clay"}`} style={{ fontSize: (p.size as string) || "48px" }}>
            ★
          </div>
          {t(p.labelEn, p.labelAr) && (
            <p className="text-sm text-gray-600 font-medium">{t(p.labelEn, p.labelAr)}</p>
          )}
        </div>
      );

    case "card":
      return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white" dir={isAr ? "rtl" : "ltr"}>
          {(p.image as string) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image as string} alt={t(p.titleEn, p.titleAr) || ""} className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <h3 className="font-semibold text-soil-dark text-base mb-2">{t(p.titleEn, p.titleAr)}</h3>
            {t(p.descriptionEn, p.descriptionAr) && (
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{t(p.descriptionEn, p.descriptionAr)}</p>
            )}
            {(p.linkUrl as string) && t(p.linkLabelEn, p.linkLabelAr) && (
              <Link href={p.linkUrl as string} className="text-sm font-medium text-soil-clay hover:text-soil-dark transition-colors">
                {t(p.linkLabelEn, p.linkLabelAr)} →
              </Link>
            )}
          </div>
        </div>
      );

    case "accordion":
      return <AccordionBlock block={block} isAr={isAr} />;

    case "timeline":
      return (
        <div className="relative" dir={isAr ? "rtl" : "ltr"}>
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-soil-sand" />
          <div className="space-y-6">
            {((p.items as Array<Record<string, string>>) || []).map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-soil-clay flex items-center justify-center z-10 text-white text-xs font-bold shadow-sm">
                  {item.year}
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mt-0.5">
                  <h4 className="font-semibold text-soil-dark text-sm mb-1">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>
                  {(isAr ? item.descriptionAr : item.descriptionEn) && (
                    <p className="text-xs text-gray-500">{isAr ? item.descriptionAr : item.descriptionEn}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "team-grid":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" dir={isAr ? "rtl" : "ltr"}>
          {((p.members as Array<Record<string, string>>) || []).map((member, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center">
              {member.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo} alt={isAr ? member.nameAr : member.nameEn} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-gray-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-soil-sand/40 flex items-center justify-center mb-3 text-xl font-bold text-soil-clay">
                  {(isAr ? member.nameAr : member.nameEn)?.charAt(0)}
                </div>
              )}
              <p className="font-semibold text-soil-dark text-sm">{isAr ? member.nameAr : member.nameEn}</p>
              <p className="text-xs text-soil-clay font-medium mt-0.5">{isAr ? member.roleAr : member.roleEn}</p>
              {(isAr ? member.bioAr : member.bioEn) && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-3">{isAr ? member.bioAr : member.bioEn}</p>
              )}
            </div>
          ))}
        </div>
      );

    case "map":
      return (
        <figure dir={isAr ? "rtl" : "ltr"}>
          {(p.embedUrl as string) ? (
            <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: (p.height as string) || "400px" }}>
              <iframe src={p.embedUrl as string} className="w-full h-full" title="map" />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400">Map placeholder</div>
          )}
          {t(p.captionEn, p.captionAr) && (
            <figcaption className="text-xs text-gray-400 text-center mt-2">{t(p.captionEn, p.captionAr)}</figcaption>
          )}
        </figure>
      );

    case "form-embed":
      return (
        <div style={{ height: (p.height as string) || "500px" }} className="rounded-xl overflow-hidden border border-gray-200">
          {(p.embedHtml as string) ? (
            <div dangerouslySetInnerHTML={{ __html: p.embedHtml as string }} className="w-full h-full" />
          ) : (
            <div className="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">Form embed placeholder</div>
          )}
        </div>
      );

    case "alert": {
      const styles: Record<string, string> = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
      };
      const icons: Record<string, string> = { info: "ℹ️", warning: "⚠️", success: "✅", error: "❌" };
      const v = (p.variant as string) || "info";
      return (
        <div className={`border rounded-xl p-4 flex gap-3 text-sm ${styles[v] ?? styles.info}`} dir={isAr ? "rtl" : "ltr"}>
          <span className="flex-shrink-0">{icons[v]}</span>
          <p>{t(p.messageEn, p.messageAr)}</p>
        </div>
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-4 border-soil-clay pl-6 py-2" dir={isAr ? "rtl" : "ltr"}>
          <p className="text-lg italic text-gray-700 mb-3">&ldquo;{t(p.textEn, p.textAr)}&rdquo;</p>
          {t(p.authorEn, p.authorAr) && (
            <footer className="text-sm font-semibold text-soil-dark">
              — {t(p.authorEn, p.authorAr)}
              {t(p.authorRoleEn, p.authorRoleAr) && (
                <span className="text-gray-400 font-normal ml-1">· {t(p.authorRoleEn, p.authorRoleAr)}</span>
              )}
            </footer>
          )}
        </blockquote>
      );

    case "code":
      return (
        <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-sm overflow-x-auto">
          <code>{(p.code as string) || ""}</code>
        </pre>
      );

    case "html":
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: (p.rawHtml as string) || "" }}
          dir={isAr ? "rtl" : "ltr"}
        />
      );

    // Dynamic blocks — skeletons in preview, real content placeholders here
    case "latest-news":
    case "upcoming-events":
    case "publications-carousel":
    case "board-members":
    case "statistics-counter":
      return (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-400 text-sm">
          <p className="font-medium mb-1">Dynamic Block: {block.type}</p>
          <p className="text-xs">Live content is rendered by the dedicated section renderer.</p>
        </div>
      );

    default:
      return null;
  }
}

// ── Accordion helper component ───────────────────────────────────────────────

function AccordionBlock({ block, isAr }: { block: Block; isAr: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = (block.props.items as Array<Record<string, string>>) || [];

  return (
    <div className="space-y-2" dir={isAr ? "rtl" : "ltr"}>
      {items.map((item, i) => {
        const question = isAr ? item.questionAr : item.questionEn;
        const answer = isAr ? item.answerAr : item.answerEn;
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-soil-dark hover:bg-gray-50 transition-colors"
            >
              <span>{question}</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-soil-clay flex-shrink-0 ml-3" />
              ) : (
                <ChevronDown className="h-4 w-4 text-soil-clay flex-shrink-0 ml-3" />
              )}
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
