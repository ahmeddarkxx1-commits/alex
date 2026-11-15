import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Compass, BookOpen, Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "منصة المعهد الفني الصناعي بالإسكندرية | ITI Alex Academic Hub",
  description: "المنصة الطلابية الرسمية المتكاملة لطلاب المعهد الفني الصناعي بالإسكندرية (كامب شيزار والمحرم بك) - تلخيصات المحاضرات، شيتات وتكليفات، مذكرات السكاشن والورش، جداول المحاضرات وبنوك الأسئلة لجميع الشعب.",
  keywords: [
    "المعهد الفني الصناعي بالإسكندرية",
    "ITI Alex",
    "شعبة مساحة",
    "شعبة عمارة ومدني",
    "شعبة كهرباء",
    "شعبة إلكترونيات",
    "شعبة تبريد وتكييف",
    "شعبة ميكانيكا",
    "شعبة سيارات",
    "مذكرات المعهد الفني",
    "شيتات المعهد الفني الصناعي",
  ],
  authors: [{ name: "فريق تطوير منصة المعهد" }],
  creator: "ITI Alexandria Students Tech Team",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    title: "منصة المعهد الفني الصناعي بالإسكندرية | ITI Alex Hub",
    description: "كل ما يحتاجه طالب المعهد الفني الصناعي في مكان واحد: تلخيصات، شيتات، جداول سكاشن، وتنبيهات فورية بدون تسجيل دخول.",
    url: "https://iti-alex.vercel.app",
    siteName: "ITI Alex Hub",
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة المعهد الفني الصناعي بالإسكندرية",
    description: "ملخصات، شيتات، ومواعيد تسليم لجميع شعب المعهد الفني الصناعي بالإسكندرية.",
  },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
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
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏛️</text></svg>" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-background text-slate-100 antialiased selection:bg-brand-cyan/20 selection:text-brand-cyan flex flex-col min-h-screen">
        {/* Header / Navbar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg leading-tight bg-gradient-to-l from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  منصة المعهد الفني الصناعي
                </span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                  الإسكندرية • ITI Alex Academic Hub
                </span>
              </div>
            </Link>

            {/* Navigation links & Admin Action */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/#resources"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface/80 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-brand-cyan" />
                المذكرات والشيتات
              </Link>
              <Link
                href="/#schedules"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface/80 transition-colors"
              >
                <Calendar className="w-4 h-4 text-brand-emerald" />
                الجداول والسكاشن
              </Link>
              <Link
                href="/#deadlines"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface/80 transition-colors"
              >
                <Clock className="w-4 h-4 text-brand-amber" />
                مواعيد التسليم
              </Link>

              {/* Admin Portal Button */}
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-surface hover:bg-surface-hover border border-border text-cyan-400 hover:text-cyan-300 transition-all shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>بوابة الإدارة والمندوبين</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Application Body */}
        <main className="flex-1">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-border/60 bg-surface/40 mt-16 py-8 px-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>منصة المعهد الفني الصناعي بالإسكندرية — خدمة طلابية مفتوحة بدون تسجيل دخول</span>
            </div>
            <p className="text-slate-400">
              شعب المعهد: مساحة • عمارة وإنشاءات • كهرباء • إلكترونيات وحاسبات • تبريد وتكييف • ميكانيكا • سيارات
            </p>
            <div className="flex items-center gap-1 text-slate-400">
              <span>تطوير طلابي حر • 2026</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
