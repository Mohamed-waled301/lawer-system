import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "نظام إدارة مكتب المحاماة",
  description: "نظام رسمي متكامل لإدارة القضايا والاستشارات والموكلين وحسابات الأتعاب",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-sans min-h-screen bg-slate-100/60 text-slate-900">
        {children}
      </body>
    </html>
  );
}

