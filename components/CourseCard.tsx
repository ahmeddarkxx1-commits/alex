'use client';

import React, { useState } from 'react';
import { Subject } from '@/types/database';
import { ChevronLeft, FileText, FileCheck, Link2, Check } from 'lucide-react';

interface CourseCardProps {
  subject: Subject;
  resourcesCount: number;
  sheetsCount: number;
  onOpenSubject: (subject: Subject) => void;
  onCopyLink?: (subject: Subject) => void;
}

export default function CourseCard({
  subject,
  resourcesCount,
  sheetsCount,
  onOpenSubject,
  onCopyLink,
}: CourseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://survey.nexoura.org';
    const link = `${origin}/?course=${subject.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    if (onCopyLink) {
      onCopyLink(subject);
    }
  };

  return (
    <div
      onClick={() => onOpenSubject(subject)}
      className="group relative flex flex-col justify-between bg-[#fdfbf9] hover:bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[12px] p-4 sm:p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all cursor-pointer"
    >
      <div>
        {/* Top: School Name Label Badge + Copy Link */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#2b1a07] bg-[#f7efe9] border-[1.5px] border-[#171717] px-2.5 py-0.5 rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
              {subject.code}
            </span>
            <span className="text-[11px] font-semibold text-[#2b1a07]/60">
              {subject.semester}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e] text-[#171717] hover:text-[#2b1a07] border-[1.5px] border-[#171717] transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center gap-1 text-[11px] font-bold px-2.5"
            title="نسخ رابط المادة المباشر"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Link2 className="w-3.5 h-3.5 text-[#ff6f1e]" />}
            <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'رابط المادة'}</span>
          </button>
        </div>

        {/* Title in Cocoa Ink */}
        <h3 className="text-base sm:text-lg font-black text-[#2b1a07] group-hover:text-[#ff6f1e] transition-colors mb-1.5 leading-snug">
          {subject.name_ar}
        </h3>

        {/* Instructor Field - Preserved empty slot */}
        <p className="text-xs text-[#2b1a07]/80 font-medium mb-3 flex items-center gap-1.5 min-h-[20px]">
          <span className="font-bold text-[#2b1a07]">المحاضر:</span>
          <span className="text-[#2b1a07]">
            {/* فارغ حالياً ومتروك لحين اعتماد المهندسين */}
          </span>
        </p>

        {/* Description */}
        <p className="text-xs text-[#171717]/80 leading-relaxed line-clamp-2 mb-4 font-normal">
          {subject.description || 'مقرر دراسي معتمد لشعبة المساحة العامة.'}
        </p>
      </div>

      {/* Footer & Pill Action */}
      <div className="pt-3 border-t-[1.5px] border-[#171717]/15 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#2b1a07]">
          <span className="flex items-center gap-1 font-bold text-xs">
            <FileText className="w-3.5 h-3.5 text-[#ff6f1e]" />
            <span>{resourcesCount}</span>
          </span>
          {sheetsCount > 0 && (
            <span className="flex items-center gap-1 text-[#2b1a07] font-bold text-[11px] bg-[#f7efe9] border-[1px] border-[#171717] px-2 py-0.5 rounded-[20px]">
              <FileCheck className="w-3 h-3 text-[#ff6f1e]" />
              <span>{sheetsCount} شيت</span>
            </span>
          )}
        </div>

        <button className="btn-pill inline-flex items-center gap-0.5 !py-1 !px-3 text-xs">
          <span>المذكرات</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
