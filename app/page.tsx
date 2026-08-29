import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrendingCoupons from "@/components/TrendingCoupons";
import StoreGrid from "@/components/StoreGrid";
import LatestDeals from "@/components/LatestDeals";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6">
        <Hero />
        <TrendingCoupons />
        <StoreGrid />
        <LatestDeals />
      </main>

      <Footer />
    </div>
  );
}
