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

      {/* Fixed Right Sidebar */}
      <Sidebar />

      {/* Main Content Area (Offset by 256px on the right because of RTL sidebar) */}
      <div className="mr-64 flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
