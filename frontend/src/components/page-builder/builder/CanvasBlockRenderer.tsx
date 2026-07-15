/**
 * CanvasBlockRenderer — renders containers with inline-editable text fields.
 *
 * Every text element is wrapped with <InlineTextField> so the editor can
 * double-click any text directly on the canvas to edit it in place.
 *
 * Rules:
 *   - Double-click a text element → that specific field becomes contentEditable
 *   - Enter / blur → commits the value to block.props
 *   - Escape → cancels the edit
 *   - All styling is preserved during editing (same CSS classes)
 *
 * Architecture:
 *   InlineEditProvider (in BuilderCanvas) owns the editing state.
 *   InlineTextField reads from that context and renders either the styled text
 *   or a contentEditable version of the same styled element.
 */

"use client";

import React from "react";
import type { Block, BlockProps } from "@/types/block";
import { BlockRenderer } from "@/components/page-builder/BlockRenderer";
import { InlineTextField } from "./InlineTextField";
import { InlineItemsEditor, ITEMS_EDITOR_REGISTRY } from "./InlineItemsEditor";
import { updateBlockProps } from "@/components/page-builder/schema/tree-utils";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CanvasBlockRendererProps {
  block: Block;
  onSelectSelf: (e: React.MouseEvent) => void;
  renderChildren: () => React.ReactNode;
  onUpdateItems?: (blockId: string, itemsKey: string, newItems: Record<string, unknown>[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, fallback = ""): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

function styleFromProps(p: BlockProps): React.CSSProperties {
  const st: React.CSSProperties = {};
  if (p.paddingTop)    st.paddingTop    = str(p.paddingTop);
  if (p.paddingBottom) st.paddingBottom = str(p.paddingBottom);
  if (p.paddingLeft)   st.paddingLeft   = str(p.paddingLeft);
  if (p.paddingRight)  st.paddingRight  = str(p.paddingRight);
  if (p.marginTop)     st.marginTop     = str(p.marginTop);
  if (p.marginBottom)  st.marginBottom  = str(p.marginBottom);
  if (p.minHeight)     st.minHeight     = str(p.minHeight);
  if (p.textColor)     st.color         = str(p.textColor);
  if (p.fontSize)      st.fontSize      = str(p.fontSize);
  if (p.fontWeight)    st.fontWeight    = str(p.fontWeight) as React.CSSProperties["fontWeight"];
  if (p.borderRadius)  st.borderRadius  = str(p.borderRadius);
  if (p.borderWidth)   st.borderWidth   = str(p.borderWidth);
  if (p.borderColor)   st.borderColor   = str(p.borderColor);
  if (p.borderWidth || p.borderColor) st.borderStyle = "solid";
  if (p.boxShadow)     st.boxShadow     = str(p.boxShadow);

  const bgType = str(p.bgType);
  if (bgType === "solid" && p.backgroundColor) {
    st.backgroundColor = str(p.backgroundColor);
  } else if (bgType === "gradient" && p.backgroundGradient) {
    st.backgroundImage = str(p.backgroundGradient);
  } else if (bgType === "image" && p.backgroundImageUrl) {
    st.backgroundImage    = `url(${str(p.backgroundImageUrl)})`;
    st.backgroundSize     = str(p.backgroundSize, "cover");
    st.backgroundPosition = "center";
    st.backgroundRepeat   = "no-repeat";
  }

  const inlineCss = str(p.inlineCss);
  if (inlineCss) {
    for (const pair of inlineCss.split(";").map((s) => s.trim()).filter(Boolean)) {
      const colonIdx = pair.indexOf(":");
      if (colonIdx === -1) continue;
      const key = pair.slice(0, colonIdx).trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const val = pair.slice(colonIdx + 1).trim();
      if (key && val) (st as Record<string, string>)[key] = val;
    }
  }
  return st;
}

// ─── CanvasBlockRenderer ─────────────────────────────────────────────────────

export function CanvasBlockRenderer({
  block,
  onSelectSelf,
  renderChildren,
  onUpdateItems,
}: CanvasBlockRendererProps) {
  const { type, props } = block;
  const style = styleFromProps(props);
  const cssClass = str(props.cssClass);

  switch (type) {

    // ── section ──────────────────────────────────────────────────────────────
    case "section": {
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      return (
        <section className={`group/inline ${cssClass}`} style={style} onClick={onSelectSelf}>
          <div className={`container mx-auto px-4 ${maxWidth}`}>
            <InlineTextField
              blockId={block.id}
              propKey="title"
              propKeyAr="titleAr"
              value={str(props.title)}
              valueAr={str(props.titleAr)}
              tag="h2"
              className="font-heading text-3xl font-bold mb-2"
              placeholder="Section title…"
            />
            <InlineTextField
              blockId={block.id}
              propKey="subtitle"
              propKeyAr="subtitleAr"
              value={str(props.subtitle)}
              valueAr={str(props.subtitleAr)}
              tag="p"
              className="text-muted-foreground mb-8"
              placeholder="Subtitle…"
              multiline
            />
            {renderChildren()}
          </div>
        </section>
      );
    }

    // ── row ───────────────────────────────────────────────────────────────────
    case "row": {
      const gap = str(props.gap, "1.5rem");
      const flexWrap = str(props.wrap, "wrap") as React.CSSProperties["flexWrap"];
      return (
        <div
          style={{ display: "flex", flexWrap, alignItems: str(props.align, "stretch"),
            justifyContent: str(props.justify, "start"), gap, ...style }}
          className={cssClass}
          onClick={onSelectSelf}
        >
          {renderChildren()}
        </div>
      );
    }

    // ── column ────────────────────────────────────────────────────────────────
    case "column": {
      const width = str(props.width);
      const flexGrow = num(props.flexGrow, 1);
      return (
        <div
          style={{ flexGrow: width ? 0 : flexGrow, flexBasis: width || "auto", minWidth: 0, ...style }}
          className={cssClass}
          onClick={onSelectSelf}
        >
          {renderChildren()}
        </div>
      );
    }

    // ── grid ──────────────────────────────────────────────────────────────────
    case "grid": {
      const cols = num(props.columns, 3);
      const gap = str(props.gap, "1.5rem");
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      return (
        <div className={`container mx-auto px-4 ${maxWidth} ${cssClass}`} style={style} onClick={onSelectSelf}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
            {renderChildren()}
          </div>
        </div>
      );
    }

    // ── flexbox ───────────────────────────────────────────────────────────────
    case "flexbox": {
      const direction = str(props.direction, "row") as React.CSSProperties["flexDirection"];
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      return (
        <div className={`container mx-auto px-4 ${maxWidth} ${cssClass}`} style={style} onClick={onSelectSelf}>
          <div style={{ display: "flex", flexDirection: direction,
            flexWrap: str(props.wrap, "wrap") as React.CSSProperties["flexWrap"],
            justifyContent: str(props.justify, "start"),
            alignItems: str(props.align, "stretch"), gap: str(props.gap, "1rem") }}>
            {renderChildren()}
          </div>
        </div>
      );
    }

    // ── card-group ────────────────────────────────────────────────────────────
    case "card-group": {
      const cols = num(props.columns, 3);
      const gap = str(props.gap, "1.5rem");
      const maxWidth = str(props.maxWidth, "max-w-6xl");
      return (
        <div className={`group/inline ${cssClass}`} style={style} onClick={onSelectSelf}>
          <div className={`container mx-auto px-4 ${maxWidth} mb-8`}>
            <InlineTextField
              blockId={block.id}
              propKey="title"
              propKeyAr="titleAr"
              value={str(props.title)}
              valueAr={str(props.titleAr)}
              tag="h2"
              className="font-heading text-3xl font-bold"
              placeholder="Card group title…"
            />
          </div>
          <div className={`container mx-auto px-4 ${maxWidth} grid`}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
            {renderChildren()}
          </div>
        </div>
      );
    }

    // ── tabs + accordion (no text to inline-edit at container level) ──────────
    case "tabs":
      return (
        <div className={cssClass} style={style} onClick={onSelectSelf}>
          <div className="border-b mb-4 text-xs text-gray-400 p-2">Tabs container</div>
          {renderChildren()}
        </div>
      );

    case "accordion":
      return (
        <div className={cssClass} style={style} onClick={onSelectSelf}>
          <div className="border-b mb-4 text-xs text-gray-400 p-2">Accordion container</div>
          {renderChildren()}
        </div>
      );

    // ── Legacy / unknown container types ─────────────────────────────────────
    // These render their content via BlockRenderer (read-only) in the canvas
    // and expose inline editing for the key text fields using InlineTextField
    // overlaid on top of the rendered output.
    default: {
      return (
        <LegacyContainerWithInlineEdit
          block={block}
          style={style}
          cssClass={cssClass}
          onSelectSelf={onSelectSelf}
          renderChildren={renderChildren}
          onUpdateItems={onUpdateItems}
        />
      );
    }
  }
}

// ─── LegacyContainerWithInlineEdit ───────────────────────────────────────────
// Handles all legacy section types (about-hero-banner, hero, banner, etc.)
// by rendering the real BlockRenderer output then overlaying inline-editable
// fields for the most important text props.

function LegacyContainerWithInlineEdit({
  block, style, cssClass, onSelectSelf, renderChildren, onUpdateItems,
}: {
  block: Block;
  style: React.CSSProperties;
  cssClass: string;
  onSelectSelf: (e: React.MouseEvent) => void;
  renderChildren: () => React.ReactNode;
  onUpdateItems?: (blockId: string, itemsKey: string, newItems: Record<string, unknown>[]) => void;
}) {
  const { type, props } = block;
  const hasChildren = (block.children ?? []).length > 0;

  // Items editor section — renders InlineItemsEditor if a registry entry exists for this type
  const itemsEntry = ITEMS_EDITOR_REGISTRY[type];
  const ItemsEditorSection = itemsEntry ? (
    <div className="px-4 pb-4">
      <InlineItemsEditor
        blockId={block.id}
        itemsKey={itemsEntry.itemsKey}
        items={(props[itemsEntry.itemsKey] as Record<string, unknown>[] | undefined) ?? []}
        itemFields={itemsEntry.itemFields}
        onItemsChange={(newItems) => {
          onUpdateItems?.(block.id, itemsEntry.itemsKey, newItems);
        }}
      />
    </div>
  ) : null;

  // Hero-banner types share the same inline edit structure
  const isHeroBanner = [
    "hero",
    "about-hero-banner", "board-hero-banner", "contact-hero-banner",
    "newsletter-hero-banner", "president-message-hero-banner", "publications-hero-banner",
  ].includes(type);

  const bgImg = str(props.backgroundImage ?? props.backgroundImageUrl);
  const overlay = str(props.overlayColor, "rgba(0,0,0,0.5)");
  const minH = str(props.minHeight, type === "hero" ? "380px" : "320px");

  if (isHeroBanner) {
    return (
      <section
        className={`group/inline relative overflow-hidden flex items-center bg-gradient-to-br from-soil-dark via-deep-soil to-soil-clay text-white ${cssClass}`}
        style={{ ...style, minHeight: minH }}
        onClick={onSelectSelf}
      >
        {bgImg && (
          <div className="absolute inset-0">
            <img src={bgImg} alt="" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
          </div>
        )}
        {!bgImg && <div className="absolute inset-0 opacity-30 bg-noise" />}
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          {/* Bilingual subtitle shown as Arabic decorative line — single-key only */}
          <InlineTextField
            blockId={block.id}
            propKey="titleAr"
            value={str(props.titleAr)}
            tag="p"
            className="text-soil-sand fluid-lg font-medium mb-2"
            placeholder="العنوان بالعربية…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="title"
            propKeyAr="titleAr"
            value={str(props.title)}
            valueAr={str(props.titleAr)}
            tag="h1"
            className="font-heading fluid-4xl md:fluid-5xl font-bold leading-tight mb-4"
            placeholder="Hero title…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subtitle"
            propKeyAr="subtitleAr"
            value={str(props.subtitle)}
            valueAr={str(props.subtitleAr)}
            tag="p"
            className="text-white/80 fluid-lg md:fluid-xl max-w-2xl mx-auto leading-relaxed mb-6"
            placeholder="Subtitle / description…"
            multiline
          />
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {(str(props.primaryButtonLabel) || str(props.buttonLabel)) && (
              props.primaryButtonLabel !== undefined ? (
                <InlineTextField
                  blockId={block.id}
                  propKey="primaryButtonLabel"
                  propKeyAr="primaryButtonLabelAr"
                  value={str(props.primaryButtonLabel)}
                  valueAr={str(props.primaryButtonLabelAr)}
                  tag="span"
                  className="inline-block px-8 py-3 bg-white text-soil-dark rounded-lg font-medium cursor-text"
                  placeholder="Button…"
                />
              ) : (
                <InlineTextField
                  blockId={block.id}
                  propKey="buttonLabel"
                  propKeyAr="buttonLabelAr"
                  value={str(props.buttonLabel)}
                  valueAr={str(props.buttonLabelAr)}
                  tag="span"
                  className="inline-block px-8 py-3 bg-white text-soil-dark rounded-lg font-medium cursor-text"
                  placeholder="Button…"
                />
              )
            )}
          </div>
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // banner / cta share a simpler structure
  if (type === "banner" || type === "cta") {
    return (
      <div className={`group/inline relative overflow-hidden ${cssClass}`} style={style} onClick={onSelectSelf}>
        {bgImg && (
          <div className="absolute inset-0">
            <img src={bgImg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
        <div className={`relative z-10 container mx-auto px-4 py-12 text-center`}>
          <InlineTextField
            blockId={block.id}
            propKey="title"
            propKeyAr="titleAr"
            value={str(props.title)}
            valueAr={str(props.titleAr)}
            tag="h2"
            className={`font-heading text-2xl font-bold mb-2 ${bgImg ? "text-white" : "text-soil-dark"}`}
            placeholder="Title…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="text"
            propKeyAr="textAr"
            value={str(props.text)}
            valueAr={str(props.textAr)}
            tag="p"
            className={`mb-4 ${bgImg ? "text-white/80" : "text-muted-foreground"}`}
            placeholder="Body text…"
            multiline
          />
          <InlineTextField
            blockId={block.id}
            propKey="buttonLabel"
            propKeyAr="buttonLabelAr"
            value={str(props.buttonLabel)}
            valueAr={str(props.buttonLabelAr)}
            tag="span"
            className="inline-block px-6 py-2 bg-soil-dark text-white rounded-lg text-sm font-medium cursor-text"
            placeholder="Button label…"
          />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </div>
    );
  }

  // about-overview-section, about-organizational-chart-section, board-term-information-section
  if (type === "about-overview-section" || type === "about-organizational-chart-section" || type === "board-term-information-section") {
    return (
      <section className={`group/inline py-16 md:py-20 bg-white ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4 max-w-4xl">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading)}
            valueAr={str(props.headingAr)}
            tag="h2"
            className="font-heading fluid-3xl font-bold text-soil-dark mb-6 text-center"
            placeholder="Heading…"
          />
          <div className="w-16 h-1 bg-forest-light mx-auto mb-8 rounded-full" />
          <InlineTextField
            blockId={block.id}
            propKey="subtitle"
            propKeyAr="subtitleAr"
            value={str(props.subtitle)}
            valueAr={str(props.subtitleAr)}
            tag="p"
            className="text-earth-gray leading-relaxed text-center"
            placeholder="Content / description…"
            multiline
          />
        </div>
        {ItemsEditorSection}
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // about-vision-mission-section
  if (type === "about-vision-mission-section") {
    return (
      <section className={`group/inline py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading)}
            valueAr={str(props.headingAr)}
            tag="h2"
            className="font-heading text-3xl md:text-4xl font-bold text-soil-dark mb-6 text-center"
            placeholder="Section heading…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subheading"
            propKeyAr="subheadingAr"
            value={str(props.subheading)}
            valueAr={str(props.subheadingAr)}
            tag="p"
            className="text-earth-gray text-center max-w-2xl mx-auto mb-12"
            placeholder="Subheading…"
            multiline
          />
        </div>
        {ItemsEditorSection}
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // about-timeline-section
  if (type === "about-timeline-section") {
    return (
      <section className={`group/inline py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4 max-w-4xl">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading)}
            valueAr={str(props.headingAr)}
            tag="h2"
            className="font-heading fluid-3xl font-bold text-soil-dark mb-6 text-center"
            placeholder="Heading…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subheading"
            propKeyAr="subheadingAr"
            value={str(props.subheading)}
            valueAr={str(props.subheadingAr)}
            tag="p"
            className="text-earth-gray text-center max-w-2xl mx-auto mb-12"
            placeholder="Subheading…"
            multiline
          />
        </div>
        {ItemsEditorSection}
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // about-gallery-section
  if (type === "about-gallery-section") {
    return (
      <section className={`group/inline py-16 md:py-20 bg-soil-sand/30 ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4 max-w-6xl">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading)}
            valueAr={str(props.headingAr)}
            tag="h2"
            className="font-heading fluid-3xl font-bold text-soil-dark mb-6 text-center"
            placeholder="Gallery heading…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subheading"
            propKeyAr="subheadingAr"
            value={str(props.subheading)}
            valueAr={str(props.subheadingAr)}
            tag="p"
            className="text-earth-gray text-center max-w-2xl mx-auto mb-10"
            placeholder="Subheading…"
            multiline
          />
        </div>
        {ItemsEditorSection}
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // board-members-intro-grid / board-members-grid
  if (type === "board-members-intro-grid" || type === "board-members-grid") {
    return (
      <section className={`group/inline py-12 bg-white ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading || props.title)}
            valueAr={str(props.headingAr || props.titleAr)}
            tag="h2"
            className="font-heading text-3xl font-bold text-soil-dark mb-4 text-center"
            placeholder="Section heading…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subheading"
            propKeyAr="subheadingAr"
            value={str(props.subheading)}
            valueAr={str(props.subheadingAr)}
            tag="p"
            className="text-earth-gray text-center max-w-2xl mx-auto mb-8"
            placeholder="Subheading…"
            multiline
          />
        </div>
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // president-message-content-section
  if (type === "president-message-content-section") {
    return (
      <section className={`group/inline py-16 md:py-20 bg-white ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4 max-w-4xl">
          <InlineTextField
            blockId={block.id}
            propKey="heading"
            propKeyAr="headingAr"
            value={str(props.heading)}
            valueAr={str(props.headingAr)}
            tag="h2"
            className="font-heading text-3xl font-bold text-soil-dark mb-8"
            placeholder="Section heading…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="presidentName"
            propKeyAr="presidentNameAr"
            value={str(props.presidentName)}
            valueAr={str(props.presidentNameAr)}
            tag="h3"
            className="font-heading text-2xl font-bold text-soil-dark"
            placeholder="President name…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="presidentTitle"
            propKeyAr="presidentTitleAr"
            value={str(props.presidentTitle)}
            valueAr={str(props.presidentTitleAr)}
            tag="p"
            className="text-earth-gray"
            placeholder="President title…"
          />
        </div>
        {ItemsEditorSection}
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // Dynamic list sections — show heading inline, render list via BlockRenderer
  const isDynamicList = [
    "news-list-section", "events-list-section", "jobs-list-section",
    "members-list-section", "publications-list-section", "board-list-section",
  ].includes(type);

  if (isDynamicList) {
    return (
      <section className={`group/inline py-12 bg-white ${cssClass}`} style={style} onClick={onSelectSelf}>
        <div className="container mx-auto px-4 max-w-6xl">
          <InlineTextField
            blockId={block.id}
            propKey="title"
            propKeyAr="titleAr"
            value={str(props.title)}
            valueAr={str(props.titleAr)}
            tag="h2"
            className="font-heading text-3xl font-bold text-soil-dark mb-4 text-center"
            placeholder="Section title…"
          />
          <InlineTextField
            blockId={block.id}
            propKey="subtitle"
            propKeyAr="subtitleAr"
            value={str(props.subtitle)}
            valueAr={str(props.subtitleAr)}
            tag="p"
            className="text-earth-gray text-center mb-8"
            placeholder="Subtitle…"
            multiline
          />
        </div>
        <div className="pointer-events-none select-none">
          <BlockRenderer blocks={[block]} ignoreVisibility />
        </div>
        {hasChildren && <div className="relative z-20">{renderChildren()}</div>}
      </section>
    );
  }

  // Generic fallback — render BlockRenderer visually, no inline editing
  return (
    <div className={cssClass} style={style} onClick={onSelectSelf}>
      <div className="pointer-events-none select-none">
        <BlockRenderer blocks={[block]} ignoreVisibility />
      </div>
      {hasChildren && <div className="relative">{renderChildren()}</div>}
    </div>
  );
}
