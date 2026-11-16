'use client';

import React, { useState } from 'react';
import { Announcement, Resource, AnnouncementCategory } from '@/types/database';
import { Clock, ChevronLeft } from 'lucide-react';

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

  const calculateDaysLeft = (targetDate: string | null | undefined) => {
    if (!targetDate) return { text: 'غير محدد', days: 999, isUrgent: false };
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'انتهى الموعد', days, isUrgent: false, isPassed: true };
    if (days === 0) return { text: 'اليوم آخر موعد', days, isUrgent: true };
    if (days === 1) return { text: 'غداً آخر موعد', days, isUrgent: true };
    return { text: `متبقي ${days} أيام`, days, isUrgent: days <= 3 };
  };

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
    subtitle: 'تنبيه أكاديمي',
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#f7efe9] border-[1.5px] border-[#171717] p-4 rounded-[12px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#2b1a07]">
            مواعيد التسليم والتنبيهات
          </h2>
          <p className="text-xs text-[#2b1a07]/70 font-medium mt-0.5">
            مواعيد تسليم الشيتات، الامتحانات العملية، والتنبيهات
          </p>
        </div>

        {/* Categories Filter in Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['الكل', 'تسليم شيت', 'امتحان عملي', 'ميدتيرم', 'تنبيه إداري'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-[20px] text-xs font-bold whitespace-nowrap transition-colors border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
                selectedCategory === cat
                  ? 'bg-[#ff6f1e] text-[#2b1a07]'
                  : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const countdown = calculateDaysLeft(item.event_date);

          return (
            <div
              key={item.id}
              className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#2b1a07] bg-[#f7efe9] px-2.5 py-0.5 rounded-[20px] border-[1px] border-[#171717]">
                      {item.category}
                    </span>
                    <span className="text-xs text-[#2b1a07]/70 font-medium">
                      {item.subtitle}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-black text-[#2b1a07]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#171717]/80 line-clamp-2 font-normal">
                    {item.details}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#171717]/15">
                  <div className={`px-3 py-1 rounded-[20px] text-xs font-bold border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
                    countdown.isPassed
                      ? 'bg-[#f7efe9] text-[#171717]/50'
                      : countdown.isUrgent
                      ? 'bg-[#ff6f1e] text-[#2b1a07]'
                      : 'bg-[#f7efe9] text-[#2b1a07]'
                  }`}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {countdown.text}
                    </span>
                  </div>

                  {item.event_date && (
                    <span className="text-[11px] text-[#2b1a07]/70 font-mono font-medium">
                      {new Date(item.event_date).toLocaleDateString('ar-EG')}
                    </span>
                  )}

                  {item.isResource && item.rawResource && (
                    <button
                      onClick={() => onOpenResource(item.rawResource!)}
                      className="btn-pill inline-flex items-center gap-0.5 !py-1 !px-3 text-xs"
                    >
                      <span>عرض الشيت</span>
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
