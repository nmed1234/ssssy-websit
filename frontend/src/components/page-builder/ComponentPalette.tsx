"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaletteItem {
  type: string;
  label: string;
  category: string;
  icon: string;
}

const COMPONENT_CATEGORIES: { name: string; label: string; items: PaletteItem[] }[] = [
  {
    name: "layout",
    label: "Layout",
    items: [
      { type: "container", label: "Container", category: "layout", icon: "⊞" },
      { type: "row",       label: "Row",       category: "layout", icon: "⇔" },
      { type: "column",    label: "Column",    category: "layout", icon: "▯" },
      { type: "grid",      label: "Grid",      category: "layout", icon: "⊟" },
      { type: "flexbox",   label: "Flexbox",   category: "layout", icon: "⤧" },
      { type: "divider",   label: "Divider",   category: "layout", icon: "—" },
      { type: "spacer",    label: "Spacer",    category: "layout", icon: "⤢" },
      { type: "section",   label: "Section",   category: "layout", icon: "⊡" },
      { type: "breadcrumb",label: "Breadcrumb",category: "layout", icon: "›" },
      { type: "navbar",    label: "Navbar",    category: "layout", icon: "☰" },
      { type: "footer",    label: "Footer",    category: "layout", icon: "⌂" },
    ],
  },
  {
    name: "content",
    label: "Content",
    items: [
      { type: "heading",    label: "Heading",       category: "content", icon: "H"  },
      { type: "paragraph",  label: "Paragraph",     category: "content", icon: "¶"  },
      { type: "rich-text",  label: "Rich Text",     category: "content", icon: "R"  },
      { type: "list",       label: "List",          category: "content", icon: "≡"  },
      { type: "table",      label: "Table",         category: "content", icon: "⊞"  },
      { type: "blockquote", label: "Blockquote",    category: "content", icon: "❝"  },
      { type: "code",       label: "Code",          category: "content", icon: "⟨⟩" },
      { type: "icon",       label: "Icon",          category: "content", icon: "★"  },
      { type: "button",     label: "Button",        category: "content", icon: "▣"  },
      { type: "badge",      label: "Badge",         category: "content", icon: "⬟"  },
      { type: "image",      label: "Image",         category: "content", icon: "🖼" },
      { type: "video",      label: "Video",         category: "content", icon: "▶"  },
      { type: "audio",      label: "Audio",         category: "content", icon: "♫"  },
      { type: "file",       label: "File Download", category: "content", icon: "⬇"  },
      { type: "alert",      label: "Alert",         category: "content", icon: "⚠"  },
      { type: "avatar",     label: "Avatar",        category: "content", icon: "👤" },
      { type: "banner",     label: "Banner",        category: "content", icon: "▭"  },
      { type: "hero",       label: "Hero",          category: "content", icon: "🎯" },
      { type: "cta",        label: "CTA",           category: "content", icon: "🚀" },
    ],
  },
  {
    name: "media",
    label: "Media",
    items: [
      { type: "gallery",   label: "Gallery",   category: "media", icon: "▥" },
      { type: "carousel",  label: "Carousel",  category: "media", icon: "⇄" },
      { type: "slideshow", label: "Slideshow", category: "media", icon: "▤" },
      { type: "lightbox",  label: "Lightbox",  category: "media", icon: "◻" },
    ],
  },
  {
    name: "interactive",
    label: "Interactive",
    items: [
      { type: "accordion",          label: "Accordion",     category: "interactive", icon: "≡"  },
      { type: "tabs",               label: "Tabs",          category: "interactive", icon: "▦"  },
      { type: "card",               label: "Card",          category: "interactive", icon: "▨"  },
      { type: "card-group",         label: "Card Group",    category: "interactive", icon: "▣"  },
      { type: "pricing-table",      label: "Pricing",       category: "interactive", icon: "$"  },
      { type: "testimonial",        label: "Testimonials",  category: "interactive", icon: "❝"  },
      { type: "team",               label: "Team",          category: "interactive", icon: "👥" },
      { type: "timeline",           label: "Timeline",      category: "interactive", icon: "↕"  },
      { type: "stats",              label: "Stats",         category: "interactive", icon: "📊" },
      { type: "progress",           label: "Progress",      category: "interactive", icon: "▤"  },
      { type: "faq",                label: "FAQ",           category: "interactive", icon: "?"  },
      { type: "contact-form",       label: "Contact Form",  category: "interactive", icon: "✉"  },
      { type: "newsletter-form",    label: "Newsletter",    category: "interactive", icon: "📧" },
      { type: "map",                label: "Map",           category: "interactive", icon: "📍" },
    ],
  },
  {
    name: "dynamic",
    label: "Dynamic (DB)",
    items: [
      { type: "news-feed",              label: "News Feed",         category: "dynamic", icon: "📰" },
      { type: "events-feed",            label: "Events Feed",       category: "dynamic", icon: "📅" },
      { type: "news-list-section",      label: "News List",         category: "dynamic", icon: "📋" },
      { type: "events-list-section",    label: "Events List",       category: "dynamic", icon: "📅" },
      { type: "jobs-list-section",      label: "Jobs List",         category: "dynamic", icon: "💼" },
      { type: "members-list-section",   label: "Members List",      category: "dynamic", icon: "👥" },
      { type: "publications-list-section",label: "Publications",    category: "dynamic", icon: "📚" },
      { type: "board-list-section",     label: "Board List",        category: "dynamic", icon: "🏛" },
    ],
  },
  {
    name: "page-sections",
    label: "Page Sections",
    items: [
      { type: "about-hero-banner",                label: "About Hero",          category: "page-sections", icon: "🖼" },
      { type: "about-overview-section",           label: "About Overview",      category: "page-sections", icon: "ℹ"  },
      { type: "about-vision-mission-section",     label: "Vision / Mission",    category: "page-sections", icon: "🎯" },
      { type: "about-timeline-section",           label: "About Timeline",      category: "page-sections", icon: "📅" },
      { type: "about-documents-section",          label: "About Documents",     category: "page-sections", icon: "📄" },
      { type: "about-gallery-section",            label: "About Gallery",       category: "page-sections", icon: "🖼" },
      { type: "board-hero-banner",                label: "Board Hero",          category: "page-sections", icon: "🏛" },
      { type: "board-members-grid",               label: "Board Members",       category: "page-sections", icon: "👥" },
      { type: "contact-hero-banner",              label: "Contact Hero",        category: "page-sections", icon: "✉"  },
      { type: "contact-form-section",             label: "Contact Form",        category: "page-sections", icon: "📋" },
      { type: "newsletter-hero-banner",           label: "Newsletter Hero",     category: "page-sections", icon: "📧" },
      { type: "president-message-hero-banner",    label: "President Hero",      category: "page-sections", icon: "👤" },
      { type: "president-message-content-section",label: "President Message",   category: "page-sections", icon: "📝" },
      { type: "publications-hero-banner",         label: "Publications Hero",   category: "page-sections", icon: "📚" },
    ],
  },
];

