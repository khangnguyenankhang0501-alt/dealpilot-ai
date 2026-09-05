"use client";

import { useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import { supabase } from "@/lib/supabaseClient";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function BlogEditor({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,

      Link.configure({
        openOnClick: false,
      }),

      Image,
    ],

    content: value,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  function addLink() {
    const url = window.prompt("Enter URL");

    if (!url) return;

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
      })
      .run();
  }

  async function insertImage() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      try {
        setUploading(true);

        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
          .from("blog-images")
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        editor
          ?.chain()
          .focus()
          .setImage({
            src: data.publicUrl,
          })
          .run();
      } catch (error) {
        console.error(error);
        alert("Upload image failed");
      } finally {
        setUploading(false);
      }
    };
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Toolbar */}

      <div className="flex flex-wrap gap-2 border-b bg-slate-50 p-3">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          H3
        </button>

        <button
          type="button"
          onClick={addLink}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Link
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Bullet List
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Number List
        </button>

        <button
          type="button"
          onClick={insertImage}
          className="rounded border px-3 py-1 text-sm font-semibold hover:bg-slate-100"
        >
          Image
        </button>
      </div>

      {uploading && (
        <div className="border-b bg-emerald-50 p-3 text-sm text-emerald-700">
          Uploading image...
        </div>
      )}

      <EditorContent editor={editor} className="min-h-[500px] p-4" />
    </div>
  );
}
