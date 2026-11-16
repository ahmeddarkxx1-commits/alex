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
      termLabel: 'الترم 1',
    },
    {
      number: 2,
      title: 'الفصل الدراسي الثاني',
      year: 'الفرقة الأولى',
      termLabel: 'الترم 2',
    },
    {
      number: 3,
      title: 'الفصل الدراسي الثالث',
      year: 'الفرقة الثانية',
      termLabel: 'الترم 3',
    },
    {
      number: 4,
      title: 'الفصل الدراسي الرابع',
      year: 'الفرقة الثانية',
      termLabel: 'الترم 4 (التخرج)',
    },
  ];

  return (
    <div className="w-full bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[12px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] space-y-4">
      {/* Top Header of the notebook tab */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/20 pb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff6f1e] mb-1">
            <span>• خطة المقررات المعتمدة</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#2b1a07]">
            اختر الفصل الدراسي
          </h2>
        </div>

        {/* Section Picker in Superr Pill */}
        <div className="flex items-center gap-2 bg-[#fdfbf9] border-[1.5px] border-[#171717] px-3.5 py-1.5 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.25)] text-xs">
          <Users className="w-3.5 h-3.5 text-[#ff6f1e]" />
          <span className="text-[#171717] font-bold">السكشن:</span>
          <select
            value={activeSection}
            onChange={(e) => onSelectSection(e.target.value as SectionNumber)}
            className="bg-transparent font-bold text-[#2b1a07] focus:outline-none cursor-pointer"
          >
            <option value="عام">عام (كل الدفعة)</option>
            <option value="سكشن 1">سكشن 1</option>
            <option value="سكشن 2">سكشن 2</option>
            <option value="سكشن 3">سكشن 3</option>
            <option value="سكشن 4">سكشن 4</option>
          </select>
        </div>
      </div>

      {/* 4 Semesters Tabs (Name Label Notebook Style) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {semesters.map((sem) => {
          const isSelected = activeSemester === sem.number;
          return (
            <button
              key={sem.number}
              onClick={() => onSelectSemester(sem.number)}
              className={`relative p-3.5 rounded-[12px] border-[1.5px] text-right transition-all ${
                isSelected
                  ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] -translate-y-0.5'
                  : 'bg-[#fdfbf9]/60 border-[#171717]/40 hover:bg-[#fdfbf9] hover:border-[#171717] text-[#171717]/80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-4 left-4 h-1 bg-[#ff6f1e] rounded-b"></div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-[20px] border-[1px] ${
                  isSelected 
                    ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717]' 
                    : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30'
                }`}>
                  {sem.termLabel}
                </span>
                <span className="text-[11px] font-semibold text-[#2b1a07]/60">8 مواد</span>
              </div>

              <div className="text-sm font-black text-[#2b1a07]">
                {sem.title}
              </div>

              <div className="text-xs text-[#2b1a07]/70 font-medium mt-1">
                {sem.year}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
