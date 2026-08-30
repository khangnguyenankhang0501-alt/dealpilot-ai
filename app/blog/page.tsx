import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Money Saving Blog, Deals & Shopping Guides | DealPilot",
  description:
    "Read our latest shopping guides, best promo code roundups, and tips to save money at top brands.",
};

export const revalidate = 0;

export default async function BlogPage() {
  // Lấy danh sách bài viết từ bảng "posts" hoặc "blogs"
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-3">
        Shopping Guides & Savings Blog
      </h1>
      <p className="text-gray-600 text-lg mb-10">
        Discover top deals, shopping tips, and verified promo codes to help you
        save more.
      </p>

      {!posts || posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border rounded-2xl bg-gray-50">
          No blog posts found yet. Check back soon!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col justify-between bg-white"
            >
              <div className="p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {post.category || "Savings Guide"}
                </span>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold mt-4 mb-3 hover:text-blue-600 transition leading-snug">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {post.excerpt || post.content?.slice(0, 120) + "..."}
                </p>
              </div>

              <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-gray-100 mt-auto">
                <span className="text-xs text-gray-400">
                  {post.created_at
                    ? new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Read Article &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
