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
    <div className="bg-[#f7efe9] border-b-[1.5px] border-[#171717] px-4 py-2.5 text-xs text-[#171717]">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#ff6f1e] text-[#2b1a07] border-[1.5px] border-[#171717] px-2 py-0.5 rounded-[20px] text-[11px] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
            <AlertCircle className="w-3.5 h-3.5" />
            تنبيه
          </span>
          <span className="font-bold text-[#2b1a07] line-clamp-1">{urgent.title}</span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {timeRemaining && (
            <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-[#171717] bg-[#fdfbf9] px-2.5 py-0.5 rounded-[20px] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
              <Clock className="w-3 h-3 text-[#ff6f1e]" />
              {timeRemaining}
            </span>
          )}
          {onSelectAnnouncement && (
            <button
              onClick={() => onSelectAnnouncement(urgent)}
              className="text-[#2b1a07] hover:text-[#ff6f1e] font-bold inline-flex items-center gap-0.5 transition-colors underline decoration-[#ff6f1e] decoration-2 underline-offset-2"
            >
              <span>التفاصيل</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
