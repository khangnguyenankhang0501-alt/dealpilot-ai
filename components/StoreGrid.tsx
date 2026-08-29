const stores = ["Amazon", "Walmart", "Target", "Best Buy", "Nike", "Adidas"];

export default function StoreGrid() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8">Top Stores</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div
            key={store}
            className="bg-white border rounded-xl p-5 text-center"
          >
            {store}
          </div>
        ))}
      </div>
    </section>
  );
}
