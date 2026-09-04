import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import DeletePostButton from "@/components/blog/DeletePostButton";

export default async function AdminBlogPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>

        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-emerald-600 px-5 py-3 text-white"
        >
          New Post
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Title</th>

              <th className="p-4 text-left">Slug</th>

              <th className="p-4 text-left">Date</th>

              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts?.map((post) => (
              <tr key={post.id} className="border-t">
                <td className="p-4">{post.title}</td>

                <td className="p-4">{post.slug}</td>

                <td className="p-4">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="rounded bg-blue-600 px-3 py-2 text-white"
                    >
                      Edit
                    </Link>

                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="rounded bg-slate-700 px-3 py-2 text-white"
                    >
                      View
                    </Link>

                    <DeletePostButton id={post.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
