import Breadcrumb from "@/components/Breadcrumb";
import CopyButton from "@/components/CopyButton";
import { supabase } from "@/lib/supabaseClientClientClient";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return {};
  }

  return {
    title: coupon.title,
    description: `${coupon.title} coupon and promo code`,
    openGraph: {
      title: coupon.title,
      description: `${coupon.title} coupon and promo code`,
      type: "website",
      url: `https://yourdomain.com/coupons/${slug}`,
      images: [
        {
          url: "/og-default.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: coupon.title,
      description: `${coupon.title} coupon and promo code`,
      images: ["/og-default.jpg"],
    },
  };
}

export default async function CouponPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!coupon) {
    return <div className="p-10 text-center">Coupon not found</div>;
  }

  // Lấy danh sách Related Coupons (cùng store_name nhưng khác id)
  const { data: relatedCoupons } = await supabase
    .from("coupons")
    .select("*")
    .eq("store_name", coupon.store_name)
    .neq("id", coupon.id)
    .limit(3);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://yourdomain.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Stores",
        item: "https://yourdomain.com/stores",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: coupon.store_name,
        item: `https://yourdomain.com/stores/${coupon.store_name?.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: coupon.title,
      },
    ],
  };

  // Cập nhật Schema Offer nâng cao theo yêu cầu
  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: coupon.title,
    priceCurrency: "USD",
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offerSchema),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Stores", href: "/stores" },
          {
            label: coupon.store_name,
            href: `/stores/${coupon.store_name?.toLowerCase()}`,
          },
          { label: coupon.title, href: "#" },
        ]}
      />

      <h1 className="text-4xl font-bold mb-4">{coupon.title}</h1>

      <div className="mb-6">
        Store: <strong>{coupon.store_name}</strong>
      </div>

      {/* Sử dụng component CopyButton */}
      <div className="mb-6">
        <CopyButton
          id={coupon.id}
          code={coupon.coupon_code}
          affiliateUrl={coupon.affiliate_url}
        />
      </div>

      <a
        href={coupon.affiliate_url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white px-6 py-3 rounded-lg inline-block hover:bg-gray-800 transition font-medium"
      >
        Get Deal
      </a>

      {/* Phần Related Coupons */}
      {relatedCoupons && relatedCoupons.length > 0 && (
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Related Coupons</h2>
          <ul className="space-y-3">
            {relatedCoupons.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/coupons/${item.slug}`}
                  className="text-blue-600 hover:underline text-lg font-medium"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
