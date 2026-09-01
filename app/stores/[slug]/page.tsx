import Breadcrumb from "@/components/Breadcrumb";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import CouponCard from "@/components/CouponCard";

interface StorePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: StorePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const storeName = slug.charAt(0).toUpperCase() + slug.slice(1);

  return {
    title: `${storeName} Coupons`,
    description: `Latest ${storeName} promo codes and discounts`,
  };
}

export default async function StorePage({
  params,
  searchParams,
}: StorePageProps) {
  const resolvedParams = await params;
  const resolvedSearchPues = await searchParams;

  const slug = resolvedParams.slug;
  const storeName = slug.charAt(0).toUpperCase() + slug.slice(1);

  // Xử lý phân trang (mỗi trang hiển thị 6 coupon)
  const currentPage = Number(resolvedSearchPues.page) || 1;
  const pageSize = 6;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;

  // Lấy ngày hiện tại theo chuẩn YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Lấy thông tin store từ bảng stores
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .ilike("name", storeName)
    .single();

  // Lấy tổng số lượng coupon (chỉ Active và chưa hết hạn)
  const { count: totalCoupons } = await supabase
    .from("coupons")
    .select("*", { count: "exact", head: true })
    .eq("store_id", store?.id)
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`);

  // Lấy danh sách coupon phân trang theo trang hiện tại (lọc Active và chưa hết hạn)
  const { data: coupons, error: couponsError } = await supabase
    .from("coupons")
    .select(
      `
      *,
stores!store_id (
  id,
  name,
  slug,
  logo_url
)
    `,
    )
    .eq("store_id", store?.id)
    .eq("status", "Active")
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .range(startIndex, endIndex);

  const activeCoupons = totalCoupons || 0;

  const bestDiscount =
    coupons?.reduce((max, coupon) => {
      const value = Number(coupon.discount_value) || 0;
      return value > max ? value : max;
    }, 0) || 0;

  const totalPages = Math.ceil(activeCoupons / pageSize);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Stores", href: "/stores" },
          { label: storeName, href: "#" },
        ]}
      />

      {/* Phần hiển thị Logo và thông tin Store */}
      <div className="flex items-center gap-4 mb-8 mt-4">
        {store?.logo_url && (
          <div className="relative h-20 w-20 overflow-hidden rounded-xl border bg-white p-2">
            <img
              src={store.logo_url}
              alt={store.name || storeName}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold">
            {store?.name || storeName} Coupons
          </h1>
          {store?.description && (
            <p className="text-gray-600 mt-1">{store.description}</p>
          )}
        </div>
      </div>

      {/* Thống kê */}
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
          <div className="text-2xl font-bold">{today}</div>
        </div>
      </div>

      {/* Danh sách Coupons đã được thay bằng component CouponCard gọn gàng */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {coupons?.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <Link
                key={page}
                href={`/stores/${slug}?page=${page}`}
                className={`px-4 py-2 border rounded transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {page}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
