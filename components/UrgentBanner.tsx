'use client';

import React from 'react';
import { Announcement } from '@/types/database';
import { AlertCircle, Clock, ChevronLeft } from 'lucide-react';

interface UrgentBannerProps {
  announcements: Announcement[];
  onSelectAnnouncement?: (announcement: Announcement) => void;
}

export default function UrgentBanner({ announcements, onSelectAnnouncement }: UrgentBannerProps) {
  const urgent = announcements.find((a) => a.urgency === 'عاجل جداً' && a.is_active);
  if (!urgent) return null;

  let timeRemaining = '';
  if (urgent.event_date) {
    const diffTime = new Date(urgent.event_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      timeRemaining = 'الموعد اليوم';
    } else if (diffDays === 1) {
      timeRemaining = 'الموعد غداً';
    } else {
      timeRemaining = `متبقي ${diffDays} أيام`;
    }
  }

  return (
    <div className="bg-[#151208] border-b border-amber-900/40 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-300">تنبيه أكاديمي:</span>
          <span className="text-slate-200 font-medium line-clamp-1">{urgent.title}</span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {timeRemaining && (
            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </span>
          )}
          {onSelectAnnouncement && (
            <button
              onClick={() => onSelectAnnouncement(urgent)}
              className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-0.5 transition-colors"
            >
              <span>عرض التفاصيل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
