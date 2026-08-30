import Breadcrumb from "@/components/Breadcrumb";
import { supabase } from "@/lib/supabaseClientClient";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const storeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";

  return {
    title: `${storeName} Coupons`,
    description: `Latest ${storeName} promo codes and discounts`,
  };
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams?.slug || "";
  const storeName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "";

  // Xử lý phân trang (mỗi trang hiển thị 6 coupon)
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const pageSize = 6;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;

  // Lấy thông tin store từ bảng stores
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .ilike("name", storeName)
    .single();

  // Lấy tổng số lượng coupon để tính số trang
  const { count: totalCoupons } = await supabase
    .from("coupons")
    .select("*", { count: "exact", head: true })
    .ilike("store_name", storeName);

  // Lấy danh sách coupons phân trang theo trang hiện tại
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .ilike("store_name", storeName)
    .range(startIndex, endIndex);

  const activeCoupons = totalCoupons || 0;

  const bestDiscount =
    coupons?.reduce((max, coupon) => {
      const value = Number(coupon.discount) || 0;
      return value > max ? value : max;
    }, 0) || 0;

  const totalPages = Math.ceil(activeCoupons / pageSize);

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Stores", href: "/stores" },
          { label: storeName, href: "#" },
        ]}
      />

      {/* Phần hiển thị Logo và thông tin Store */}
      <div className="flex items-center gap-4 mb-6 mt-4">
        {store?.logo_url && (
          <img
            src={store.logo_url}
            alt={store.name || storeName}
            className="w-20 h-20 object-contain"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold">{storeName} Coupons</h1>
          {store?.description && (
            <p className="text-gray-600 mt-1">{store.description}</p>
          )}
        </div>
      </div>

      {/* 3 ô thống kê */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Active Coupons</div>
          <div className="text-2xl font-bold">{activeCoupons}</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Best Discount</div>
          <div className="text-2xl font-bold">{bestDiscount}%</div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500">Updated</div>
          <div className="text-2xl font-bold">Today</div>
        </div>
      </div>

      {/* Danh sách Coupons */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {coupons?.map((coupon) => (
          <div
            key={coupon.id}
            className="border rounded-xl p-5 hover:shadow-lg"
          >
            <h2 className="font-semibold text-lg">{coupon.title}</h2>
            <div className="mt-3 inline-block bg-green-100 text-green-700 px-3 py-1 rounded">
              {coupon.code}
            </div>
          </div>
        ))}
      </div>

      {/* Thanh chuyển trang (Pagination Links) */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === currentPage;

            return (
              <Link
                key={pageNum}
                href={`/stores/${slug}?page=${pageNum}`}
                className={`px-4 py-2 border rounded-lg ${
                  isActive
                    ? "bg-black text-white font-bold"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
