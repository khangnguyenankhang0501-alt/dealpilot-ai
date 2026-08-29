const coupons = [
  {
    store: "Amazon",
    code: "SAVE20",
    discount: "20% OFF",
  },
  {
    store: "Walmart",
    code: "DEAL15",
    discount: "15% OFF",
  },
  {
    store: "Target",
    code: "NEW10",
    discount: "10% OFF",
  },
];

export default function TrendingCoupons() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Trending Coupons</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-white border rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-bold text-xl">{coupon.store}</h3>

            <p className="text-green-600 font-bold mt-3">{coupon.discount}</p>

            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg">
              {coupon.code}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
