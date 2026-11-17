'use client';

import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, AlertOctagon, Info, X, Check } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  highlightText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  highlightText,
  confirmLabel = 'تأكيد الإجراء',
  cancelLabel = 'تراجع وإلغاء',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => {
        if (!isLoading) onClose();
      }}
      className="fixed inset-0 w-screen h-screen z-[100] flex items-center justify-center p-4 bg-[#171717]/65 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[24px] shadow-[0_16px_50px_rgba(0,0,0,0.35)] p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 text-right cursor-default relative"
      >
        {/* Close "X" Button in corner */}
        <button
          type="button"
          onClick={() => {
            if (!isLoading) onClose();
          }}
          disabled={isLoading}
          className="absolute left-4 top-4 p-1.5 rounded-full bg-[#f7efe9] hover:bg-[#ebdcd1] border-[1.5px] border-[#171717] text-[#171717] transition-all cursor-pointer disabled:opacity-50"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Central Icon Badge */}
        <div className="flex justify-center pt-1">
          {variant === 'danger' && (
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border-[2px] border-rose-300 text-rose-600 flex items-center justify-center shadow-sm">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
          )}
          {variant === 'warning' && (
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border-[2px] border-amber-300 text-amber-600 flex items-center justify-center shadow-sm">
              <AlertOctagon className="w-7 h-7 text-amber-600" />
            </div>
          )}
          {variant === 'info' && (
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border-[2px] border-sky-300 text-sky-600 flex items-center justify-center shadow-sm">
              <Info className="w-7 h-7 text-sky-600" />
            </div>
          )}
        </div>

        {/* Title and Message */}
        <div className="text-center space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-[#171717]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#171717]/80 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Optional Highlight Box */}
        {highlightText && (
          <div className="p-3 rounded-[12px] bg-[#f7efe9] border-[1.5px] border-[#171717]/25 text-xs font-bold text-[#171717] text-center max-h-24 overflow-y-auto">
            {highlightText}
          </div>
        )}

        {/* Danger Warning Pill */}
        {variant === 'danger' && (
          <div className="p-2.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span>تنبيه: هذا الإجراء لا يمكن التراجع عنه بعد إتمامه</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 px-5 rounded-full font-black text-xs sm:text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : variant === 'warning'
                ? 'bg-[#ff6f1e] hover:bg-[#e65d10] text-[#2b1a07]'
                : 'bg-[#171717] hover:bg-[#171717]/90 text-white'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isLoading ? 'جاري التنفيذ...' : confirmLabel}</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-full bg-[#f7efe9] hover:bg-[#ebdcd1] text-[#171717] font-bold text-xs sm:text-sm border-[1.5px] border-[#171717] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{cancelLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
