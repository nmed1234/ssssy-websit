"use client";

/**
 * TestimonialsSection — carousel of member quote cards (3-up on desktop, 1-up on mobile).
 *
 * Data keys: items[].name / nameEn / nameAr, items[].role / roleEn / roleAr,
 *            items[].quote / quoteEn / quoteAr, items[].avatar
 * Config keys: title / titleEn / titleAr
 *
 * When data.items is empty the section falls back to real board_member data
 * passed via the `boardMembers` prop (fetched from /api/public/board-members).
 *
 * Returns null only when both sources are empty.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { almarai } from "@/lib/fonts";
import { StyleCard, StyleCardContent } from "@/components/ui/style-card";
import { TextReveal } from "@/components/ui/text-reveal";
import { useLanguage } from "@/lib/language-context";
import type { BoardMember } from "@/types";

interface TestimonialsSectionProps {
  data?: Record<string, unknown>;
  config?: Record<string, unknown>;
  /** Real board members from the API — used when data.items is absent. */
  boardMembers?: BoardMember[];
}

const CARDS_PER_PAGE = 3;

export function TestimonialsSection({ data = {}, config = {}, boardMembers }: TestimonialsSectionProps) {
  const { language } = useLanguage();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const rawItems = data.items as
    | {
        name?: string;
        nameEn?: string;
        nameAr?: string;
        role?: string;
        roleEn?: string;
        roleAr?: string;
        quote?: string;
        quoteEn?: string;
        quoteAr?: string;
        avatar?: string;
      }[]
    | undefined;

  // Build the full display list — all items, no slice.
  let allItems: { name: string; role: string; quote: string; avatar?: string }[];

  if (rawItems && rawItems.length > 0) {
    allItems = rawItems.map((item) => ({
      name:
        language === "ar"
          ? item.nameAr || item.name || ""
          : item.nameEn || item.name || "",
      role:
        language === "ar"
          ? item.roleAr || item.role || ""
          : item.roleEn || item.role || "",
      quote:
        language === "ar"
          ? item.quoteAr || item.quote || ""
          : item.quoteEn || item.quote || "",
      avatar: item.avatar,
    }));
  } else if (boardMembers && boardMembers.length > 0) {
    allItems = boardMembers.map((bm) => ({
      name: language === "ar" ? (bm.memberNameAr || bm.memberName || "") : (bm.memberName || ""),
      role: language === "ar" ? (bm.positionAr || bm.positionEn || "") : (bm.positionEn || bm.positionAr || ""),
      quote: bm.bio || "",
      avatar: bm.photoUrl || bm.memberPhoto,
    }));
  } else {
    return null;
  }

  const totalPages = Math.ceil(allItems.length / CARDS_PER_PAGE);
  const visibleItems = allItems.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const go = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setPage((p) => (p + delta + totalPages) % totalPages);
    },
    [totalPages]
  );

  const heading =
    language === "ar"
      ? (config.titleAr as string) || (config.title as string) || "ماذا يقول أعضاؤنا"
      : (config.titleEn as string) || (config.title as string) || "What Our Members Say";

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section className="py-16 md:py-20 bg-soil-cream/30">
      <div className="container mx-auto px-4">
        <TextReveal
          as="h2"
          className={`${almarai.className} fluid-3xl md:fluid-4xl font-bold text-soil-dark text-center mb-12`}
        >
          {heading}
        </TextReveal>

        {/* Carousel */}
        <div className="relative">
          {/* Cards */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {visibleItems.map((item, i) => (
                <StyleCard key={i} className="h-full">
                  <StyleCardContent>
                    {item.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover mb-4"
                      />
                    ) : (
                      /* Initials avatar */
                      <div className="w-12 h-12 rounded-full bg-soil-clay/20 flex items-center justify-center mb-4 flex-shrink-0">
                        <span className="text-soil-clay font-semibold text-base leading-none">
                          {item.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    {item.quote && (
                      <p className="text-earth-gray italic mb-6 line-clamp-4">&ldquo;{item.quote}&rdquo;</p>
                    )}
                    <div className="mt-auto">
                      <p className="font-semibold text-soil-dark">{item.name}</p>
                      <p className="text-sm text-soil-clay">{item.role}</p>
                    </div>
                  </StyleCardContent>
                </StyleCard>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — only shown when there is more than one page */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => go(-1)}
                aria-label={language === "ar" ? "السابق" : "Previous"}
                className="w-10 h-10 rounded-full border border-soil-clay/30 flex items-center justify-center text-soil-clay hover:bg-soil-clay hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > page ? 1 : -1); setPage(i); }}
                    aria-label={`${language === "ar" ? "صفحة" : "Page"} ${i + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === page ? "bg-soil-clay" : "bg-soil-clay/25 hover:bg-soil-clay/50"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => go(1)}
                aria-label={language === "ar" ? "التالي" : "Next"}
                className="w-10 h-10 rounded-full border border-soil-clay/30 flex items-center justify-center text-soil-clay hover:bg-soil-clay hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
