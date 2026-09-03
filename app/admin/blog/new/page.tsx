import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabaseClient";

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

  const closeList = () => {
    if (listItems.length > 0) {
      html.push("<ul>");
      html.push(...listItems);
      html.push("</ul>");
      listItems = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    if (line.startsWith("### ")) {
      closeList();
      html.push("<h3>" + escapeHtml(line.slice(4)) + "</h3>");
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push("<h2>" + escapeHtml(line.slice(3)) + "</h2>");
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      html.push("<h2>" + escapeHtml(line.slice(2)) + "</h2>");
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push("<li>" + escapeHtml(line.slice(2)) + "</li>");
      continue;
    }

    closeList();

    const escaped = escapeHtml(line);

    const linked = escaped.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    html.push("<p>" + linked + "</p>");
  }

  closeList();

  return html.join("\n");
}

async function createPost(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const storeSlug = String(formData.get("store_slug") || "").trim();
  const contentText = String(formData.get("content") || "").trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!contentText) {
    throw new Error("Article content is required.");
  }

  const slug = slugify(slugInput || title);

  if (!slug) {
    throw new Error("A valid slug could not be created.");
  }

  const { data: existingPost, error: existingPostError } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existingPostError) {
    console.error("Error checking existing post:", existingPostError);

    throw new Error("Could not check whether this slug already exists.");
  }

  if (existingPost) {
    throw new Error(
      "This slug already exists. Please choose a different slug.",
    );
  }

  const content = textToHtml(contentText);

  const { data: newPost, error: insertError } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      category: category || null,
      store_slug: storeSlug || null,
    })
    .select("id, slug")
    .single();

  if (insertError) {
    console.error("Error creating blog post:", insertError);

    throw new Error("Could not publish the article: " + insertError.message);
  }

  revalidatePath("/blog");
  revalidatePath("/admin");
  revalidatePath("/blog/" + newPost.slug);

  redirect("/blog/" + newPost.slug);
}

export default async function NewBlogPostPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-emerald-600">Admin / Blog</div>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
            Write New Post
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Write your article normally and publish it directly to DealPilot.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          ← Back to Admin
        </Link>
      </div>

      <form action={createPost} className="space-y-6">
        {/* ARTICLE INFORMATION */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Article Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the basic information for your article.
            </p>
          </div>

          <div className="grid gap-5">
            {/* TITLE */}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Best Nike Promo Codes September 2026"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* SLUG */}

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                placeholder="Leave blank to generate automatically"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Example: best-nike-promo-codes-september-2026
              </p>
            </div>

            {/* EXCERPT */}

            <div>
              <label
                htmlFor="excerpt"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Excerpt
              </label>

              <textarea
                id="excerpt"
                name="excerpt"
                rows={4}
                placeholder="Write a short summary of the article..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            {/* CATEGORY + STORE */}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Category
                </label>

                <input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="Coupons"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="store_slug"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Store Slug
                </label>

                <input
                  id="store_slug"
                  name="store_slug"
                  type="text"
                  placeholder="Nike"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Example: Nike, Walmart, Target
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ARTICLE CONTENT */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Article Content
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Just write your article normally. You do not need to write HTML or
              code.
            </p>
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Article *
            </label>

            <textarea
              id="content"
              name="content"
              required
              rows={24}
              placeholder={`Write your article here...

Best Nike Promo Codes for September 2026

Looking for ways to save money when shopping at Nike? Here are some useful tips and offers to check before checkout.

How to Save at Nike

- Check the latest Nike promo codes.
- Look for seasonal discounts.
- Compare current offers before buying.

More Nike Deals

Visit the Nike store page on DealPilot to find more available coupons and deals.`}
              className="min-h-130 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              <strong className="text-slate-700">Writing tips:</strong> Use
              blank lines between paragraphs. Start headings with
              <strong> # </strong>
              or
              <strong> ## </strong>. Start bullet points with
              <strong> - </strong>.
            </div>
          </div>
        </section>

        {/* PUBLISH */}

        <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Ready to publish?
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Click Publish to save the article to the DealPilot blog.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-6 text-sm font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.20)] transition hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              🚀 Publish Post
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
