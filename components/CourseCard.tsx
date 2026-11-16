'use client';

import React from 'react';
import { Subject } from '@/types/database';
import { ChevronLeft, FileText, FileCheck } from 'lucide-react';

interface CourseCardProps {
  subject: Subject;
  resourcesCount: number;
  sheetsCount: number;
  onOpenSubject: (subject: Subject) => void;
}

export default function CourseCard({
  subject,
  resourcesCount,
  sheetsCount,
  onOpenSubject,
}: CourseCardProps) {
  return (
    <div
      onClick={() => onOpenSubject(subject)}
      className="flex flex-col justify-between bg-[#0F1422] hover:bg-[#141B2D] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-colors cursor-pointer"
    >
      <div>
        {/* Top: Code & Term */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/40 border border-blue-900/50 px-2 py-0.5 rounded">
            {subject.code}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {subject.semester}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug">
          {subject.name_ar}
        </h3>

        {/* Instructor */}
        {subject.instructor_name && (
          <p className="text-xs text-slate-400 font-medium mb-3">
            المحاضر: {subject.instructor_name}
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {subject.description || 'مقرر دراسي معتمد لشعبة المساحة العامة.'}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{resourcesCount}</span>
          </span>
          {sheetsCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400/90 font-medium">
              <FileCheck className="w-3.5 h-3.5" />
              <span>{sheetsCount} شيت</span>
            </span>
          )}
        </div>

        <button className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
          <span>المحتوى</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
