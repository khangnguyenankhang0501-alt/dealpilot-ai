import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "DealPilot Blog | Coupons, Deals & Saving Tips",
  description:
    "Read the latest shopping tips, coupon guides, money-saving ideas, and deal recommendations on DealPilot.",
};

export default async function BlogPage() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error(error);
  }

  const BLOG_POSTS = posts ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* HEADER */}

      <section className="mb-8 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl shadow-sm">
            📝
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              DealPilot Blog
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Coupon guides, shopping tips, saving ideas, and the latest deals.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED ARTICLE */}

      {BLOG_POSTS.length > 0 && (
        <section className="mb-10">
          <Link
            href={`/blog/${BLOG_POSTS[0].slug}`}
            className="
              group
              grid
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              bg-white
              shadow-[0_8px_30px_rgba(15,23,42,0.05)]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:border-emerald-200
              hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]
              md:grid-cols-2
            "
          >
            <div className="flex min-h-[260px] items-center justify-center bg-slate-100">
              <span className="text-7xl">📝</span>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
                Blog
              </span>

              <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-emerald-600 sm:text-3xl">
                {BLOG_POSTS[0].title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {BLOG_POSTS[0].excerpt}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(BLOG_POSTS[0].created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </span>

                <span className="text-sm font-black text-emerald-600">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* LATEST ARTICLES */}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Latest Articles
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Helpful guides to find better deals and save more money.
          </p>
        </div>

        {BLOG_POSTS.length <= 1 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
            <div className="text-4xl">📝</div>

            <h3 className="mt-4 text-lg font-black text-slate-900">
              More articles coming soon
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Check back soon for more shopping guides and saving tips.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.slice(1).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="
                  group
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_6px_24px_rgba(15,23,42,0.04)]
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]
                "
              >
                <div className="flex aspect-[16/9] items-center justify-center bg-slate-100">
                  <span className="text-5xl">📝</span>
                </div>

                <div className="p-5">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
                    Blog
                  </span>

                  <h3 className="mt-3 line-clamp-2 text-lg font-black leading-6 text-slate-900 transition-colors group-hover:text-emerald-600">
                    {post.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                    {post.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>

                    <span className="text-xs font-black text-emerald-600">
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}

      <section className="mt-10 overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-center sm:px-10 sm:py-10">
        <h2 className="text-2xl font-black tracking-tight text-white">
          Looking for the best deals?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
          Browse thousands of coupons, promo codes, and discounts available on
          DealPilot.
        </p>

        <Link
          href="/coupons"
          className="
            mt-5
            inline-flex
            h-11
            items-center
            justify-center
            rounded-xl
            bg-emerald-500
            px-5
            text-sm
            font-black
            text-white
            shadow-[0_8px_20px_rgba(16,185,129,0.20)]
            transition
            hover:-translate-y-0.5
            hover:bg-emerald-400
          "
        >
          Browse Coupons →
        </Link>
      </section>
    </main>
  );
}
