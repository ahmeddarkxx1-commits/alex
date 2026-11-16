'use client';

import React, { useState } from 'react';
import { Schedule, DayOfWeek, SectionNumber, SessionType } from '@/types/database';
import { Clock, MapPin, User, Calendar } from 'lucide-react';

interface SchedulesTabProps {
  schedules: Schedule[];
  activeDeptName: string;
  activeYear: string;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export default function SchedulesTab({ schedules, activeDeptName, activeYear }: SchedulesTabProps) {
  const getTodayArabic = (): DayOfWeek => {
    const dayIndex = new Date().getDay();
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

  const filtered = schedules.filter((s) => {
    if (selectedDay !== 'الكل' && s.day_of_week !== selectedDay) return false;
    if (selectedSection !== 'الكل') {
      if (s.section_number !== selectedSection && s.section_number !== 'عام') return false;
    }
    if (selectedType !== 'الكل' && s.session_type !== selectedType) return false;
    return true;
  });

  const getBadgeStyle = (type: SessionType) => {
    switch (type) {
      case 'محاضرة نظري':
        return 'bg-blue-950/60 text-blue-300 border-blue-900/60';
      case 'سكشن عملي':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-900/60';
      case 'ورشة':
        return 'bg-amber-950/60 text-amber-300 border-amber-900/60';
      case 'معمل':
        return 'bg-purple-950/60 text-purple-300 border-purple-900/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0F1422] border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            جدول المحاضرات والسكاشن
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeDeptName} — {activeYear}
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          اليوم: <span className="text-blue-400 font-bold">{todayArabic}</span>
        </div>
      </div>

      {/* Days Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedDay('الكل')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedDay === 'الكل'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          كل الأسبوع ({schedules.length})
        </button>

        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = todayArabic === day;
          const count = schedules.filter((s) => s.day_of_week === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <span>{day}</span>
              <span className={`text-[10px] px-1 rounded ${
                isSelected ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
              {isToday && (
                <span className="text-[10px] text-blue-300 font-bold">
                  (اليوم)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">السكشن:</span>
          <div className="flex items-center gap-1">
            {(['الكل', 'عام', 'سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4'] as (SectionNumber | 'الكل')[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  selectedSection === sec
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">النوع:</span>
          <div className="flex items-center gap-1">
            {(['الكل', 'محاضرة نظري', 'سكشن عملي', 'ورشة', 'معمل'] as (SessionType | 'الكل')[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  selectedType === t
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Schedules Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 bg-[#0F1422] rounded-2xl border border-slate-800 p-6">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">لا توجد فترات مسجلة لهذا اليوم بالفلتر المختار</p>
          <p className="text-[11px] text-slate-400 mt-0.5">يمكنك اختيار يوم آخر أو اختيار كل الأسبوع لمعاينة الجدول كاملاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#0F1422] border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {item.day_of_week}
                </span>

                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(item.session_type)}`}>
                  {item.session_type}
                </span>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {item.subject?.name_ar || 'مادة تخصصية'}
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  الفئة: <span className="text-slate-300">{item.section_number}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono dir-ltr font-medium">{item.start_time} - {item.end_time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-300">{item.location_room}</span>
                </div>

                {item.instructor_name && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-slate-400">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{item.instructor_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
