"use client";

import { useState } from "react";
import BlogEditor from "@/components/blog/BlogEditor";
import { supabase } from "@/lib/supabaseClient";

export default function NewBlogPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/import-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setContent(data.text || "");
    } catch (error) {
      console.error(error);
      alert("Failed to import PDF");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocxUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blog/import-docx", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setContent(data.html || "");
    } catch (error) {
      console.error(error);
      alert("Failed to import DOCX");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);

      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;

      setContent(
        (prev) =>
          prev +
          `\n\n<img src="${imageUrl}" alt="" class="rounded-xl my-6" />\n\n`,
      );
    } catch (error) {
      console.error(error);
      alert("Upload image failed");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">New Blog Post</h1>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">Import PDF</label>

        <input type="file" accept=".pdf" onChange={handlePdfUpload} />
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">Import Word (.docx)</label>

        <input type="file" accept=".docx" onChange={handleDocxUpload} />
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">Upload Image</label>

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        {uploadingImage && (
          <p className="mt-2 text-sm text-emerald-600">Uploading image...</p>
        )}
      </div>

      {loading && <p className="mb-4 text-emerald-600">Reading document...</p>}

      <BlogEditor value={content} onChange={setContent} />
    </main>
  );
}
