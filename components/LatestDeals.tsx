export default function LatestDeals() {
  const deals = [
    {
      title: "MacBook Air M3",
      store: "Amazon",
      price: "$999",
    },
    {
      title: "Nike Air Max",
      store: "Nike",
      price: "$89",
    },
    {
      title: "Samsung 4K TV",
      store: "Walmart",
      price: "$499",
    },
  ];

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Latest Deals</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.title} className="border rounded-xl p-6">
            <h3 className="font-bold text-lg">{deal.title}</h3>

            <p className="text-slate-500">{deal.store}</p>

            <p className="text-green-600 font-bold mt-2">{deal.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
