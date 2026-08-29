export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold">{slug} Coupons</h1>

      <p className="mt-4">Best verified promo codes for {slug}</p>
    </main>
  );
}
