"use client";

import { useState } from "react";
import BlogEditor from "@/components/blog/BlogEditor";
import { supabase } from "@/lib/supabaseClient";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [content, setContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

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

  async function handleFeaturedImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
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

      setFeaturedImage(data.publicUrl);
    } catch (error) {
      console.error(error);
      alert("Featured image upload failed");
    } finally {
      setUploadingImage(false);
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

  async function handleSavePost() {
    if (!title || !slug || !content) {
      alert("Please fill Title, Slug and Content");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("posts").insert({
        title,
        slug,
        excerpt,
        featured_image: featuredImage,
        content,

        seo_title: seoTitle || title,
        seo_description: seoDescription || excerpt,

        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Post saved successfully");

      setTitle("");
      setSlug("");
      setExcerpt("");
      setFeaturedImage("");
      setSeoTitle("");
      setSeoDescription("");
      setContent("");
    } catch (error) {
      console.error(error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">New Blog Post</h1>

      <div className="mb-4">
        <label className="mb-2 block font-semibold">Title</label>

        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);

            if (!slug) {
              setSlug(generateSlug(e.target.value));
            }
          }}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold">Slug</label>

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold">Excerpt</label>

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="h-24 w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold">Featured Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleFeaturedImageUpload}
        />

        {featuredImage && (
          <img
            src={featuredImage}
            alt=""
            className="mt-4 h-40 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block font-semibold">SEO Title</label>

        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-6">
        <label className="mb-2 block font-semibold">SEO Description</label>

        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          className="h-24 w-full rounded-lg border p-3"
        />
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">Import PDF</label>

        <input type="file" accept=".pdf" onChange={handlePdfUpload} />
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">Import Word (.docx)</label>

        <input type="file" accept=".docx" onChange={handleDocxUpload} />
      </div>

      <div className="mb-6 rounded-lg border p-4">
        <label className="mb-2 block font-semibold">
          Insert Image Into Content
        </label>

        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {uploadingImage && (
        <p className="mb-4 text-emerald-600">Uploading image...</p>
      )}

      {loading && <p className="mb-4 text-emerald-600">Reading document...</p>}

      <BlogEditor value={content} onChange={setContent} />

      <button
        onClick={handleSavePost}
        disabled={saving}
        className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white"
      >
        {saving ? "Saving..." : "Save Post"}
      </button>
    </main>
  );
}
