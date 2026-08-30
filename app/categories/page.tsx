import Link from "next/link";

const CATEGORIES = [
  {
    slug: "fashion",
    name: "Fashion",
    description: "Discover top apparel and clothing brand deals.",
  },
  {
    slug: "electronics",
    name: "Electronics",
    description: "Save on gadgets, phones, and tech accessories.",
  },
  {
    slug: "travel",
    name: "Travel",
    description: "Find booking discounts and hotel promo codes.",
  },
  {
    slug: "software",
    name: "Software",
    description: "Get deals on SaaS tools, VPNs, and applications.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-3">All Categories</h1>
      <p className="text-gray-600 text-lg mb-10">
        Browse coupons and deals by category to find the best offers quickly.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-black transition block"
          >
            <h2 className="text-2xl font-semibold mb-2">{cat.name}</h2>
            <p className="text-gray-600">{cat.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
