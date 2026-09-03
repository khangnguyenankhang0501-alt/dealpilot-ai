import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("========== METADATA ==========");
  console.log("SLUG:", slug);
  console.log("POST:", post);
  console.log("ERROR:", error);
  console.log("==============================");

  console.log("META SLUG:", slug);
  console.log("META POST:", post);
  console.log("META ERROR:", error);

  console.log("BLOG SLUG:", slug);
  console.log("BLOG POST:", post);
  console.log("BLOG ERROR:", error);

  if (!post) {
    return {
      title: "Article Not Found | DealPilot",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("=========== PAGE ===========");
  console.log("SLUG:", slug);
  console.log("POST:", post);
  console.log("ERROR:", error);
  console.log("============================");

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/blog"
        className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 sm:text-sm"
      >
        ← Back to Blog
      </Link>

      <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
              Blog
            </span>

            <span className="text-xs font-semibold text-slate-400">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-slate mt-8 max-w-none border-t border-slate-100 pt-8 sm:mt-10 sm:pt-10"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />
        </div>
      </article>

      <section className="mt-8 overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 className="text-2xl font-black tracking-tight text-white">
          Ready to save more?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
          Browse coupons, promo codes, and deals available on DealPilot.
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/coupons"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-5 text-sm font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.20)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Browse Coupons →
          </Link>

          <Link
            href="/blog"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-700 px-5 text-sm font-bold text-white transition hover:border-slate-500 hover:bg-slate-800"
          >
            More Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
