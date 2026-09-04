"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BlogEditor from "@/components/blog/BlogEditor";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditBlogPage({ params }: Props) {
  const [postId, setPostId] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPost() {
      const { id } = await params;

      setPostId(id);

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) return;

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setExcerpt(data.excerpt || "");

      setSeoTitle(data.seo_title || "");
      setSeoDescription(data.seo_description || "");

      setContent(data.content || "");

      setLoading(false);
    }

    loadPost();
  }, [params]);

  async function handleSave() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("posts")
        .update({
          title,
          slug,
          excerpt,
          content,
          seo_title: seoTitle,
          seo_description: seoDescription,
        })
        .eq("id", postId);

      if (error) throw error;

      alert("Post updated successfully");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-8">Loading...</main>;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Blog Post</h1>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border p-3"
        />

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="Slug"
          className="w-full rounded-lg border p-3"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
          className="h-24 w-full rounded-lg border p-3"
        />

        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          placeholder="SEO Title"
          className="w-full rounded-lg border p-3"
        />

        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          placeholder="SEO Description"
          className="h-24 w-full rounded-lg border p-3"
        />

        <BlogEditor value={content} onChange={setContent} />

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </main>
  );
}
