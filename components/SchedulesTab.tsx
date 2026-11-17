'use client';

import React, { useState } from 'react';
import { Schedule, DayOfWeek, SectionNumber, SessionType } from '@/types/database';
import { Clock, MapPin, User, Calendar, Share2, Check, Link2 } from 'lucide-react';

interface SchedulesTabProps {
  schedules: Schedule[];
  activeDeptName: string;
  activeYear: string;
  initialDay?: DayOfWeek | 'الكل';
  initialSection?: SectionNumber | 'الكل';
  onCopyLink?: (url: string, title: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

export default function SchedulesTab({
  schedules,
  activeDeptName,
  activeYear,
  initialDay,
  initialSection,
  onCopyLink,
}: SchedulesTabProps) {
  const [copiedLink, setCopiedLink] = useState(false);
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
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'الكل'>(
    initialDay || (todayArabic === ('الجمعة' as any) ? 'السبت' : todayArabic)
  );
  const [selectedSection, setSelectedSection] = useState<SectionNumber | 'الكل'>(initialSection || 'الكل');
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
        return 'bg-[#f7efe9] text-[#2b1a07] border-[#171717]';
      case 'سكشن عملي':
        return 'bg-[#22c55e]/20 text-[#171717] border-[#171717]';
      case 'ورشة':
        return 'bg-[#ff6f1e]/20 text-[#ce500a] border-[#171717]';
      case 'معمل':
        return 'bg-[#3b82f6]/20 text-[#171717] border-[#171717]';
      default:
        return 'bg-[#fdfbf9] text-[#171717] border-[#171717]';
    }
  };

  const handleShareSchedule = () => {
    const origin = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost') && !window.location.origin.includes('127.0.0.1')
      ? window.location.origin
      : 'https://survey.nexoura.org';
    const params = new URLSearchParams();
    params.set('tab', 'schedules');
    if (selectedDay !== 'الكل') params.set('day', selectedDay);
    if (selectedSection !== 'الكل') params.set('sec', selectedSection);
    const link = `${origin}/?${params.toString()}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    if (onCopyLink) {
      onCopyLink(link, `جدول المحاضرات والسكاشن (${selectedDay === 'الكل' ? 'الأسبوع كاملاً' : selectedDay}${selectedSection !== 'الكل' ? ` • ${selectedSection}` : ''})`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f7efe9] border-[1.5px] border-[#171717] p-3.5 sm:p-4 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#2b1a07]">
            جدول المحاضرات والسكاشن
          </h2>
          <p className="text-xs text-[#2b1a07]/70 font-medium mt-0.5">
            {activeDeptName} — {activeYear}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={handleShareSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#fdfbf9] hover:bg-[#ff6f1e] text-[#171717] hover:text-[#2b1a07] border-[1.5px] border-[#171717] text-xs font-bold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer"
            title="نسخ رابط الجدول لإرساله للطلاب"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Link2 className="w-3.5 h-3.5 text-[#ff6f1e]" />}
            <span>{copiedLink ? 'تم نسخ الرابط ✓' : 'نسخ رابط الجدول 🔗'}</span>
          </button>

          <div className="text-xs font-bold px-3 py-1.5 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
            اليوم: <span className="text-[#ff6f1e]">{todayArabic}</span>
          </div>
        </div>
      </div>

      {/* Days Bar (Pill buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none touch-pan-x -mx-1 px-1">
        <button
          onClick={() => setSelectedDay('الكل')}
          className={`px-3.5 py-1.5 rounded-[20px] text-xs font-bold whitespace-nowrap transition-all border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] flex-shrink-0 cursor-pointer ${
            selectedDay === 'الكل'
              ? 'bg-[#ff6f1e] text-[#2b1a07]'
              : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9]'
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
              className={`px-3.5 py-1.5 rounded-[20px] text-xs font-bold whitespace-nowrap transition-all border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-[#ff6f1e] text-[#2b1a07]'
                  : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9]'
              }`}
            >
              <span>{day}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full border-[1px] ${
                isSelected ? 'bg-[#2b1a07] text-white border-[#2b1a07]' : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30'
              }`}>
                {count}
              </span>
              {isToday && (
                <span className="text-[10px] text-[#ce500a] font-black">
                  (اليوم)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-filters (Mobile Responsive with clean scroll and wrap) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs bg-[#fdfbf9] p-3 sm:p-4 rounded-[12px] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Section Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[#2b1a07] font-bold text-xs flex-shrink-0">السكشن:</span>
          <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
            {(['الكل', 'عام', 'سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4'] as (SectionNumber | 'الكل')[]).map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1 rounded-[20px] text-xs border-[1.5px] transition-all flex-shrink-0 cursor-pointer ${
                  selectedSection === sec
                    ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-sm'
                    : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 border-t lg:border-t-0 border-[#171717]/10 pt-2.5 lg:pt-0 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[#2b1a07] font-bold text-xs flex-shrink-0">النوع:</span>
          <div className="flex items-center gap-1.5 flex-nowrap sm:flex-wrap">
            {(['الكل', 'محاضرة نظري', 'سكشن عملي', 'ورشة', 'معمل'] as (SessionType | 'الكل')[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-[20px] text-xs border-[1.5px] transition-all flex-shrink-0 cursor-pointer ${
                  selectedType === t
                    ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-sm'
                    : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
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
        <div className="text-center py-10 bg-[#f7efe9] rounded-[12px] border-[1.5px] border-[#171717] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Calendar className="w-8 h-8 text-[#171717]/40 mx-auto mb-2" />
          <p className="text-xs font-bold text-[#2b1a07]">لا توجد فترات مسجلة لهذا اليوم بالفلتر المختار</p>
          <p className="text-[11px] text-[#2b1a07]/60 mt-0.5">يمكنك اختيار يوم آخر أو اختيار كل الأسبوع لمعاينة الجدول كاملاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-4 space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2b1a07] bg-[#f7efe9] px-2.5 py-0.5 rounded-[20px] border-[1px] border-[#171717]">
                  {item.day_of_week}
                </span>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[20px] border-[1px] ${getBadgeStyle(item.session_type)}`}>
                  {item.session_type}
                </span>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-black text-[#2b1a07]">
                  {item.subject?.name_ar || 'مادة تخصصية'}
                </h4>
                <div className="text-xs text-[#2b1a07]/70 font-semibold mt-0.5">
                  الفئة: <span className="text-[#2b1a07] font-bold">{item.section_number}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#171717] bg-[#f7efe9] p-3 rounded-[8px] border-[1px] border-[#171717]/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#ff6f1e] shrink-0" />
                  <span className="font-mono dir-ltr font-bold text-[#2b1a07]">{item.start_time} - {item.end_time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#ff6f1e] shrink-0" />
                  <span className="font-medium text-[#2b1a07]">{item.location_room}</span>
                </div>

                {item.instructor_name && (
                  <div className="flex items-center gap-2 pt-1 border-t-[1px] border-[#171717]/15 text-[#2b1a07]/70 font-medium">
                    <User className="w-3.5 h-3.5 text-[#171717]/50 shrink-0" />
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
