"use client";

import { useState } from "react";
import BlogEditor from "./BlogEditor";
import { supabase } from "@/lib/supabaseClient";

export default function PostForm() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [featuredImage, setFeaturedImage] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [status, setStatus] = useState("draft");

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
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
        content,
        featured_image: featuredImage,
        seo_title: seoTitle,
        seo_description: seoDescription,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.log("FULL ERROR:", error);
        alert(JSON.stringify(error, null, 2));
        return;
      }

      alert("Post saved successfully");

      setTitle("");
      setSlug("");
      setExcerpt("");
      setContent("");
      setFeaturedImage("");
      setSeoTitle("");
      setSeoDescription("");
      setStatus("draft");
    } catch (error) {
      console.error(error);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 text-3xl font-bold">New Post</h1>

      <div className="space-y-6">
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);

            if (!slug) {
              setSlug(generateSlug(e.target.value));
            }
          }}
          placeholder="Post Title"
          className="w-full rounded-lg border p-4"
        />

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          className="w-full rounded-lg border p-4"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
          className="h-28 w-full rounded-lg border p-4"
        />

        <div>
          <label className="mb-2 block font-semibold">Featured Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageUpload}
          />

          {uploadingImage && (
            <p className="mt-2 text-emerald-600">Uploading image...</p>
          )}

          {featuredImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt=""
                className="mt-4 h-48 rounded-lg object-cover"
              />

              <input
                value={featuredImage}
                readOnly
                className="mt-4 w-full rounded-lg border bg-slate-100 p-3"
              />
            </>
          )}
        </div>

        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="SEO Title"
          className="w-full rounded-lg border p-4"
        />

        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="SEO Description"
          className="h-24 w-full rounded-lg border p-4"
        />

        <BlogEditor value={content} onChange={setContent} />

        <div>
          <label className="mb-2 block font-semibold">Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-4"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSavePost}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          {saving ? "Saving..." : "Save Post"}
        </button>
      </div>
    </div>
  );
}
