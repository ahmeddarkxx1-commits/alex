'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check, Share } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker with offline caching
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered successfully, scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running as installed standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture native install prompt (Android Chrome & Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if dismissed before in session
    const hasDismissed = sessionStorage.getItem('pwa_dismissed');
    if (hasDismissed) {
      setDismissed(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      {/* Floating Bottom-Right Neo-Brutalist Install Banner */}
      <div
        className="fixed bottom-4 left-4 z-40 max-w-sm bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[20px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)] animate-in slide-in-from-bottom duration-300"
        dir="rtl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#ff6f1e] border-[1.5px] border-[#171717] flex items-center justify-center text-[#2b1a07] shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5 text-[#2b1a07]" />
          </div>

          <div className="flex-1 space-y-1">
            <h4 className="text-xs sm:text-sm font-black text-[#2b1a07]">
              تثبيت تطبيق المنصة على هاتفك 📲
            </h4>
            <p className="text-[11px] text-[#171717]/80 leading-relaxed font-medium">
              تصفح المقررات والجداول بدون إنترنت وبضغطة واحدة من شاشتك الرئيسية.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-black text-xs border-[1.5px] border-[#171717] shadow-[0_2px_0_#171717] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تثبيت التطبيق</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-full bg-[#f7efe9] hover:bg-[#ebdcd1] text-[#171717] font-bold text-xs border border-[#171717]/40 transition-colors cursor-pointer"
              >
                لاحقاً
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-[#171717]/60 hover:text-[#171717] transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSPrompt && (
        <div
          onClick={() => setShowIOSPrompt(false)}
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-[#171717]/80 backdrop-blur-md"
          dir="rtl"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[24px] p-6 shadow-[0_16px_50px_rgba(0,0,0,0.3)] space-y-4 text-center cursor-default"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ff6f1e]/20 border-[1.5px] border-[#171717] flex items-center justify-center mx-auto text-[#ce500a]">
              <Share className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-[#2b1a07]">
              تثبيت التطبيق على جهاز آيفون / آيباد
            </h3>

            <div className="text-xs text-[#171717]/80 space-y-2 text-right bg-[#f7efe9] p-3.5 rounded-xl border border-[#171717]/20 font-medium">
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6f1e] text-[#2b1a07] font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <span>اضغط على زر المشاركة <b>(Share)</b> في أسفل شاشة سفاري.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6f1e] text-[#2b1a07] font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <span>اختر <b>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</b>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#ff6f1e] text-[#2b1a07] font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <span>اضغط <b>إضافة (Add)</b> وسيظهر التطبيق على شاشة هاتفك فوراً!</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 rounded-full bg-[#171717] text-white font-bold text-xs border border-[#171717] cursor-pointer"
            >
              فهمت ذلك ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
