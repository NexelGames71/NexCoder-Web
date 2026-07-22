import LaunchBanner from "./LaunchBanner";
import PublicFooter from "./PublicFooter";
import PublicNav from "./PublicNav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-shell text-ink">
      <LaunchBanner />
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
