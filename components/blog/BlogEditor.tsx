"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function BlogEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],

    content: value,

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="rounded-lg border bg-white">
      <EditorContent editor={editor} className="min-h-[600px] p-4" />
    </div>
  );
}
