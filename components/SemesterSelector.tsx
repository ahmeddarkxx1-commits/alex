'use client';

import React from 'react';
import { SemesterNumber, SectionNumber } from '@/types/database';
import { Compass, Calendar, Users, Sparkles, BookOpen, ChevronLeft } from 'lucide-react';

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
  const semesters: { number: SemesterNumber; title: string; year: string; badge: string; icon: string }[] = [
    {
      number: 1,
      title: 'الفصل الدراسي الأول',
      year: 'الفرقة الأولى',
      badge: 'الترم 1',
      icon: '📐',
    },
    {
      number: 2,
      title: 'الفصل الدراسي الثاني',
      year: 'الفرقة الأولى',
      badge: 'الترم 2',
      icon: '🌐',
    },
    {
      number: 3,
      title: 'الفصل الدراسي الثالث',
      year: 'الفرقة الثانية',
      badge: 'الترم 3',
      icon: '🚇',
    },
    {
      number: 4,
      title: 'الفصل الدراسي الرابع',
      year: 'الفرقة الثانية',
      badge: 'الترم 4 (التخرج)',
      icon: '🗺️',
    },
  ];

  return (
    <div className="w-full bg-[#0C1222]/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5">
      {/* 1. Header Information */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
                شعبة المساحة العامة والخرائط
              </span>
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                المعهد الفني الصناعي بالإسكندرية
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
              خطة المقررات والمذكرات عبر الفصول الدراسية الأربعة
            </h2>
          </div>
        </div>

        {/* Section Filter dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-800">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400 font-bold">السكشن:</span>
          <select
            value={activeSection}
            onChange={(e) => onSelectSection(e.target.value as SectionNumber)}
            className="bg-transparent text-xs font-black text-cyan-300 focus:outline-none cursor-pointer"
          >
            <option value="عام" className="bg-slate-900 text-white">كل السكاشن (عام)</option>
            <option value="سكشن 1" className="bg-slate-900 text-white">سكشن 1</option>
            <option value="سكشن 2" className="bg-slate-900 text-white">سكشن 2</option>
            <option value="سكشن 3" className="bg-slate-900 text-white">سكشن 3</option>
            <option value="سكشن 4" className="bg-slate-900 text-white">سكشن 4</option>
          </select>
        </div>
      </div>

      {/* 2. Sleek 4-Semester Tabs */}
      <div>
        <label className="block text-xs font-extrabold text-slate-400 mb-2.5">
          اختر الفصل الدراسي لعرض مواده الـ 8 المعتمدة:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {semesters.map((sem) => {
            const isSelected = activeSemester === sem.number;
            return (
              <button
                key={sem.number}
                onClick={() => onSelectSemester(sem.number)}
                className={`relative flex flex-col items-start p-3.5 sm:p-4 rounded-2xl border text-right transition-all group ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/70 to-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/15 ring-1 ring-cyan-500/60'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-xl sm:text-2xl">{sem.icon}</span>
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {sem.badge}
                  </span>
                </div>

                <span
                  className={`text-sm sm:text-base font-black leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {sem.title}
                </span>

                <span className="text-[11px] text-slate-400 font-semibold mt-1">
                  {sem.year} • 8 مواد مقررة
                </span>

                {isSelected && (
                  <div className="w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mt-3"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
