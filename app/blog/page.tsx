import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", {
      ascending: false,
    });

  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="mb-8 text-4xl font-bold">Blog</h1>

      <div className="space-y-6">
        {posts?.map((post) => (
          <article key={post.id} className="rounded-xl border p-6">
            <h2 className="mb-2 text-2xl font-bold">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>

            <p className="text-slate-600">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
