import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Shield, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "شعبة المساحة العامة | المعهد الفني الصناعي بالإسكندرية",
  description: "المنصة الأكاديمية لشعبة المساحة العامة - المعهد الفني الصناعي بالإسكندرية. المقررات الدراسية، المحاضرات، الشيتات والتكليفات، وجدول المحاضرات والسكاشن.",
  keywords: [
    "المعهد الفني الصناعي بالإسكندرية",
    "شعبة المساحة العامة",
    "مساحة عامة",
    "مقررات المساحة",
    "جدول شعبة المساحة",
    "شيتات المساحة",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
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
    <html lang="ar" dir="rtl" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 antialiased selection:bg-blue-600/30 selection:text-blue-300 flex flex-col min-h-screen">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Institution Brand */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-blue-400">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base text-white tracking-wide">
                  المعهد الفني الصناعي بالإسكندرية
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  شعبة المساحة العامة
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/#courses"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                المقررات
              </Link>
              <Link
                href="/#resources"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
              >
                الملخصات والشيتات
              </Link>
              <Link
                href="/#schedules"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                الجدول الدراسي
              </Link>
              <Link
                href="/#deadlines"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                مواعيد التسليم
              </Link>

              <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

              {/* Admin Access Button */}
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>لوحة المشرف</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Professional Academic Footer */}
        <footer className="border-t border-slate-800/60 bg-[#080B12] py-8 px-4 text-xs text-slate-400 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <span>المعهد الفني الصناعي بالإسكندرية — شعبة المساحة العامة</span>
            </div>
            <p className="text-slate-400">
              بوابة أكاديمية لمتابعة المحاضرات والشيتات والجداول الدراسية لجميع الفصول
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
