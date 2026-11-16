import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Compass, BookOpen, Calendar, Clock, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "شعبة المساحة العامة | المعهد الفني الصناعي بالإسكندرية",
  description: "المنصة الأكاديمية لشعبة المساحة العامة - المعهد الفني الصناعي بالإسكندرية. المقررات الدراسية، المحاضرات، الشيتات والتكليفات، وجدول المحاضرات والسكاشن.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#fdfbf9] text-[#171717] antialiased selection:bg-[#ff6f1e]/20 selection:text-[#2b1a07] flex flex-col min-h-screen">
        {/* Superr Schoolyard Header */}
        <header className="sticky top-0 z-50 bg-[#fdfbf9]/95 backdrop-blur-sm border-b-[1.5px] border-[#171717]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
            {/* Top-left / Right Brand Anchor */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#f7efe9] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#171717] group-hover:rotate-3 transition-transform">
                <Compass className="w-5 h-5 text-[#ff6f1e]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-[#2b1a07] tracking-tight leading-tight">
                  شعبة المساحة العامة
                </span>
                <span className="text-xs text-[#2b1a07]/70 font-medium">
                  المعهد الفني الصناعي بالإسكندرية
                </span>
              </div>
            </Link>

            {/* Navigation links & Pill Action Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/#courses"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:text-[#ff6f1e] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>المقررات</span>
              </Link>
              <Link
                href="/#resources"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:text-[#ff6f1e] transition-colors"
              >
                <span>الشيتات والمذكرات</span>
              </Link>
              <Link
                href="/#schedules"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:text-[#ff6f1e] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>الجدول</span>
              </Link>
              <Link
                href="/#deadlines"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:text-[#ff6f1e] transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>المواعيد</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1">
          {children}
        </main>

        {/* Superr Footer Brand Band */}
        <footer className="mt-20">
          <div className="w-full bg-[#ff6f1e] rounded-t-[56px] border-t-[2px] border-[#171717] pt-12 pb-14 px-6 text-[#2b1a07] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
            <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-right space-y-1">
                <div className="inline-flex items-center gap-2 bg-[#fdfbf9] border-[1.5px] border-[#171717] px-3.5 py-1 rounded-[20px] text-xs font-bold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                  <span>المعهد الفني الصناعي بالإسكندرية</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2b1a07] mt-2">
                  شعبة المساحة العامة
                </h3>
                <p className="text-xs sm:text-sm text-[#2b1a07]/80 font-medium">
                  دفتر المذكرات والشيتات والجداول الدراسية لجميع الفصول
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
                <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] px-4 py-2 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                  سنة أولى وسنة ثانية (32 مادة)
                </div>
                <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] px-4 py-2 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                  دفعة 2026
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
