'use client';

import React from 'react';
import { AcademicYear, SemesterNumber, SectionNumber } from '@/types/database';
import { Users, GraduationCap, BookOpen, CheckCircle2 } from 'lucide-react';

interface SemesterSelectorProps {
  activeYear: AcademicYear | 'all';
  activeSemester: SemesterNumber | 'all';
  activeSection: SectionNumber;
  onSelectYear: (year: AcademicYear | 'all') => void;
  onSelectSemester: (sem: SemesterNumber | 'all', year?: AcademicYear) => void;
  onSelectSection: (sec: SectionNumber) => void;
  totalCoursesCount: number;
}

export default function SemesterSelector({
  activeYear,
  activeSemester,
  activeSection,
  onSelectYear,
  onSelectSemester,
  onSelectSection,
  totalCoursesCount,
}: SemesterSelectorProps) {
  const isYear1Active = activeYear === 'الفرقة الأولى';
  const isYear2Active = activeYear === 'الفرقة الثانية';
  const isAllYearsActive = activeYear === 'all';

  return (
    <div className="w-full bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] space-y-4">
      {/* Top Header of the notebook tab */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-3.5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ff6f1e] mb-1">
            <span>• خطة شعبة المساحة العامة (سنتان دراسيتان)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#2b1a07]">
            اختر الفرقة الدراسية والفصل الدراسي
          </h2>
        </div>

        {/* Section Picker in Superr Pill */}
        <div className="flex items-center gap-2 bg-[#fdfbf9] border-[1.5px] border-[#171717] px-3.5 py-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.25)] text-xs">
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

      {/* Primary Academic Year Switcher (Big Tactile Tabs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Year 1 Button */}
        <button
          onClick={() => {
            onSelectYear('الفرقة الأولى');
            onSelectSemester(1, 'الفرقة الأولى');
          }}
          className={`flex items-center justify-between p-3.5 rounded-[12px] border-[1.5px] transition-all text-right cursor-pointer ${
            isYear1Active
              ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-2 ring-[#ff6f1e]/40'
              : 'bg-[#fdfbf9]/60 border-[#171717]/30 hover:bg-[#fdfbf9] hover:border-[#171717]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full border-[1.5px] border-[#171717] flex items-center justify-center font-black text-sm ${
              isYear1Active ? 'bg-[#ff6f1e] text-[#2b1a07]' : 'bg-[#f7efe9] text-[#171717]'
            }`}>
              1
            </div>
            <div>
              <div className="font-extrabold text-[#2b1a07] text-sm sm:text-base">
                سنة أولى (الفرقة الأولى)
              </div>
              <div className="text-[11px] text-[#171717]/70 font-medium">
                16 مادة • الفصل الدراسي 1 و 2
              </div>
            </div>
          </div>
          {isYear1Active && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1px] border-[#171717]">
              محددة
            </span>
          )}
        </button>

        {/* Year 2 Button */}
        <button
          onClick={() => {
            onSelectYear('الفرقة الثانية');
            onSelectSemester(3, 'الفرقة الثانية');
          }}
          className={`flex items-center justify-between p-3.5 rounded-[12px] border-[1.5px] transition-all text-right cursor-pointer ${
            isYear2Active
              ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-2 ring-[#ff6f1e]/40'
              : 'bg-[#fdfbf9]/60 border-[#171717]/30 hover:bg-[#fdfbf9] hover:border-[#171717]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full border-[1.5px] border-[#171717] flex items-center justify-center font-black text-sm ${
              isYear2Active ? 'bg-[#ff6f1e] text-[#2b1a07]' : 'bg-[#f7efe9] text-[#171717]'
            }`}>
              2
            </div>
            <div>
              <div className="font-extrabold text-[#2b1a07] text-sm sm:text-base">
                سنة ثانية (الفرقة الثانية - تخرج)
              </div>
              <div className="text-[11px] text-[#171717]/70 font-medium">
                16 مادة • الفصل الدراسي 3 و 4
              </div>
            </div>
          </div>
          {isYear2Active && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1px] border-[#171717]">
              محددة
            </span>
          )}
        </button>

        {/* All Years Overview Button */}
        <button
          onClick={() => {
            onSelectYear('all');
            onSelectSemester('all');
          }}
          className={`flex items-center justify-between p-3.5 rounded-[12px] border-[1.5px] transition-all text-right cursor-pointer ${
            isAllYearsActive
              ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-2 ring-[#ff6f1e]/40'
              : 'bg-[#fdfbf9]/60 border-[#171717]/30 hover:bg-[#fdfbf9] hover:border-[#171717]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-full border-[1.5px] border-[#171717] flex items-center justify-center font-black text-sm ${
              isAllYearsActive ? 'bg-[#ff6f1e] text-[#2b1a07]' : 'bg-[#f7efe9] text-[#171717]'
            }`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-[#2b1a07] text-sm sm:text-base">
                السنتين معاً (الخطة كاملة)
              </div>
              <div className="text-[11px] text-[#171717]/70 font-medium">
                32 مادة معتمدة • 4 فصول
              </div>
            </div>
          </div>
          {isAllYearsActive && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1px] border-[#171717]">
              محددة
            </span>
          )}
        </button>
      </div>

      {/* Two Year Binder Panels (Clearly Divided) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* ================= YEAR 1 PANEL ================= */}
        <div className={`bg-[#fdfbf9] border-[1.5px] rounded-[14px] p-4 space-y-3 transition-all ${
          isYear1Active 
            ? 'border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-white' 
            : 'border-[#171717]/30 opacity-80 hover:opacity-100 hover:border-[#171717]'
        }`}>
          <div className="flex items-center justify-between border-b-[1.5px] border-[#171717]/15 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f1e]"></span>
              <h3 className="font-black text-[#2b1a07] text-sm sm:text-base">
                مقررات سنة أولى (الفرقة الأولى)
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f7efe9] text-[#2b1a07] border-[1px] border-[#171717]/40">
              16 مادة معتمدة
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Semester 1 */}
            <button
              onClick={() => {
                onSelectYear('الفرقة الأولى');
                onSelectSemester(1, 'الفرقة الأولى');
              }}
              className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer relative ${
                activeYear === 'الفرقة الأولى' && activeSemester === 1
                  ? 'bg-[#f7efe9] border-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.12)] font-bold'
                  : 'bg-[#fdfbf9] border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              {activeYear === 'الفرقة الأولى' && activeSemester === 1 && (
                <div className="absolute top-0 right-2 left-2 h-1 bg-[#ff6f1e] rounded-b"></div>
              )}
              <div className="text-[11px] font-extrabold text-[#ff6f1e] mb-1">الترم الأول</div>
              <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">الفصل الدراسي الأول</div>
              <div className="text-[11px] text-[#171717]/70 mt-1">8 مواد دراسية</div>
            </button>

            {/* Semester 2 */}
            <button
              onClick={() => {
                onSelectYear('الفرقة الأولى');
                onSelectSemester(2, 'الفرقة الأولى');
              }}
              className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer relative ${
                activeYear === 'الفرقة الأولى' && activeSemester === 2
                  ? 'bg-[#f7efe9] border-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.12)] font-bold'
                  : 'bg-[#fdfbf9] border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              {activeYear === 'الفرقة الأولى' && activeSemester === 2 && (
                <div className="absolute top-0 right-2 left-2 h-1 bg-[#ff6f1e] rounded-b"></div>
              )}
              <div className="text-[11px] font-extrabold text-[#ff6f1e] mb-1">الترم الثاني</div>
              <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">الفصل الدراسي الثاني</div>
              <div className="text-[11px] text-[#171717]/70 mt-1">8 مواد دراسية</div>
            </button>
          </div>

          <button
            onClick={() => {
              onSelectYear('الفرقة الأولى');
              onSelectSemester('all', 'الفرقة الأولى');
            }}
            className={`w-full py-1.5 px-3 rounded-full text-xs font-bold border-[1.5px] transition-all text-center cursor-pointer ${
              activeYear === 'الفرقة الأولى' && activeSemester === 'all'
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
            }`}
          >
            عرض جميع مواد سنة أولى كاملة (16 مادة)
          </button>
        </div>

        {/* ================= YEAR 2 PANEL ================= */}
        <div className={`bg-[#fdfbf9] border-[1.5px] rounded-[14px] p-4 space-y-3 transition-all ${
          isYear2Active 
            ? 'border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.08)] bg-white' 
            : 'border-[#171717]/30 opacity-80 hover:opacity-100 hover:border-[#171717]'
        }`}>
          <div className="flex items-center justify-between border-b-[1.5px] border-[#171717]/15 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f1e]"></span>
              <h3 className="font-black text-[#2b1a07] text-sm sm:text-base">
                مقررات سنة ثانية (الفرقة الثانية - تخرج)
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f7efe9] text-[#2b1a07] border-[1px] border-[#171717]/40">
              16 مادة معتمدة
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Semester 3 */}
            <button
              onClick={() => {
                onSelectYear('الفرقة الثانية');
                onSelectSemester(3, 'الفرقة الثانية');
              }}
              className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer relative ${
                activeYear === 'الفرقة الثانية' && activeSemester === 3
                  ? 'bg-[#f7efe9] border-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.12)] font-bold'
                  : 'bg-[#fdfbf9] border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              {activeYear === 'الفرقة الثانية' && activeSemester === 3 && (
                <div className="absolute top-0 right-2 left-2 h-1 bg-[#ff6f1e] rounded-b"></div>
              )}
              <div className="text-[11px] font-extrabold text-[#ff6f1e] mb-1">الترم الأول لسنة 2</div>
              <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">الفصل الدراسي الثالث</div>
              <div className="text-[11px] text-[#171717]/70 mt-1">8 مواد دراسية</div>
            </button>

            {/* Semester 4 */}
            <button
              onClick={() => {
                onSelectYear('الفرقة الثانية');
                onSelectSemester(4, 'الفرقة الثانية');
              }}
              className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer relative ${
                activeYear === 'الفرقة الثانية' && activeSemester === 4
                  ? 'bg-[#f7efe9] border-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.12)] font-bold'
                  : 'bg-[#fdfbf9] border-[#171717]/30 hover:border-[#171717]'
              }`}
            >
              {activeYear === 'الفرقة الثانية' && activeSemester === 4 && (
                <div className="absolute top-0 right-2 left-2 h-1 bg-[#ff6f1e] rounded-b"></div>
              )}
              <div className="text-[11px] font-extrabold text-[#ff6f1e] mb-1">ترم التخرج</div>
              <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">الفصل الدراسي الرابع</div>
              <div className="text-[11px] text-[#171717]/70 mt-1">8 مواد دراسية</div>
            </button>
          </div>

          <button
            onClick={() => {
              onSelectYear('الفرقة الثانية');
              onSelectSemester('all', 'الفرقة الثانية');
            }}
            className={`w-full py-1.5 px-3 rounded-full text-xs font-bold border-[1.5px] transition-all text-center cursor-pointer ${
              activeYear === 'الفرقة الثانية' && activeSemester === 'all'
                ? 'bg-[#171717] text-white border-[#171717]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
            }`}
          >
            عرض جميع مواد سنة ثانية كاملة (16 مادة)
          </button>
        </div>
      </div>
    </div>
  );
}
