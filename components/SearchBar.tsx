export default function SearchBar() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <input
        type="text"
        placeholder="Search stores, coupons, deals..."
        className="w-full p-4 rounded-xl border border-slate-300 shadow-sm"
      />
    </div>
  );
}
