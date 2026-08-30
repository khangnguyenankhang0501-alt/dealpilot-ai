import { supabase } from "@/lib/supabase";

// Vô hiệu hóa cache để dữ liệu luôn được cập nhật mới nhất
export const revalidate = 0;

export default async function AdminStatsPage() {
  // 1. Tính mốc thời gian 30 ngày trước
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 2. Lấy Tổng số click (Total Clicks)
  const { count: totalClicks } = await supabase
    .from("clicks")
    .select("*", { count: "exact", head: true });

  // 3. Lấy số click trong 30 ngày qua (Last 30 Days)
  const { count: last30DaysClicks } = await supabase
    .from("clicks")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo.toISOString());

  // 4. Lấy dữ liệu click kèm theo thông tin mã giảm giá để thống kê Top
  const { data: clicksData } = await supabase.from("clicks").select(`
      coupon_id,
      coupons (
        title,
        store_name
      )
    `);

  // Xử lý logic gộp dữ liệu đếm số click cho từng Coupon và Store
  const couponStats: Record<string, { title: string; clicks: number }> = {};
  const storeStats: Record<string, { storeName: string; clicks: number }> = {};

  if (clicksData) {
    clicksData.forEach((click: any) => {
      const couponId = click.coupon_id;
      const couponTitle = click.coupons?.title || "Unknown Coupon";
      const storeName = click.coupons?.store_name || "Unknown Store";

      // Đếm cho Top Coupons
      if (couponId) {
        if (!couponStats[couponId]) {
          couponStats[couponId] = { title: couponTitle, clicks: 0 };
        }
        couponStats[couponId].clicks += 1;
      }

      // Đếm cho Top Stores
      if (storeName && storeName !== "Unknown Store") {
        if (!storeStats[storeName]) {
          storeStats[storeName] = { storeName: storeName, clicks: 0 };
        }
        storeStats[storeName].clicks += 1;
      }
    });
  }

  // Sắp xếp giảm dần và lấy Top 5
  const topCoupons = Object.values(couponStats)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const topStores = Object.values(storeStats)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Statistics</h1>

      {/* Thẻ Overview: Total Clicks & Last 30 Days */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-gray-500 font-medium mb-2 text-lg">
            Total Clicks
          </h3>
          <p className="text-5xl font-bold text-black">{totalClicks || 0}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-gray-500 font-medium mb-2 text-lg">
            Last 30 Days
          </h3>
          <p className="text-5xl font-bold text-black">
            {last30DaysClicks || 0}
          </p>
        </div>
      </div>

      {/* Bảng Top Coupons & Top Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Coupons */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Top Coupons</h2>
          <ul className="space-y-4">
            {topCoupons.map((item, index) => (
              <li key={index} className="flex justify-between items-start">
                <span className="text-gray-800 font-medium pr-4">
                  {index + 1}. {item.title}
                </span>
                <span className="font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm whitespace-nowrap">
                  {item.clicks} clicks
                </span>
              </li>
            ))}
            {topCoupons.length === 0 && (
              <p className="text-gray-500 italic">Chưa có dữ liệu</p>
            )}
          </ul>
        </div>

        {/* Top Stores */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b pb-2">Top Stores</h2>
          <ul className="space-y-4">
            {topStores.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="text-gray-800 font-medium pr-4">
                  {index + 1}. {item.storeName}
                </span>
                <span className="font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm whitespace-nowrap">
                  {item.clicks} clicks
                </span>
              </li>
            ))}
            {topStores.length === 0 && (
              <p className="text-gray-500 italic">Chưa có dữ liệu</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
