// Lấy các coupon Active và tạm thời bỏ lọc ngày tháng để test
const { data: coupons, error } = await supabase
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
  .eq("status", "Active")
  // .or(`expires_at.is.null,expires_at.gte.${today}`)  <-- Tạm thời thêm 2 dấu xuyệt (//) để ẩn dòng này đi
  .order("click_count", {
    ascending: false,
    nullsFirst: false,
  })
  .limit(10);
