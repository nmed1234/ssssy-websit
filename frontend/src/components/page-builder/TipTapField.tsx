"use client";

/**
 * TipTapField — compact WYSIWYG rich-text editor for PropertyPanel.
 *
 * Props:
 *   value   — HTML string (initial content)
 *   onChange — called with HTML on every editor update
 *   dir      — "rtl" | "ltr" (default ltr)
 */

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TipTapFieldProps {
  value: string;
  onChange: (html: string) => void;
  dir?: "rtl" | "ltr";
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        // Prevent editor blur before the command fires
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1 rounded transition-colors hover:bg-gray-200 ${
        active ? "bg-gray-200 text-blue-600" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Inner editor (uses hooks, safe to call unconditionally) ──────────────────

function TipTapInner({
  value,
  onChange,
  dir,
}: TipTapFieldProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync external value changes (e.g. undo/redo from parent)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    // Still hydrating — show textarea placeholder
    return (
      <textarea
        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs resize-y min-h-[80px] font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-200 rounded text-xs">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-1 py-0.5 border-b border-gray-200 bg-gray-50">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        <ToolbarBtn
          onClick={addLink}
          active={editor.isActive("link")}
          title="Insert Link"
        >
          <Link className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <span className="w-px h-4 bg-gray-300 mx-0.5" />

        <ToolbarBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* ── Editor content ── */}
      <div
        className={`max-h-[280px] overflow-y-auto p-2 prose prose-xs max-w-none focus:outline-none ${
          dir === "rtl" ? "text-right" : ""
        }`}
        dir={dir === "rtl" ? "rtl" : undefined}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ─── Public export with error boundary fallback ───────────────────────────────

export function TipTapField(props: TipTapFieldProps) {
  try {
    return <TipTapInner {...props} />;
  } catch {
    return (
      <textarea
        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs resize-y min-h-[80px] font-mono"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    );
  }
}

export default TipTapField;
