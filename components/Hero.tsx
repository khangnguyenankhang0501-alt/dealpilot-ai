import SearchBar from "./SearchBar";

export default function Hero() {
  return (
    <section className="py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-900">
        Find The Best Coupons & Deals
      </h1>

      <p className="mt-6 text-lg text-slate-500">
        Verified promo codes, cashback offers and exclusive discounts from top
        stores.
      </p>

      <SearchBar />
    </section>
  );
}
