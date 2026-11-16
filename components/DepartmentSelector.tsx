'use client';

import React from 'react';
import { Department, AcademicYear, AcademicSemester, SectionNumber } from '@/types/database';
import { 
  Compass, 
  Building2, 
  Zap, 
  Cpu, 
  Snowflake, 
  Wrench, 
  Car, 
  Layers, 
  Sparkles,
  Users
} from 'lucide-react';

interface DepartmentSelectorProps {
  departments: Department[];
  selectedDeptId: string;
  selectedYear: AcademicYear;
  selectedSemester: AcademicSemester;
  selectedSection: SectionNumber;
  onSelectDept: (deptId: string) => void;
  onSelectYear: (year: AcademicYear) => void;
  onSelectSemester: (sem: AcademicSemester) => void;
  onSelectSection: (sec: SectionNumber) => void;
}

export default function DepartmentSelector({
  departments,
  selectedDeptId,
  selectedYear,
  selectedSemester,
  selectedSection,
  onSelectDept,
  onSelectYear,
  onSelectSemester,
  onSelectSection,
}: DepartmentSelectorProps) {
  // Map icon name to Lucide icon
  const getIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Snowflake':
        return <Snowflake className={className} />;
      case 'Wrench':
        return <Wrench className={className} />;
      case 'Car':
        return <Car className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const activeDept = departments.find((d) => d.id === selectedDeptId);

  return (
    <div className="w-full bg-surface/90 border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xl glass-panel space-y-4">
      {/* 1. Header & Current Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            تحديد مسارك الأكاديمي الحالي:
          </span>
          {activeDept && (
            <span className="text-xs font-extrabold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              {activeDept.name_ar}
            </span>
          )}
        </div>

        {/* Year, Semester & Section quick selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Year selector */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-border">
            {(['الفرقة الأولى', 'الفرقة الثانية'] as AcademicYear[]).map((year) => (
              <button
                key={year}
                onClick={() => onSelectYear(year)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Semester selector */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-border">
            {(['الترم الأول', 'الترم الثاني'] as AcademicSemester[]).map((sem) => (
              <button
                key={sem}
                onClick={() => onSelectSemester(sem)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedSemester === sem
                    ? 'bg-brand-emerald text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sem}
              </button>
            ))}
          </div>

          {/* Section selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-border">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSection}
              onChange={(e) => onSelectSection(e.target.value as SectionNumber)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="عام" className="bg-slate-900 text-white">كل السكاشن (عام)</option>
              <option value="سكشن 1" className="bg-slate-900 text-white">سكشن 1</option>
              <option value="سكشن 2" className="bg-slate-900 text-white">سكشن 2</option>
              <option value="سكشن 3" className="bg-slate-900 text-white">سكشن 3</option>
              <option value="سكشن 4" className="bg-slate-900 text-white">سكشن 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Departments Horizontal Scroll / Grid */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 mb-2">
          اختر الشعبة الدراسية (7 شعب متوفرة):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {departments.map((dept) => {
            const isSelected = dept.id === selectedDeptId;
            return (
              <button
                key={dept.id}
                onClick={() => onSelectDept(dept.id)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all group ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/60 to-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'bg-slate-900/50 border-border hover:bg-slate-800/60 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                    isSelected
                      ? 'bg-brand-cyan text-slate-950 font-black shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-300 group-hover:text-cyan-400'
                  }`}
                >
                  {getIcon(dept.icon_name)}
                </div>
                <span
                  className={`text-xs font-bold leading-snug line-clamp-2 ${
                    isSelected ? 'text-white font-extrabold' : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {dept.short_name}
                </span>

                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Active Department Brief Note */}
      {activeDept && activeDept.description && (
        <div className="text-xs text-slate-400 bg-slate-900/40 rounded-xl px-3.5 py-2 border border-border/40 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-200">{activeDept.name_ar}: </span>
            {activeDept.description}
          </p>
        </div>
      )}
    </div>
  );
}

