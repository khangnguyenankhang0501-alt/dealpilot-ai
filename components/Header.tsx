export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
        <h1 className="font-bold text-2xl text-green-500">DealPilot</h1>

        <nav className="flex gap-6">
          <a href="/">Home</a>
          <a href="/coupons">Coupons</a>
          <a href="/deals">Deals</a>
          <a href="/stores">Stores</a>
        </nav>
      </div>
    </header>
  );
}
