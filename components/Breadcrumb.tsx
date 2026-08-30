import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="text-sm text-gray-500 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Link href={item.href} className="hover:text-black">
              {item.label}
            </Link>

            {index < items.length - 1 && <span>›</span>}
          </div>
        ))}
      </div>
    </nav>
  );
}
