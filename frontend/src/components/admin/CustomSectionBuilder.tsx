"use client";

import { useState, useCallback, useRef } from "react";
import { X, Plus, GripVertical, Trash2, Eye, Settings, Save, Loader2 } from "lucide-react";
import type { Block, BlockType } from "@/types";
import { BLOCK_PALETTE, BLOCK_CATEGORIES, type BlockCategory } from "@/lib/block-types";
function nanoid(len = 8): string {
  return Math.random().toString(36).slice(2, 2 + len);
}

// ── Block Prop Editor ─────────────────────────────────────────────────────────

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-y"
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function BilingualField({ labelEn, labelAr, valueEn, valueAr, onChangeEn, onChangeAr, multiline = false }: {
  labelEn: string; labelAr: string; valueEn: string; valueAr: string;
  onChangeEn: (v: string) => void; onChangeAr: (v: string) => void; multiline?: boolean;
}) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs font-medium text-gray-600">{lang === "en" ? labelEn : labelAr}</label>
        <div className="ml-auto flex rounded-md border border-gray-200 overflow-hidden text-xs">
          <button onClick={() => setLang("en")} className={`px-2 py-0.5 ${lang === "en" ? "bg-green-700 text-white" : "bg-white text-gray-500"}`}>EN</button>
          <button onClick={() => setLang("ar")} className={`px-2 py-0.5 ${lang === "ar" ? "bg-green-700 text-white" : "bg-white text-gray-500"}`}>AR</button>
        </div>
      </div>
      {multiline ? (
        <textarea rows={3} value={lang === "en" ? valueEn : valueAr} onChange={(e) => lang === "en" ? onChangeEn(e.target.value) : onChangeAr(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-y" dir={lang === "ar" ? "rtl" : "ltr"} />
      ) : (
        <input type="text" value={lang === "en" ? valueEn : valueAr} onChange={(e) => lang === "en" ? onChangeEn(e.target.value) : onChangeAr(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" dir={lang === "ar" ? "rtl" : "ltr"} />
      )}
    </div>
  );
}

function BlockPropEditor({ block, onChange }: { block: Block; onChange: (props: Record<string, unknown>) => void }) {
  const p = block.props;
  const set = (key: string, value: unknown) => onChange({ ...p, [key]: value });

  switch (block.type) {
    case "heading": return (
      <div>
        <BilingualField labelEn="Text (EN)" labelAr="النص (AR)" valueEn={p.textEn as string} valueAr={p.textAr as string} onChangeEn={(v) => set("textEn", v)} onChangeAr={(v) => set("textAr", v)} />
        <SelectField label="Level" value={p.level as string} options={[{ value: "h1", label: "H1" }, { value: "h2", label: "H2" }, { value: "h3", label: "H3" }, { value: "h4", label: "H4" }]} onChange={(v) => set("level", v)} />
        <SelectField label="Alignment" value={p.align as string} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={(v) => set("align", v)} />
      </div>
    );
    case "paragraph": return (
      <div>
        <BilingualField labelEn="Text (EN)" labelAr="النص (AR)" valueEn={p.textEn as string} valueAr={p.textAr as string} onChangeEn={(v) => set("textEn", v)} onChangeAr={(v) => set("textAr", v)} multiline />
        <SelectField label="Alignment" value={p.align as string} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={(v) => set("align", v)} />
      </div>
    );
    case "image": return (
      <div>
        <TextField label="Image URL" value={p.src as string} onChange={(v) => set("src", v)} />
        <BilingualField labelEn="Alt Text (EN)" labelAr="النص البديل (AR)" valueEn={p.altEn as string} valueAr={p.altAr as string} onChangeEn={(v) => set("altEn", v)} onChangeAr={(v) => set("altAr", v)} />
        <BilingualField labelEn="Caption (EN)" labelAr="التعليق (AR)" valueEn={p.captionEn as string} valueAr={p.captionAr as string} onChangeEn={(v) => set("captionEn", v)} onChangeAr={(v) => set("captionAr", v)} />
      </div>
    );
    case "button": return (
      <div>
        <BilingualField labelEn="Label (EN)" labelAr="التسمية (AR)" valueEn={p.labelEn as string} valueAr={p.labelAr as string} onChangeEn={(v) => set("labelEn", v)} onChangeAr={(v) => set("labelAr", v)} />
        <TextField label="URL" value={p.url as string} onChange={(v) => set("url", v)} />
        <SelectField label="Variant" value={p.variant as string} options={[{ value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }, { value: "outline", label: "Outline" }]} onChange={(v) => set("variant", v)} />
        <SelectField label="Alignment" value={p.align as string} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={(v) => set("align", v)} />
      </div>
    );
    case "video": return (
      <div>
        <TextField label="Video URL (YouTube or direct)" value={p.src as string} onChange={(v) => set("src", v)} />
        <BilingualField labelEn="Caption (EN)" labelAr="التعليق (AR)" valueEn={p.captionEn as string} valueAr={p.captionAr as string} onChangeEn={(v) => set("captionEn", v)} onChangeAr={(v) => set("captionAr", v)} />
      </div>
    );
    case "icon": return (
      <div>
        <TextField label="Icon Name" value={p.name as string} onChange={(v) => set("name", v)} />
        <TextField label="Size (e.g. 48px)" value={p.size as string} onChange={(v) => set("size", v)} />
        <TextField label="Color class (e.g. text-forest)" value={p.color as string} onChange={(v) => set("color", v)} />
        <BilingualField labelEn="Label (EN)" labelAr="التسمية (AR)" valueEn={p.labelEn as string} valueAr={p.labelAr as string} onChangeEn={(v) => set("labelEn", v)} onChangeAr={(v) => set("labelAr", v)} />
      </div>
    );
    case "card": return (
      <div>
        <BilingualField labelEn="Title (EN)" labelAr="العنوان (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <BilingualField labelEn="Description (EN)" labelAr="الوصف (AR)" valueEn={p.descriptionEn as string} valueAr={p.descriptionAr as string} onChangeEn={(v) => set("descriptionEn", v)} onChangeAr={(v) => set("descriptionAr", v)} multiline />
        <TextField label="Image URL" value={p.image as string} onChange={(v) => set("image", v)} />
        <TextField label="Link URL" value={p.linkUrl as string} onChange={(v) => set("linkUrl", v)} />
        <BilingualField labelEn="Link Label (EN)" labelAr="تسمية الرابط (AR)" valueEn={p.linkLabelEn as string} valueAr={p.linkLabelAr as string} onChangeEn={(v) => set("linkLabelEn", v)} onChangeAr={(v) => set("linkLabelAr", v)} />
      </div>
    );
    case "divider": return (
      <div>
        <SelectField label="Style" value={p.style as string} options={[{ value: "solid", label: "Solid" }, { value: "dashed", label: "Dashed" }, { value: "dotted", label: "Dotted" }]} onChange={(v) => set("style", v)} />
        <TextField label="Margin class (e.g. my-8)" value={p.margin as string} onChange={(v) => set("margin", v)} />
      </div>
    );
    case "spacer": return (
      <div>
        <SelectField label="Height" value={p.height as string} options={[
          { value: "h-4", label: "Small (16px)" }, { value: "h-8", label: "Medium (32px)" },
          { value: "h-12", label: "Large (48px)" }, { value: "h-16", label: "XL (64px)" }, { value: "h-24", label: "XXL (96px)" },
        ]} onChange={(v) => set("height", v)} />
      </div>
    );
    case "columns": return (
      <div>
        <SelectField label="Number of Columns" value={String(p.columnCount)} options={[
          { value: "1", label: "1 Column" }, { value: "2", label: "2 Columns" },
          { value: "3", label: "3 Columns" }, { value: "4", label: "4 Columns" },
        ]} onChange={(v) => set("columnCount", Number(v))} />
        <SelectField label="Gap" value={p.gap as string} options={[{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]} onChange={(v) => set("gap", v)} />
        <p className="text-xs text-gray-400 italic">Add blocks inside each column from the canvas.</p>
      </div>
    );
    case "alert": return (
      <div>
        <SelectField label="Variant" value={p.variant as string} options={[{ value: "info", label: "Info" }, { value: "warning", label: "Warning" }, { value: "success", label: "Success" }, { value: "error", label: "Error" }]} onChange={(v) => set("variant", v)} />
        <BilingualField labelEn="Message (EN)" labelAr="الرسالة (AR)" valueEn={p.messageEn as string} valueAr={p.messageAr as string} onChangeEn={(v) => set("messageEn", v)} onChangeAr={(v) => set("messageAr", v)} multiline />
      </div>
    );
    case "quote": return (
      <div>
        <BilingualField labelEn="Quote Text (EN)" labelAr="نص الاقتباس (AR)" valueEn={p.textEn as string} valueAr={p.textAr as string} onChangeEn={(v) => set("textEn", v)} onChangeAr={(v) => set("textAr", v)} multiline />
        <BilingualField labelEn="Author (EN)" labelAr="المؤلف (AR)" valueEn={p.authorEn as string} valueAr={p.authorAr as string} onChangeEn={(v) => set("authorEn", v)} onChangeAr={(v) => set("authorAr", v)} />
        <BilingualField labelEn="Author Role (EN)" labelAr="دور المؤلف (AR)" valueEn={p.authorRoleEn as string} valueAr={p.authorRoleAr as string} onChangeEn={(v) => set("authorRoleEn", v)} onChangeAr={(v) => set("authorRoleAr", v)} />
      </div>
    );
    case "code": return (
      <div>
        <SelectField label="Language" value={p.language as string} options={[
          { value: "javascript", label: "JavaScript" }, { value: "python", label: "Python" },
          { value: "html", label: "HTML" }, { value: "css", label: "CSS" },
          { value: "sql", label: "SQL" }, { value: "bash", label: "Bash" }, { value: "text", label: "Plain Text" },
        ]} onChange={(v) => set("language", v)} />
        <TextAreaField label="Code" value={p.code as string} onChange={(v) => set("code", v)} rows={6} />
      </div>
    );
    case "html": return (
      <div>
        <TextAreaField label="Raw HTML" value={p.rawHtml as string} onChange={(v) => set("rawHtml", v)} rows={8} />
        <p className="text-xs text-amber-600 mt-1">⚠ HTML is sanitized on the public site.</p>
      </div>
    );
    case "map": return (
      <div>
        <TextField label="Google Maps Embed URL" value={p.embedUrl as string} onChange={(v) => set("embedUrl", v)} />
        <TextField label="Height (e.g. 400px)" value={p.height as string} onChange={(v) => set("height", v)} />
        <BilingualField labelEn="Caption (EN)" labelAr="التعليق (AR)" valueEn={p.captionEn as string} valueAr={p.captionAr as string} onChangeEn={(v) => set("captionEn", v)} onChangeAr={(v) => set("captionAr", v)} />
      </div>
    );
    case "form-embed": return (
      <div>
        <TextAreaField label="Embed HTML / iFrame Code" value={p.embedHtml as string} onChange={(v) => set("embedHtml", v)} rows={5} />
        <TextField label="Height (e.g. 500px)" value={p.height as string} onChange={(v) => set("height", v)} />
      </div>
    );
    case "latest-news": return (
      <div>
        <BilingualField labelEn="Section Title (EN)" labelAr="عنوان القسم (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <SelectField label="Number of Articles" value={String(p.count)} options={[{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} onChange={(v) => set("count", Number(v))} />
        <SelectField label="Layout" value={p.layout as string} options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} onChange={(v) => set("layout", v)} />
      </div>
    );
    case "upcoming-events": return (
      <div>
        <BilingualField labelEn="Section Title (EN)" labelAr="عنوان القسم (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <SelectField label="Number of Events" value={String(p.count)} options={[{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }]} onChange={(v) => set("count", Number(v))} />
      </div>
    );
    case "publications-carousel": return (
      <div>
        <BilingualField labelEn="Section Title (EN)" labelAr="عنوان القسم (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <TextField label="View All URL" value={p.viewAllUrl as string} onChange={(v) => set("viewAllUrl", v)} />
      </div>
    );
    case "board-members": return (
      <div>
        <BilingualField labelEn="Section Title (EN)" labelAr="عنوان القسم (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <SelectField label="Layout" value={p.layout as string} options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} onChange={(v) => set("layout", v)} />
      </div>
    );
    case "statistics-counter": return (
      <div>
        <BilingualField labelEn="Section Title (EN)" labelAr="عنوان القسم (AR)" valueEn={p.titleEn as string} valueAr={p.titleAr as string} onChangeEn={(v) => set("titleEn", v)} onChangeAr={(v) => set("titleAr", v)} />
        <p className="text-xs text-gray-500 mb-2">Stats items</p>
        {((p.items as Array<Record<string, string>>) || []).map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-2 mb-2">
            <TextField label="Value" value={item.value} onChange={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], value: v }; set("items", items); }} />
            <BilingualField labelEn="Label (EN)" labelAr="التسمية (AR)" valueEn={item.labelEn} valueAr={item.labelAr} onChangeEn={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], labelEn: v }; set("items", items); }} onChangeAr={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], labelAr: v }; set("items", items); }} />
          </div>
        ))}
      </div>
    );
    case "accordion": return (
      <div>
        {((p.items as Array<Record<string, string>>) || []).map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-2 mb-2">
            <BilingualField labelEn={`Q${i + 1} (EN)`} labelAr={`س${i + 1} (AR)`} valueEn={item.questionEn} valueAr={item.questionAr} onChangeEn={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], questionEn: v }; set("items", items); }} onChangeAr={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], questionAr: v }; set("items", items); }} />
            <BilingualField labelEn={`A${i + 1} (EN)`} labelAr={`ج${i + 1} (AR)`} valueEn={item.answerEn} valueAr={item.answerAr} onChangeEn={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], answerEn: v }; set("items", items); }} onChangeAr={(v) => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items[i] = { ...items[i], answerAr: v }; set("items", items); }} multiline />
          </div>
        ))}
        <button onClick={() => { const items = [...((p.items as Array<Record<string, string>>) || [])]; items.push({ questionEn: "New Question", questionAr: "سؤال جديد", answerEn: "Answer here.", answerAr: "الإجابة هنا." }); set("items", items); }} className="text-xs text-green-700 hover:underline">+ Add Item</button>
      </div>
    );
    default: return (
      <div className="text-xs text-gray-400 italic py-4 text-center">
        No editable properties for this block type.
      </div>
    );
  }
}

