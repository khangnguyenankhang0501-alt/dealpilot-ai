import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { revalidatePath } from "next/cache";

// Server action để xử lý xóa coupon
async function deleteCoupon(formData: FormData) {
  "use server";

  const id = formData.get("id");

  if (!id) return;

  await supabase.from("coupons").delete().eq("id", id);

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("id", { ascending: false });

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage coupons and publish blog articles from one place.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/stats"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-200"
          >
            📊 View Stats
          </Link>

          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
          >
            📥 Import CSV
          </Link>

          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-400"
          >
            ✍️ Write New Post
          </Link>

          <Link
            href="/admin/new"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            + Add New Coupon
          </Link>
        </div>
      </div>

      {/* BLOG SECTION */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Blog Posts</h2>

            <p className="mt-1 text-sm text-slate-500">
              Write, publish, and manage your DealPilot articles.
            </p>
          </div>

          <Link
            href="/admin/blog/new"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-black text-white transition hover:bg-emerald-400"
          >
            + Write Article
          </Link>
        </div>

        {posts && posts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-slate-900">
                    {post.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    /blog/{post.slug}
                  </p>

                  {post.created_at && (
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <Link
                  href={"/blog/" + post.slug}
                  target="_blank"
                  className="shrink-0 text-sm font-bold text-emerald-600 hover:underline"
                >
                  View Article →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-3xl">📝</div>

            <p className="mt-3 font-bold text-slate-900">No blog posts yet</p>

            <p className="mt-1 text-sm text-slate-500">
              Start writing your first article.
            </p>

            <Link
              href="/admin/blog/new"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-black text-white transition hover:bg-emerald-400"
            >
              Write First Article
            </Link>
          </div>
        )}
      </section>

      {/* COUPONS */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-900">Coupons</h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your current coupon database.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full [min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-4 font-bold text-slate-700">Title</th>

                  <th className="p-4 font-bold text-slate-700">Store</th>

                  <th className="p-4 font-bold text-slate-700">Code</th>

                  <th className="p-4 text-center font-bold text-slate-700">
                    Clicks
                  </th>

                  <th className="p-4 text-right font-bold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {coupons && coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="p-4 font-medium text-slate-900">
                        {coupon.title}
                      </td>

                      <td className="p-4 text-slate-600">
                        {coupon.store_name || "N/A"}
                      </td>

                      <td className="p-4">
                        <span className="rounded bg-emerald-100 px-2 py-1 font-mono text-sm text-emerald-700">
                          {coupon.code || "N/A"}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-blue-600">
                        {coupon.clicks || 0}
                      </td>

                      <td className="space-x-3 p-4 text-right">
                        <Link
                          href={"/admin/edit/" + coupon.id}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <form action={deleteCoupon} className="inline-block">
                          <input type="hidden" name="id" value={coupon.id} />

                          <button
                            type="submit"
                            className="cursor-pointer font-bold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-sm text-slate-500"
                    >
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
