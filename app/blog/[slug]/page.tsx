import Image from "next/image";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://dealpilot-ai-iota.vercel.app";

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      title,
      slug,
      excerpt,
      seo_title,
      seo_description,
      featured_image,
      created_at
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!post) {
    return {
      title: "Article Not Found | DealPilot",
      description: "The requested article could not be found.",
    };
  }

  const title = post.seo_title?.trim() || post.title;

  const description = post.seo_description?.trim() || post.excerpt || "";

  return {
    title,
    description,

    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },

    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_US",
      publishedTime: post.created_at,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: "DealPilot",

      ...(post.featured_image
        ? {
            images: [
              {
                url: post.featured_image,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(post.featured_image
        ? {
            images: [post.featured_image],
          }
        : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Blog fetch error:", error);
  }

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: post.title,

    description: post.excerpt || "",

    datePublished: post.created_at,

    dateModified: post.updated_at || post.created_at,

    author: {
      "@type": "Organization",
      name: "DealPilot",
    },

    publisher: {
      "@type": "Organization",
      name: "DealPilot",
    },

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },

    ...(post.featured_image
      ? {
          image: [post.featured_image],
        }
      : {}),
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

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

          {post.featured_image && (
            <div className="relative mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <Image
                src={post.featured_image}
                alt={post.title}
                width={1200}
                height={630}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
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
