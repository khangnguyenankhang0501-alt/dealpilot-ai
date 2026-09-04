import Link from "next/link";

export default function AdminBlogPage() {
  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>

        <Link
          href="/admin/blog/new"
          className="rounded bg-emerald-600 px-4 py-2 text-white"
        >
          New Post
        </Link>
      </div>
    </main>
  );
}
