'use client';

import React from 'react';
import { Announcement } from '@/types/database';
import { AlertTriangle, Clock, ChevronLeft } from 'lucide-react';

interface UrgentBannerProps {
  announcements: Announcement[];
  onSelectAnnouncement?: (announcement: Announcement) => void;
}

export default function UrgentBanner({ announcements, onSelectAnnouncement }: UrgentBannerProps) {
  const urgent = announcements.find((a) => a.urgency === 'عاجل جداً' && a.is_active);
  if (!urgent) return null;

  // Calculate days remaining if event_date exists
  let timeRemaining = '';
  if (urgent.event_date) {
    const diffTime = new Date(urgent.event_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      timeRemaining = 'الموعد اليوم أو انتهى';
    } else if (diffDays === 1) {
      timeRemaining = 'عاجل: غداً آخر موعد';
    } else {
      timeRemaining = `متبقي ${diffDays} أيام`;
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border-y border-rose-500/30 px-4 py-2.5 sm:py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            تنبيه عاجل
          </span>
          <p className="text-xs sm:text-sm font-semibold text-rose-100 line-clamp-1">
            {urgent.title}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
          {timeRemaining && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-200 bg-black/40 px-2 py-0.5 rounded border border-rose-500/20">
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </span>
          )}
          {onSelectAnnouncement && (
            <button
              onClick={() => onSelectAnnouncement(urgent)}
              className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-300 hover:text-white transition-colors"
            >
              <span>تفاصيل الإعلان</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
