'use client';

import React, { useState } from 'react';
import { Announcement, Resource, AnnouncementCategory } from '@/types/database';
import { 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileCheck, 
  GraduationCap, 
  Building2, 
  Bell, 
  CheckCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

interface DeadlinesTabProps {
  announcements: Announcement[];
  resourcesWithDueDates: Resource[];
  onOpenResource: (resource: Resource) => void;
}

export default function DeadlinesTab({
  announcements,
  resourcesWithDueDates,
  onOpenResource,
}: DeadlinesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Compute remaining days and urgency
  const calculateDaysLeft = (targetDate: string | null | undefined) => {
    if (!targetDate) return { text: 'غير محدد', days: 999, isUrgent: false };
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'انتهى الموعد', days, isUrgent: false, isPassed: true };
    if (days === 0) return { text: 'اليوم آخر موعد!', days, isUrgent: true };
    if (days === 1) return { text: 'غداً آخر موعد تسليم', days, isUrgent: true };
    return { text: `متبقي ${days} أيام`, days, isUrgent: days <= 3 };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'تسليم شيت':
        return <FileCheck className="w-4 h-4 text-amber-400" />;
      case 'امتحان عملي':
        return <GraduationCap className="w-4 h-4 text-rose-400" />;
      case 'ميدتيرم':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <Building2 className="w-4 h-4 text-cyan-400" />;
    }
  };

  // Combine items into unified timeline
  const sheetItems = resourcesWithDueDates
    .filter((r) => Boolean(r.due_date))
    .map((r) => ({
      id: r.id,
      title: r.title,
      details: r.summary,
      category: 'تسليم شيت' as AnnouncementCategory,
      event_date: r.due_date,
      urgency: 'عاجل جداً',
      isResource: true,
      rawResource: r,
      subtitle: `${r.subject?.name_ar || 'مادة تخصصية'} • ${r.academic_year}`,
    }));

  const announcementItems = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    details: a.details,
    category: a.category,
    event_date: a.event_date,
    urgency: a.urgency,
    isResource: false,
    rawResource: null as Resource | null,
    subtitle: a.department?.name_ar || 'تنبيه عام لكافة شعب المعهد',
  }));

  const allTimelineItems = [...sheetItems, ...announcementItems].sort((a, b) => {
    const timeA = a.event_date ? new Date(a.event_date).getTime() : 9999999999999;
    const timeB = b.event_date ? new Date(b.event_date).getTime() : 9999999999999;
    return timeA - timeB;
  });

  const filteredItems = allTimelineItems.filter((item) => {
    if (selectedCategory === 'الكل') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface/80 border border-border p-4 rounded-2xl">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-amber" />
            <span>مواعيد التسليم والامتحانات والتنبيهات العاجلة</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            تابع مواعيد تسليم الشيتات، كويزات السكاشن، امتحانات العملي والميدتيرم مع عدّاد تنازلي فوري
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['الكل', 'تسليم شيت', 'امتحان عملي', 'ميدتيرم', 'تنبيه إداري'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-amber text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Timeline List */}
      <div className="space-y-3.5">
        {filteredItems.map((item) => {
          const countdown = calculateDaysLeft(item.event_date);

          return (
            <div
              key={item.id}
              className={`relative bg-surface border rounded-2xl p-4 sm:p-5 transition-all hover:border-slate-600 ${
                countdown.isUrgent
                  ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/20 via-surface to-surface'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left side: Category, Title, Subtitle */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-900 border border-border text-slate-300">
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>

                    <span className="text-xs text-slate-400 font-semibold">
                      {item.subtitle}
                    </span>

                    {item.urgency === 'عاجل جداً' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" />
                        عاجل
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.details}
                  </p>
                </div>

                {/* Right side: Countdown & CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {/* Countdown Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                    countdown.isPassed
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : countdown.isUrgent
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{countdown.text}</span>
                  </div>

                  {item.event_date && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      التاريخ: {new Date(item.event_date).toLocaleDateString('ar-EG')}
                    </span>
                  )}

                  {item.isResource && item.rawResource && (
                    <button
                      onClick={() => onOpenResource(item.rawResource!)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 px-3 py-1.5 rounded-xl border border-cyan-800/40 transition-colors"
                    >
                      <span>فتح تفاصيل الشيت</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
