import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>

      {/* Slide-out Drawer Menu (Sandwich Menu - 100% responsive across all screen sizes) */}
      <Sidebar />

      {/* Main Content Area - Full 100% Width on ALL devices without permanent sidebar */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
