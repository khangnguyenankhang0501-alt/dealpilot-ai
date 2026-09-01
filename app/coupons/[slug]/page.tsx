import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Metadata } from "next";
import GetCodeButton from "@/components/GetCodeButton";
import CouponCard from "@/components/CouponCard";
import FavoriteButton from "@/components/FavoriteButton";

type Props = {
  params: Promise<{ slug: string }>;
};

// Cấu hình SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return { title: "Coupon Not Found | DealPilot" };
  }

  return {
    title: `${coupon.title} | DealPilot`,
    description: `Get the best discount with ${coupon.title}. Save money today!`,
  };
}

export default async function CouponPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  // 1. Query dữ liệu coupon hiện tại
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return <div className="p-10 text-center">Coupon not found</div>;
  }

  // 2. Query dữ liệu related coupons (cùng store, khác id, tối đa 4)
  const { data: relatedCoupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_name", coupon.store_name)
    .neq("id", coupon.id)
    .limit(4);

  // 3. Chuẩn bị dữ liệu Structured Data (JSON-LD) - Chỉ giữ lại 3 schema ưu tiên
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://dealpilot.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Coupons",
        item: "https://dealpilot.com/coupons",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: coupon.store_name,
        item: `https://dealpilot.com/stores/${coupon.store_name
          .toLowerCase()
          .replace(/\s+/g, "-")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: coupon.title,
        item: `https://dealpilot.com/coupons/${coupon.slug}`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: coupon.title,
    url: `https://dealpilot.com/coupons/${coupon.slug}`,
    description: `${coupon.title} coupon and deal information.`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I use this coupon?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `Click GET CODE, copy the code, and enter it at checkout on ${coupon.store_name}.`,
        },
      },
      {
        "@type": "Question",
        name: "Is this coupon verified?",
        acceptedAnswer: {
          "@type": "Answer",
          text: coupon.verified
            ? "Yes. This coupon is marked as verified."
            : "This coupon has not been marked as verified.",
        },
      },
      {
        "@type": "Question",
        name: "When does this coupon expire?",
        acceptedAnswer: {
          "@type": "Answer",
          text: coupon.expires_at
            ? `This coupon expires on ${coupon.expires_at}.`
            : "An expiration date is not currently available.",
        },
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Chèn 3 Schema ưu tiên ngay đầu trong thẻ main */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* BREADCRUMB */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/coupons" className="hover:text-black">
          Coupons
        </Link>
        <span>/</span>
        <span className="text-gray-700">{coupon.store_name}</span>
        <span>/</span>
        <span className="text-gray-700">{coupon.title}</span>
      </div>

      {/* MAIN COUPON SECTION */}
      <section className="grid gap-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
        {/* LEFT: PRODUCT IMAGE */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          {coupon.image_url ? (
            <Image
              src={coupon.image_url}
              alt={coupon.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}

          {/* VERIFIED BADGE */}
          {coupon.verified && (
            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-sm font-bold text-gray-800 shadow">
              ✓ Verified
            </div>
          )}

          {/* FAVORITE BUTTON */}
          <FavoriteButton couponId={String(coupon.id)} />
        </div>

        {/* RIGHT: COUPON INFORMATION */}
        <div className="flex flex-col">
          {/* DISCOUNT */}
          {coupon.discount_value !== null &&
            coupon.discount_value !== undefined && (
              <div className="text-lg font-bold text-red-600">
                {coupon.discount_value}% OFF
              </div>
            )}

          {/* TITLE */}
          <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900">
            {coupon.title}
          </h1>

          {/* STORE */}
          {coupon.store_name && (
            <Link
              href={`/stores/${coupon.store_name
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              {coupon.store_name}
            </Link>
          )}

          {/* PRICE */}
          {coupon.sale_price !== null &&
          coupon.sale_price !== undefined &&
          coupon.original_price !== null &&
          coupon.original_price !== undefined ? (
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ${Number(coupon.sale_price).toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${Number(coupon.original_price).toFixed(2)}
              </span>
            </div>
          ) : null}

          {/* BADGE */}
          {coupon.badge && (
            <div className="mt-4 inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              {coupon.badge}
            </div>
          )}

          {/* COUPON CODE PREVIEW */}
          {coupon.coupon_code && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="text-sm text-gray-500">Coupon Code:</div>
              <div className="mt-1 text-2xl font-bold tracking-wider text-green-700">
                {coupon.coupon_code.slice(0, 4)}****
              </div>
            </div>
          )}

          {/* GET CODE / GET DEAL BUTTON */}
          <div className="mt-5">
            <GetCodeButton
              couponId={String(coupon.id)}
              couponCode={coupon.coupon_code}
              affiliateUrl={coupon.affiliate_url}
            />
          </div>

          {/* DETAILS */}
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            {coupon.verified && (
              <div className="font-medium text-green-600">✓ Verified Deal</div>
            )}

            {coupon.popularity_count !== null &&
              coupon.popularity_count !== undefined &&
              coupon.popularity_count > 0 && (
                <div>🔥 {coupon.popularity_count} clicks</div>
              )}

            {coupon.rating !== null && coupon.rating !== undefined && (
              <div>
                ⭐ {coupon.rating}
                {coupon.review_count ? ` (${coupon.review_count} reviews)` : ""}
              </div>
            )}

            {coupon.shipping_text && <div>🚚 {coupon.shipping_text}</div>}
            {coupon.sold_text && <div>📦 {coupon.sold_text}</div>}
            {coupon.expires_at && <div>⏳ Expires: {coupon.expires_at}</div>}
          </div>
        </div>
      </section>

      {/* HOW TO USE THIS COUPON */}
      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          How to use this coupon
        </h2>
        <ol className="mt-5 space-y-4 text-gray-600">
          <li>
            <span className="font-bold text-gray-900">1.</span> Click the GET
            CODE button.
          </li>
          <li>
            <span className="font-bold text-gray-900">2.</span> Copy the coupon
            code.
          </li>
          <li>
            <span className="font-bold text-gray-900">3.</span> Continue to{" "}
            {coupon.store_name}.
          </li>
          <li>
            <span className="font-bold text-gray-900">4.</span> Enter the code
            during checkout.
          </li>
        </ol>
      </section>

      {/* COUPON DETAILS */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900">Coupon Details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {coupon.store_name && (
            <div>
              <p className="text-sm text-gray-500">Store</p>
              <p className="font-semibold">{coupon.store_name}</p>
            </div>
          )}

          {coupon.category && (
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-semibold">{coupon.category}</p>
            </div>
          )}

          {coupon.discount_value !== null &&
            coupon.discount_value !== undefined && (
              <div>
                <p className="text-sm text-gray-500">Discount</p>
                <p className="font-semibold text-red-600">
                  {coupon.discount_value}% OFF
                </p>
              </div>
            )}

          {coupon.expires_at && (
            <div>
              <p className="text-sm text-gray-500">Expiration</p>
              <p className="font-semibold">{coupon.expires_at}</p>
            </div>
          )}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold">About this deal</h2>
        <p className="mt-3 leading-7 text-gray-600">
          Save with this verified deal from {coupon.store_name}. Check the offer
          details and use the code at checkout to get the available discount.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="font-semibold">How do I use this coupon?</h3>
            <p className="mt-2 text-gray-600">
              Click GET CODE, copy the code, and enter it at checkout on{" "}
              {coupon.store_name}.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Is this coupon verified?</h3>
            <p className="mt-2 text-gray-600">
              {coupon.verified
                ? "Yes. This coupon is marked as verified."
                : "This coupon has not been marked as verified."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold">When does this coupon expire?</h3>
            <p className="mt-2 text-gray-600">
              {coupon.expires_at
                ? `This coupon expires on ${coupon.expires_at}.`
                : "An expiration date is not currently available."}
            </p>
          </div>
        </div>
      </section>

      {/* RELATED COUPONS */}
      {relatedCoupons && relatedCoupons.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">
            More coupons from {coupon.store_name}
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCoupons.map((item) => (
              <CouponCard key={item.id} coupon={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
