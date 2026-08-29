const deals = [
  {
    title: "MacBook Air M4",
    price: "$899",
  },
  {
    title: "Nike Air Max",
    price: "$79",
  },
  {
    title: "Sony WH-1000XM5",
    price: "$299",
  },
];

export default function LatestDeals() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Latest Deals</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.title} className="bg-white border rounded-xl p-6">
            <h3 className="font-semibold">{deal.title}</h3>

            <p className="mt-3 text-green-600 font-bold">{deal.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
