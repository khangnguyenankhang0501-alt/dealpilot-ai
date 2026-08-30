import { supabase } from "@/lib/supabaseClientClient";
import { revalidatePath } from "next/cache";
import Link from "next/link";

// Server action xử lý upload và parse file CSV
async function handleImport(formData: FormData) {
  "use server";
  const file = formData.get("file") as File;
  if (!file) return;

  const text = await file.text();
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  // Bỏ qua dòng tiêu đề (header)
  const rows = lines.slice(1);

  const couponsToInsert = rows.map((row) => {
    // Xử lý tách chuỗi cơ bản từ file CSV
    const [title, store_name, coupon_code, affiliate_url, expires_at] =
      row.split(",");

    // Tự động tạo slug đơn giản từ title
    const slug = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : "coupon-" + Date.now();

    return {
      title: title?.trim(),
      store_name: store_name?.trim(),
      coupon_code: coupon_code?.trim(),
      affiliate_url: affiliate_url?.trim(),
      expires_at: expires_at?.trim(),
      slug: slug,
    };
  });

  if (couponsToInsert.length > 0) {
    await supabase.from("coupons").insert(couponsToInsert);
    revalidatePath("/admin");
  }
}

export default function AdminImportPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Import Coupons (CSV)</h1>
        <Link
          href="/admin"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="border rounded-xl p-6 shadow-sm bg-white">
        <p className="text-gray-600 mb-4">
          Tải lên file CSV chứa danh sách coupon theo định dạng chuẩn để import
          hàng loạt vào hệ thống.
        </p>

        <form action={handleImport} className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Chọn file CSV:</label>
            <input
              type="file"
              name="file"
              accept=".csv"
              required
              className="block w-full border border-gray-300 rounded-lg p-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Upload and Import
          </button>
        </form>

        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-2 text-sm text-gray-700">
            Định dạng mẫu file CSV:
          </h3>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-800 font-mono">
            {`title,store_name,coupon_code,affiliate_url,expires_at
Amazon 50% Off,Amazon,SAVE50,https://...,2026-12-31
Nike Sale,Nike,NIKE25,https://...,2026-12-31`}
          </pre>
        </div>
      </div>
    </main>
  );
}