/**
 * PaletteWrapper type — optionally passed from PageBuilderRoot so that each
 * palette button is wrapped with useDraggable (from @dnd-kit) when a DndContext
 * is available.  Falls back to a plain <div> when not provided (e.g. in tests).
 */
type PaletteWrapperComponent = React.ComponentType<{
  blockType: string;
  children: React.ReactNode;
}>;

interface ComponentPaletteProps {
  onAdd: (type: string) => void;
  /** When provided, wraps each item with this component for @dnd-kit drag support */
  PaletteWrapper?: PaletteWrapperComponent;
}

export function ComponentPalette({ onAdd, PaletteWrapper }: ComponentPaletteProps) {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return COMPONENT_CATEGORIES;
    const q = search.toLowerCase();
    return COMPONENT_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search]);

  return (
    <div className="bg-card overflow-y-auto flex flex-col h-full">
      <div className="p-3 border-b space-y-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground p-4 text-center">
          No components match &quot;{search}&quot;
        </p>
      ) : (
        filtered.map((cat) => {
          const isCollapsed = collapsed.has(cat.name);
          return (
            <div key={cat.name} className="border-b last:border-0">
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors"
              >
                <span>{cat.label} ({cat.items.length})</span>
                {isCollapsed
                  ? <ChevronRight className="h-3 w-3" />
                  : <ChevronDown className="h-3 w-3" />
                }
              </button>

              {!isCollapsed && (
                <div className="p-1.5 grid grid-cols-2 gap-1">
                  {cat.items.map((item) => {
                    // The inner button: click always works via onAdd
                    const btn = (
                      <button
                        key={item.type}
                        onClick={() => onAdd(item.type)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors text-left w-full",
                          "hover:bg-muted hover:text-foreground text-muted-foreground",
                          "cursor-grab active:cursor-grabbing select-none"
                        )}
                        title={`Drag or click to add ${item.label}`}
                      >
                        <span className="w-4 text-center text-sm shrink-0 leading-none">
                          {item.icon}
                        </span>
                        <span className="truncate leading-tight">{item.label}</span>
                      </button>
                    );

                    // If a PaletteWrapper (PaletteItemDraggable) was supplied,
                    // wrap the button so @dnd-kit can track the drag.
                    if (PaletteWrapper) {
                      return (
                        <PaletteWrapper key={item.type} blockType={item.type}>
                          {btn}
                        </PaletteWrapper>
                      );
                    }

                    return btn;
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export { COMPONENT_CATEGORIES };