// ── Block Preview Renderer (placeholder-based) ────────────────────────────────

function BlockPreview({ block }: { block: Block }) {
  const p = block.props;
  const isDynamic = ["latest-news", "upcoming-events", "publications-carousel", "board-members", "statistics-counter"].includes(block.type);

  if (isDynamic) return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 flex flex-col items-center justify-center gap-2 min-h-[80px]">
      <div className="text-lg">{BLOCK_PALETTE.find(b => b.type === block.type)?.icon}</div>
      <p className="text-xs font-medium text-gray-500">{BLOCK_PALETTE.find(b => b.type === block.type)?.label}</p>
      <div className="w-full space-y-1.5 mt-1">
        {[...Array(3)].map((_, i) => <div key={i} className="h-3 bg-gray-200 rounded animate-pulse" style={{ width: `${85 - i * 12}%` }} />)}
      </div>
    </div>
  );

  switch (block.type) {
    case "heading": {
      const Tag = (p.level as string) || "h2";
      const sizes: Record<string, string> = { h1: "text-3xl font-bold", h2: "text-2xl font-bold", h3: "text-xl font-semibold", h4: "text-lg font-semibold" };
      return <div className={`${sizes[Tag] || "text-2xl font-bold"} text-gray-900`} style={{ textAlign: (p.align as "left" | "center" | "right") || "left" }}>{(p.textEn as string) || "Heading"}</div>;
    }
    case "paragraph":
      return <p className="text-gray-600 leading-relaxed" style={{ textAlign: (p.align as "left" | "center" | "right") || "left" }}>{(p.textEn as string) || "Paragraph text"}</p>;
    case "image":
      return p.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="rounded-lg overflow-hidden"><img src={p.src as string} alt={(p.altEn as string) || ""} className="w-full object-cover max-h-60" /></div>
      ) : (
        <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">🖼 Image placeholder</div>
      );
    case "button": {
      const variants: Record<string, string> = { primary: "bg-green-700 text-white", secondary: "bg-gray-700 text-white", outline: "border-2 border-green-700 text-green-700" };
      return <div style={{ textAlign: (p.align as "left" | "center" | "right") || "left" }}><span className={`inline-block px-5 py-2 rounded-lg text-sm font-medium ${variants[(p.variant as string)] || variants.primary}`}>{(p.labelEn as string) || "Button"}</span></div>;
    }
    case "divider":
      return <hr className={`border-gray-200 ${p.margin as string || "my-8"}`} />;
    case "spacer":
      return <div className={p.height as string || "h-8"} />;
    case "columns": {
      const count = (p.columnCount as number) || 2;
      const gaps: Record<string, string> = { sm: "gap-2", md: "gap-4", lg: "gap-8" };
      return (
        <div className={`grid grid-cols-${count} ${gaps[(p.gap as string)] || "gap-4"}`}>
          {[...Array(count)].map((_, i) => (
            <div key={i} className="border-2 border-dashed border-gray-200 rounded-lg min-h-[80px] p-3 flex items-center justify-center">
              {(block.columns && block.columns[i]?.length) ? (
                <div className="w-full space-y-2">
                  {block.columns[i].map(child => <BlockPreview key={child.id} block={child} />)}
                </div>
              ) : (
                <span className="text-xs text-gray-400">Column {i + 1}</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    case "video":
      return (
        <div className="bg-gray-900 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm">
          ▶ {(p.src as string) ? "Video" : "Video placeholder"}
        </div>
      );
    case "icon":
      return <div className="flex flex-col items-center gap-1" style={{ textAlign: "center" }}><div className="text-4xl text-green-700">★</div>{(p.labelEn as string) && <p className="text-xs text-gray-500">{p.labelEn as string}</p>}</div>;
    case "card":
      return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {(p.image as string) ? <div className="h-28 bg-gray-100 overflow-hidden"><img src={p.image as string} alt="" className="w-full h-full object-cover" /></div> : <div className="h-28 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">🖼 Image</div>}
          <div className="p-3"><p className="font-semibold text-gray-900 text-sm">{(p.titleEn as string) || "Card Title"}</p><p className="text-xs text-gray-500 mt-1 line-clamp-2">{(p.descriptionEn as string) || "Card description"}</p></div>
        </div>
      );
    case "alert": {
      const alertStyles: Record<string, string> = { info: "bg-blue-50 border-blue-200 text-blue-800", warning: "bg-amber-50 border-amber-200 text-amber-800", success: "bg-green-50 border-green-200 text-green-800", error: "bg-red-50 border-red-200 text-red-800" };
      const icons: Record<string, string> = { info: "ℹ", warning: "⚠", success: "✓", error: "✕" };
      const v = (p.variant as string) || "info";
      return <div className={`border rounded-lg p-3 flex gap-2 text-sm ${alertStyles[v] || alertStyles.info}`}><span>{icons[v]}</span><span>{(p.messageEn as string) || "Alert message"}</span></div>;
    }
    case "quote":
      return <blockquote className="border-l-4 border-green-700 pl-4 italic text-gray-700"><p className="mb-2">&ldquo;{(p.textEn as string) || "Quote text"}&rdquo;</p>{(p.authorEn as string) && <cite className="text-sm font-semibold not-italic text-gray-900">— {p.authorEn as string}</cite>}</blockquote>;
    case "code":
      return <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-40"><code>{(p.code as string) || "// code"}</code></pre>;
    case "html":
      return <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-xs text-gray-500 font-mono max-h-24 overflow-auto">{(p.rawHtml as string) || "<p>HTML embed</p>"}</div>;
    case "map":
      return <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">🗺 Map embed</div>;
    case "form-embed":
      return <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200">📋 Form embed</div>;
    default:
      return <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 text-xs text-gray-400 text-center">{block.type}</div>;
  }
}

// ── Block Row ─────────────────────────────────────────────────────────────────

function BlockRow({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
}) {
  const palette = BLOCK_PALETTE.find(b => b.type === block.type);
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e, index); }}
      onDrop={() => onDrop(index)}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all cursor-pointer ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 text-gray-300 group-hover:text-gray-400 flex-shrink-0 cursor-grab" />
      <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded text-xs flex items-center justify-center font-mono">{palette?.icon || "?"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">{palette?.label || block.type}</p>
        <p className="text-xs text-gray-400 truncate">
          {(block.props.textEn as string) || (block.props.titleEn as string) || (block.props.labelEn as string) || palette?.description || ""}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Settings className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

// ── Main Custom Section Builder ───────────────────────────────────────────────

interface Props {
  sectionName: string;
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => Promise<void>;
  onClose: () => void;
}

export default function CustomSectionBuilder({ sectionName, initialBlocks, onSave, onClose }: Props) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activePaletteCat, setActivePaletteCat] = useState<BlockCategory>("Core");
  const [paletteSearch, setPaletteSearch] = useState("");
  const [previewMode, setPreviewMode] = useState<"preview" | "props">("props");
  const [saving, setSaving] = useState(false);
  const dragIndex = useRef<number | null>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId) ?? null;

  // ── Add block from palette ────────────────────────────────────────────────
  const addBlock = useCallback((type: BlockType, defaultProps: Record<string, unknown>) => {
    const palette = BLOCK_PALETTE.find(b => b.type === type);
    const newBlock: Block = {
      id: nanoid(8),
      type,
      props: { ...defaultProps },
      columns: type === "columns" ? [[], []] : undefined,
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setPreviewMode("props");
  }, []);

  // ── Update block props ────────────────────────────────────────────────────
  const updateBlockProps = useCallback((id: string, props: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, props } : b));
  }, []);

  // ── Delete block ──────────────────────────────────────────────────────────
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }, [selectedBlockId]);

  // ── Drag reorder ──────────────────────────────────────────────────────────
  const handleDragStart = useCallback((i: number) => { dragIndex.current = i; }, []);
  const handleDragOver = useCallback((e: React.DragEvent, i: number) => { e.preventDefault(); }, []);
  const handleDrop = useCallback((targetIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === targetIndex) return;
    setBlocks(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex.current!, 1);
      arr.splice(targetIndex, 0, moved);
      return arr;
    });
    dragIndex.current = null;
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(blocks);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // ── Palette filtered ──────────────────────────────────────────────────────
  const paletteFiltered = BLOCK_PALETTE.filter(b => {
    const matchesCat = b.category === activePaletteCat;
    const q = paletteSearch.toLowerCase();
    return matchesCat && (!q || b.label.toLowerCase().includes(q) || b.type.includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X className="h-5 w-5" /></button>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Custom Section Builder</p>
            <h2 className="text-sm font-semibold text-gray-900 leading-tight">{sectionName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Blocks
          </button>
        </div>
      </div>

      {/* ── Body: 3-column layout ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex">

        {/* Column 1: Block Palette ──────────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="px-3 pt-3 pb-2 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Block</p>
            <input
              type="text"
              placeholder="Search..."
              value={paletteSearch}
              onChange={(e) => setPaletteSearch(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
            />
          </div>
          {/* Category tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            {BLOCK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActivePaletteCat(cat)}
                className={`flex-1 py-1.5 text-xs font-medium transition-colors ${activePaletteCat === cat ? "border-b-2 border-green-700 text-green-700 bg-white" : "text-gray-500 hover:text-gray-700"}`}
              >
                {cat === "Core" ? "Core" : cat === "Advanced" ? "Adv." : "Dyn."}
              </button>
            ))}
          </div>
          {/* Block list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {paletteFiltered.map(item => (
              <button
                key={item.type}
                onClick={() => addBlock(item.type, item.defaultProps)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white hover:shadow-sm transition-all group"
              >
                <span className="w-7 h-7 flex-shrink-0 bg-white border border-gray-200 rounded text-sm flex items-center justify-center group-hover:border-green-300">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{item.label}</p>
                </div>
                <Plus className="h-3 w-3 text-gray-300 group-hover:text-green-600 ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Block Canvas ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 bg-white">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Canvas</p>
            <span className="text-xs text-gray-300">— drag to reorder</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-20">
                <Plus className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Add your first block</p>
                <p className="text-xs mt-1">Click any block type in the palette on the left</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <BlockRow
                    key={block.id}
                    block={block}
                    index={index}
                    isSelected={block.id === selectedBlockId}
                    onSelect={() => { setSelectedBlockId(block.id); setPreviewMode("props"); }}
                    onDelete={() => deleteBlock(block.id)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Props / Preview Panel ─────────────────────────────── */}
        <div className="w-80 flex-shrink-0 border-l border-gray-200 flex flex-col bg-white">
          {/* Panel header + toggle */}
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 flex-shrink-0">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
              <button onClick={() => setPreviewMode("props")} className={`px-3 py-1.5 flex items-center gap-1 ${previewMode === "props" ? "bg-green-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><Settings className="h-3 w-3" />Props</button>
              <button onClick={() => setPreviewMode("preview")} className={`px-3 py-1.5 flex items-center gap-1 ${previewMode === "preview" ? "bg-green-700 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}><Eye className="h-3 w-3" />Preview</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedBlock ? (
              <div className="text-center text-gray-400 py-12">
                <Settings className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a block to edit its properties</p>
              </div>
            ) : previewMode === "props" ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">{BLOCK_PALETTE.find(b => b.type === selectedBlock.type)?.icon}</span>
                  <p className="text-sm font-semibold text-gray-900">{BLOCK_PALETTE.find(b => b.type === selectedBlock.type)?.label}</p>
                </div>
                <BlockPropEditor
                  block={selectedBlock}
                  onChange={(props) => updateBlockProps(selectedBlock.id, props)}
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Live Preview</p>
                <BlockPreview block={selectedBlock} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
