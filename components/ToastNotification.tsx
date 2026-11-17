'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  message: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  duration?: number;
}

export interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export default function ToastNotification({
  toast,
  onClose,
}: ToastNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) return;

    setProgress(100);
    const duration = toast.duration || 4000;
    const intervalTime = 40;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  const defaultTitle = isSuccess
    ? 'تم الإجراء بنجاح'
    : isError
    ? 'تنبيه بالنظام'
    : 'إشعار أكاديمي';

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[110] w-[92%] sm:w-auto sm:min-w-[380px] max-w-lg pointer-events-auto"
      dir="rtl"
    >
      <div className="bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[20px] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex items-start sm:items-center gap-3.5 animate-in slide-in-from-top-4 fade-in duration-200 relative overflow-hidden">
        {/* Dynamic Status Icon */}
        <div className="flex-shrink-0">
          {isSuccess && (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border-[1.5px] border-emerald-500 text-emerald-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {isError && (
            <div className="w-10 h-10 rounded-xl bg-rose-100 border-[1.5px] border-rose-500 text-rose-700 flex items-center justify-center shadow-sm">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {isInfo && (
            <div className="w-10 h-10 rounded-xl bg-sky-100 border-[1.5px] border-sky-500 text-sky-700 flex items-center justify-center shadow-sm">
              <Info className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${
                isSuccess
                  ? 'text-emerald-700'
                  : isError
                  ? 'text-rose-700'
                  : 'text-sky-700'
              }`}
            >
              {toast.title || defaultTitle}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#171717] mt-0.5 leading-snug break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-[#171717]/50 hover:text-[#171717] hover:bg-[#171717]/10 transition-colors cursor-pointer flex-shrink-0 mr-auto self-start sm:self-center"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar Timer Stripe */}
        <div className="absolute bottom-0 right-0 left-0 h-1 bg-black/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              isSuccess
                ? 'bg-emerald-500'
                : isError
                ? 'bg-rose-500'
                : 'bg-sky-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
