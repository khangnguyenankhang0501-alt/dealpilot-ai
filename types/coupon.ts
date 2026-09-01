export type CouponStore = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
};

export type Coupon = {
  id: string;

  title: string;
  slug: string | null;

  store_name: string | null;

  coupon_code: string | null;
  affiliate_url: string | null;

  image_url: string | null;

  discount_type: string | null;
  discount_value: number | null;

  original_price: number | null;
  sale_price: number | null;

  verified: boolean | null;
  is_exclusive: boolean | null;

  badge: string | null;

  rating: number | null;
  review_count: number | null;
  popularity_count: number | null;

  shipping_text: string | null;
  sold_text: string | null;

  expires_at: string | null;

  stores?: CouponStore | null;
};
