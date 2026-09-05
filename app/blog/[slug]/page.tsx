import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      {post.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featured_image}
          alt={post.title}
          className="mb-8 w-full rounded-2xl"
        />
      )}

      <h1 className="mb-4 text-5xl font-bold">{post.title}</h1>

      <div className="mb-6 text-sm text-slate-500">
        Published:{" "}
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString()
          : ""}
      </div>

      {post.excerpt && (
        <div className="mb-8 rounded-xl bg-slate-100 p-6 text-lg">
          {post.excerpt}
        </div>
      )}

      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: post.content,
        }}
      />
    </main>
  );
}
