import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { AnalyticsTracker } from "./AnalyticsTracker";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100">
      <ScrollToTop />
      <AnalyticsTracker />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
