'use client';

import React from 'react';
import { SemesterNumber, SectionNumber } from '@/types/database';
import { Users } from 'lucide-react';

interface SemesterSelectorProps {
  activeSemester: SemesterNumber;
  activeSection: SectionNumber;
  onSelectSemester: (sem: SemesterNumber) => void;
  onSelectSection: (sec: SectionNumber) => void;
  totalCoursesCount: number;
}

export default function SemesterSelector({
  activeSemester,
  activeSection,
  onSelectSemester,
  onSelectSection,
  totalCoursesCount,
}: SemesterSelectorProps) {
  const semesters: { number: SemesterNumber; title: string; year: string; termLabel: string }[] = [
    {
      number: 1,
      title: 'الفصل الدراسي الأول',
      year: 'الفرقة الأولى',
      termLabel: 'الترم الأول',
    },
    {
      number: 2,
      title: 'الفصل الدراسي الثاني',
      year: 'الفرقة الأولى',
      termLabel: 'الترم الثاني',
    },
    {
      number: 3,
      title: 'الفصل الدراسي الثالث',
      year: 'الفرقة الثانية',
      termLabel: 'الترم الأول',
    },
    {
      number: 4,
      title: 'الفصل الدراسي الرابع',
      year: 'الفرقة الثانية',
      termLabel: 'الترم الثاني',
    },
  ];

  return (
    <div className="w-full bg-[#0F1422] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            مقررات شعبة المساحة العامة
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            اختر الفصل الدراسي لعرض المواد المعتمدة ومذكراتها والجدول الخاص بها
          </p>
        </div>

        {/* Section Selector */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">السكشن:</span>
          <select
            value={activeSection}
            onChange={(e) => onSelectSection(e.target.value as SectionNumber)}
            className="bg-transparent font-semibold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="عام" className="bg-slate-900 text-white">الكل (عام)</option>
            <option value="سكشن 1" className="bg-slate-900 text-white">سكشن 1</option>
            <option value="سكشن 2" className="bg-slate-900 text-white">سكشن 2</option>
            <option value="سكشن 3" className="bg-slate-900 text-white">سكشن 3</option>
            <option value="سكشن 4" className="bg-slate-900 text-white">سكشن 4</option>
          </select>
        </div>
      </div>

      {/* 4 Semesters Segmented Bar (No emojis, clean academic styling) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {semesters.map((sem) => {
          const isSelected = activeSemester === sem.number;
          return (
            <button
              key={sem.number}
              onClick={() => onSelectSemester(sem.number)}
              className={`p-3 rounded-xl border text-right transition-colors ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {sem.termLabel}
                </span>
                <span className="text-[11px] text-slate-400">8 مواد</span>
              </div>

              <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {sem.title}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {sem.year}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
