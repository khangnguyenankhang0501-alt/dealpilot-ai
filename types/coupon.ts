export type CouponStore = {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  logo_url?: string | null;
};

export type Coupon = {
  /**
   * Stable coupon identifier.
   */
  id: string;

  /** Basic coupon information */
  title?: string | null;
  slug?: string | null;

  /** Store information */
  store_name?: string | null;
  store_id?: string | null;

  /** Classification */
  category?: string | null;
  country?: string | null;

  /** Coupon / affiliate */
  coupon_code?: string | null;
  affiliate_url?: string | null;

  /** Product / deal image */
  image_url?: string | null;

  /** Discount */
  discount_type?: string | null;
  discount_value?: number | string | null;

  /** Pricing */
  original_price?: number | string | null;
  sale_price?: number | string | null;

  /** Availability */
  status?: string | null;
  expires_at?: string | null;

  /** Trust / social proof */
  verified?: boolean | null;
  rating?: number | string | null;
  review_count?: number | string | null;
  popularity_count?: number | string | null;
  click_count?: number | string | null;

  /** Presentation */
  badge?: string | null;
  is_exclusive?: boolean | null;

  /** Additional deal metadata */
  shipping_text?: string | null;
  sold_text?: string | null;

  /** Timestamps */
  created_at?: string | null;
  updated_at?: string | null;

  /**
   * Supabase nested relation.
   *
   * Different queries in the app return this relation in slightly
   * different shapes, so keep the relation flexible at this boundary.
   */
  stores?: CouponStore | CouponStore[] | null;
};
