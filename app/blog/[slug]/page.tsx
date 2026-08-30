import { supabase } from "@/lib/supabaseClientClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Dynamic SEO Metadata cho bài viết
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!post) {
    return { title: "Post Not Found | DealPilot" };
  }

  return {
    title: `${post.title} | DealPilot Blog`,
    description:
      post.excerpt || `Read full guide about ${post.title} on DealPilot.`,
  };
}

export const revalidate = 0;

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;

  // Lấy nội dung chi tiết bài viết từ DB
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/blog"
        className="text-sm text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Back to Blog
      </Link>

      <article className="bg-white border rounded-2xl p-8 md:p-12 shadow-sm">
        <header className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {post.category || "Savings Guide"}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold mt-4 mb-4 leading-tight">
            {post.title}
          </h1>
          <p className="text-gray-400 text-sm">
            Published on{" "}
            {new Date(post.created_at || Date.now()).toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" },
            )}
          </p>
        </header>

        {/* Thân bài viết */}
        <div
          className="prose max-w-none text-gray-800 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}
