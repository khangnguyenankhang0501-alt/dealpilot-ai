import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";
import BlogEditorForm from "./BlogEditorForm";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(text: string) {
  const lines = text.split(/\r?\n/);

  const html: string[] = [];
  let listItems: string[] = [];

  function closeList() {
    if (listItems.length === 0) {
      return;
    }

    html.push("<ul>");

    for (const item of listItems) {
      html.push(item);
    }

    html.push("</ul>");

    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();

      html.push(
        "<h3>" +
          escapeHtml(line.substring(4)) +
          "</h3>",
      );

      continue;
    }

    if (line.startsWith("## ")) {
      closeList();

      html.push(
        "<h2>" +
          escapeHtml(line.substring(3)) +
          "</h2>",
      );

      continue;
    }

    if (line.startsWith("# ")) {
      closeList();

      html.push(
        "<h2>" +
          escapeHtml(line.substring(2)) +
          "</h2>",
      );

      continue;
    }

    if (
      line.startsWith("- ") ||
      line.startsWith("* ")
    ) {
      listItems.push(
        "<li>" +
          escapeHtml(line.substring(2)) +
          "</li>",
      );

      continue;
    }

    closeList();

    html.push(
      "<p>" +
        escapeHtml(line) +
        "</p>",
    );
  }

  closeList();

  return html.join("\n");
}

async function createPost(formData: FormData) {
  "use server";

  const title = String(
    formData.get("title") || "",
  ).trim();

  const slugInput = String(
    formData.get("slug") || "",
  ).trim();

  const excerpt = String(
    formData.get("excerpt") || "",
  ).trim();

  const category = String(
    formData.get("category") || "",
  ).trim();

  const storeSlug = String(
    formData.get("store_slug") || "",
  ).trim();

  const contentText = String(
    formData.get("content") || "",
  ).trim();

  const image = formData.get("image");

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!contentText) {
    throw new Error(
      "Article content is required.",
    );
  }

  const slug = slugify(
    slugInput || title,
  );

  if (!slug) {
    throw new Error(
      "A valid slug could not be created.",
    );
  }

  const {
    data: existingPost,
    error: existingPostError,
  } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingPostError) {
    console.error(
      "Error checking post:",
      existingPostError,
    );

    throw new Error(
      "Could not check the existing article.",
    );
  }

  if (existingPost) {
    throw new Error(
      "This slug already exists. Please choose another slug.",
    );
  }

  let imageUrl: string | null = null;

  if (
    image instanceof File &&
    image.size > 0
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(image.type)) {
      throw new Error(
        "Only JPG, PNG, WEBP, and GIF images are allowed.",
      );
    }

    const maxSize =
      5 * 1024 * 1024;

    if (image.size > maxSize) {
      throw new Error(
        "Image is too large. Maximum size is 5MB.",
      );
    }

    const parts = image.name.split(".");

    const extension =
      parts.length > 1
        ? parts[parts.length - 1].toLowerCase()
        : "jpg";

    const fileName =
      slug +
      "-" +
      Date.now() +
      "." +
      extension;

    const filePath =
      "posts/" + fileName;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("blog-images")
      .upload(
        filePath,
        image,
        {
          contentType: image.type,
          upsert: false,
        },
      );

    if (uploadError) {
      console.error(
        "Image upload error:",
        uploadError,
      );

      throw new Error(
        "Could not upload the image: " +
          uploadError.message,
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    imageUrl =
      publicUrlData.publicUrl;
  }

  const content =
    textToHtml(contentText);

  const {
    data: newPost,
    error: insertError,
  } = await supabase
    .from("posts")
    .insert({
      title: title,
      slug: slug,
      content: content,
      excerpt: excerpt || null,
      category: category || null,
      store_slug: storeSlug || null,
      image_url: imageUrl,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    console.error(
      "Error creating blog post:",
      insertError,
    );

    throw new Error(
      "Could not publish the article: " +
        insertError.message,
    );
  }

  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath(
    "/blog/" + newPost.slug,
  );

  redirect(
    "/blog/" + newPost.slug,
  );
}

export default function NewBlogPostPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-emerald-600">
            Admin / Blog
          </div>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Write New Post
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Write normally, import from Word, add an image, and publish
            directly to DealPilot.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          ← Back to Admin
        </Link>
      </div>

      <BlogEditorForm action={createPost} />
    </main>
  );
}