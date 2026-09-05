"use client";

import { useState } from "react";
import BlogEditor from "./BlogEditor";
import DeletePostButton from "./DeletePostButton";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  post: any;
};

export default function EditBlogForm({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");

  const [featuredImage, setFeaturedImage] = useState(
    post?.featured_image ?? "",
  );

  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");

  const [seoDescription, setSeoDescription] = useState(
    post?.seo_description ?? "",
  );

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  async function handleUpdatePost() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("posts")
        .update({
          title,
          slug,
          excerpt,
          content,
          featured_image: featuredImage,
          seo_title: seoTitle,
          seo_description: seoDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id);

      if (error) throw error;

      alert("Post updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update post");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Edit Post</h1>

      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-3"
          placeholder="Title"
        />

        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded border p-3"
          placeholder="Slug"
        />

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="h-24 w-full rounded border p-3"
          placeholder="Excerpt"
        />

        <div>
          <label className="mb-2 block font-semibold">Featured Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageUpload}
          />

          {featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredImage}
              alt=""
              className="mt-4 h-40 rounded-lg object-cover"
            />
          )}
        </div>

        <input
          value={seoTitle}
          onChange={(e) => setSeoTitle(e.target.value)}
          className="w-full rounded border p-3"
          placeholder="SEO Title"
        />

        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          className="h-24 w-full rounded border p-3"
          placeholder="SEO Description"
        />

        {uploadingImage && (
          <p className="text-emerald-600">Uploading image...</p>
        )}

        <BlogEditor value={content} onChange={setContent} />

        <div className="flex gap-3">
          <button
            onClick={handleUpdatePost}
            disabled={saving}
            className="rounded bg-emerald-600 px-6 py-3 font-semibold text-white"
          >
            {saving ? "Updating..." : "Update Post"}
          </button>

          <DeletePostButton id={post.id} />
        </div>
      </div>
    </div>
  );
}
