import type { Metadata } from "next";

interface CategoryLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const categories: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  electronics: {
    name: "Electronics",
    description:
      "Find electronics coupons, deals, promo codes, and discounts on DealPilot.",
  },
  home: {
    name: "Home",
    description:
      "Find home coupons, deals, promo codes, and discounts on DealPilot.",
  },
  fashion: {
    name: "Fashion",
    description:
      "Find fashion coupons, deals, promo codes, and discounts on DealPilot.",
  },
  beauty: {
    name: "Beauty",
    description:
      "Find beauty coupons, deals, promo codes, and discounts on DealPilot.",
  },
  kitchen: {
    name: "Kitchen",
    description:
      "Find kitchen coupons, deals, promo codes, and discounts on DealPilot.",
  },
  health: {
    name: "Health",
    description:
      "Find health coupons, deals, promo codes, and discounts on DealPilot.",
  },
  sports: {
    name: "Sports",
    description:
      "Find sports coupons, deals, promo codes, and discounts on DealPilot.",
  },
  baby: {
    name: "Baby",
    description:
      "Find baby coupons, deals, promo codes, and discounts on DealPilot.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categories[slug];

  if (!category) {
    return {
      title: "Category | DealPilot",
      description:
        "Browse coupons, deals, promo codes, and discounts by category on DealPilot.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${category.name} Coupons & Deals | DealPilot`;
  const url = `${siteUrl}/categories/${slug}`;

  return {
    title,
    description: category.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: category.description,
      url,
      siteName: "DealPilot",
      type: "website",
    },
  };
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return children;
}
