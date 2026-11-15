'use client';

import React, { useState } from 'react';
import { Schedule, DayOfWeek, SectionNumber, SessionType } from '@/types/database';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Wrench, 
  FlaskConical, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SchedulesTabProps {
  schedules: Schedule[];
  activeDeptName: string;
  activeYear: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export default function SchedulesTab({ schedules, activeDeptName, activeYear }: SchedulesTabProps) {
  // Determine today in Arabic
  const getTodayArabic = (): DayOfWeek => {
    const dayIndex = new Date().getDay();
    // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
    const map: Record<number, DayOfWeek> = {
      6: 'السبت',
      0: 'الأحد',
      1: 'الاثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
      5: 'الجمعة' as any,
    };
    return map[dayIndex] || 'السبت';
  };

  const todayArabic = getTodayArabic();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'الكل'>(todayArabic === ('الجمعة' as any) ? 'السبت' : todayArabic);
  const [selectedSection, setSelectedSection] = useState<SectionNumber | 'الكل'>('الكل');
  const [selectedType, setSelectedType] = useState<SessionType | 'الكل'>('الكل');

  // Filtered schedules
  const filtered = schedules.filter((s) => {
    if (selectedDay !== 'الكل' && s.day_of_week !== selectedDay) return false;
    if (selectedSection !== 'الكل') {
      if (s.section_number !== selectedSection && s.section_number !== 'عام') return false;
    }
    if (selectedType !== 'الكل' && s.session_type !== selectedType) return false;
    return true;
  });

  const getSessionBadge = (type: SessionType) => {
    switch (type) {
      case 'محاضرة نظري':
        return {
          icon: <BookOpen className="w-3.5 h-3.5" />,
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        };
      case 'سكشن عملي':
        return {
          icon: <FlaskConical className="w-3.5 h-3.5" />,
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'ورشة':
        return {
          icon: <Wrench className="w-3.5 h-3.5" />,
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'معمل':
        return {
          icon: <FlaskConical className="w-3.5 h-3.5" />,
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        };
      default:
        return {
          icon: <Calendar className="w-3.5 h-3.5" />,
          classes: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface/80 border border-border p-4 rounded-2xl">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-emerald" />
            <span>جدول المحاضرات والسكاشن العملية والورش</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            جدول {activeDeptName} — {activeYear} (مع تمييز يوم اليوم الحالي تلقائياً)
          </p>
        </div>

        {/* Today Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-border text-slate-300">
          <span>اليوم:</span>
          <span className="text-emerald-400">{todayArabic}</span>
        </div>
      </div>

      {/* 2. Days Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDay('الكل')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            selectedDay === 'الكل'
              ? 'bg-slate-100 text-slate-950 shadow-md font-black'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-border'
          }`}
        >
          كل الأسبوع ({schedules.length})
        </button>

        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayArabic === day;
          const dayCount = schedules.filter((s) => s.day_of_week === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-emerald text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border-border hover:border-slate-700'
              }`}
            >
              <span>{day}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {dayCount}
              </span>
              {isToday && (
                <span className={`text-[10px] px-1 rounded font-extrabold ${
                  isSelected ? 'bg-black/30 text-slate-950' : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40'
                }`}>
                  اليوم
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Sub-filters: Section & Session Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-border">
        {/* Section filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">تصفية بالسكشن:</span>
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
            {(['الكل', 'عام', 'سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4'] as (SectionNumber | 'الكل')[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  selectedSection === sec
                    ? 'bg-brand-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">نوع الفترة:</span>
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border">
            {(['الكل', 'محاضرة نظري', 'سكشن عملي', 'ورشة', 'معمل'] as (SessionType | 'الكل')[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  selectedType === t
                    ? 'bg-brand-emerald text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Schedules Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-surface/50 rounded-2xl border border-border p-6">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">لا توجد محاضرات أو سكاشن مسجلة لهذا اليوم بالفلتر المختار</h3>
          <p className="text-xs text-slate-400 mt-1">جرب التبديل ليوم آخر أو اختيار كل الأيام لمعاينة الجدول الأسبوعي كاملاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((item) => {
            const badge = getSessionBadge(item.session_type);
            return (
              <div
                key={item.id}
                className="bg-surface border border-border hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg space-y-3"
              >
                {/* Header: Day & Session type */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-border">
                    {item.day_of_week}
                  </span>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.classes}`}>
                    {badge.icon}
                    {item.session_type}
                  </span>
                </div>

                {/* Subject Name & Section */}
                <div>
                  <h4 className="text-base font-extrabold text-white leading-snug line-clamp-1">
                    {item.subject?.name_ar || 'مادة تخصصية'}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold mt-1">
                    <span>الفئة: {item.section_number}</span>
                    {item.subject?.code && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono">{item.subject.code}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Timing & Location */}
                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="font-bold font-mono dir-ltr">
                      {item.start_time} - {item.end_time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-200 line-clamp-1">{item.location_room}</span>
                  </div>

                  {item.instructor_name && (
                    <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="line-clamp-1">{item.instructor_name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
