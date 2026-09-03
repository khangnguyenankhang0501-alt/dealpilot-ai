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

async function createPost(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const storeSlug = String(formData.get("store_slug") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!content) {
    throw new Error("Content is required.");
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
            Create and publish a new DealPilot article.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          ← Back to Admin
        </Link>
      </div>

      {/* FORM */}

      <form action={createPost} className="space-y-6">
        {/* BASIC INFORMATION */}

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
                placeholder="best-nike-promo-codes-september-2026"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Leave blank to generate the slug automatically from the title.
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
                placeholder="Discover the best Nike promo codes, discounts, and money-saving tips available this month."
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
                  Example: Nike, Walmart, Target.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900">
              Article Content
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Write the article using HTML headings, paragraphs, links, and
              lists.
            </p>
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Content *
            </label>

            <textarea
              id="content"
              name="content"
              required
              rows={24}
              placeholder={`<h2>Best Nike Promo Codes for September 2026</h2>

<p>Looking for ways to save money on Nike products? Check these offers before checkout.</p>

<h3>How to Save at Nike</h3>

<ul>
  <li>Check available Nike promo codes.</li>
  <li>Look for seasonal discounts.</li>
  <li>Compare offers before checkout.</li>
</ul>

<h3>More Nike Deals</h3>

<p>
  Browse the latest
  <a href="/stores/Nike">Nike coupons and deals</a>
  on DealPilot.
</p>`}
              className="min-h-130 w-full rounded-xl border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              HTML is supported because the blog detail page currently renders
              the post content as HTML.
            </p>
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
                Clicking Publish will save this article directly to the
                <strong> posts </strong>
                table and make it available on the DealPilot blog.
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
