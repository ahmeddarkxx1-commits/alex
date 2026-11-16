'use client';

import React from 'react';
import { Resource } from '@/types/database';
import { Bookmark, Clock, User, ChevronLeft } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onOpenReader: (resource: Resource) => void;
}

export default function ResourceCard({
  resource,
  isBookmarked,
  onToggleBookmark,
  onOpenReader,
}: ResourceCardProps) {
  const getBadgeStyle = () => {
    switch (resource.type) {
      case 'تلخيص محاضرة':
        return 'bg-[#f7efe9] text-[#2b1a07] border-[#171717]';
      case 'شيت وتكليف':
        return 'bg-[#ff6f1e]/20 text-[#ce500a] border-[#171717]';
      case 'مذكرة سكشن عملي':
        return 'bg-[#22c55e]/15 text-[#171717] border-[#171717]';
      case 'بنك أسئلة وامتحانات':
        return 'bg-[#3b82f6]/15 text-[#171717] border-[#171717]';
      default:
        return 'bg-[#f7efe9] text-[#171717] border-[#171717]';
    }
  };

  let dueText = '';
  let isDueUrgent = false;
  if (resource.due_date) {
    const diffTime = new Date(resource.due_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      dueText = 'انتهى موعد التسليم';
    } else if (diffDays === 0) {
      dueText = 'التسليم اليوم';
      isDueUrgent = true;
    } else if (diffDays === 1) {
      dueText = 'التسليم غداً';
      isDueUrgent = true;
    } else {
      dueText = `متبقي ${diffDays} أيام`;
      isDueUrgent = diffDays <= 3;
    }
  }

  return (
    <div className="flex flex-col justify-between bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all">
      <div>
        {/* Top: Category Tag & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-bold px-3 py-0.5 rounded-[20px] border-[1.5px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${getBadgeStyle()}`}>
            {resource.type}
          </span>

          <button
            onClick={() => onToggleBookmark(resource.id)}
            className={`p-1.5 rounded-[20px] border-[1px] transition-colors ${
              isBookmarked
                ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717]'
                : 'bg-[#f7efe9] text-[#171717]/60 border-[#171717]/30 hover:text-[#171717]'
            }`}
            title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#2b1a07]' : ''}`} />
          </button>
        </div>

        {/* Subject & Week */}
        <div className="text-xs text-[#2b1a07]/70 font-semibold mb-1.5">
          <span className="text-[#2b1a07] font-bold">{resource.subject?.name_ar}</span>
          {resource.week_number && (
            <span> • المحاضرة {resource.week_number}</span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenReader(resource)}
          className="text-base font-black text-[#2b1a07] hover:text-[#ff6f1e] transition-colors cursor-pointer leading-snug line-clamp-2 mb-2"
        >
          {resource.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-[#171717]/80 leading-relaxed line-clamp-2 mb-4 font-normal">
          {resource.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t-[1.5px] border-[#171717]/15 space-y-3">
        {resource.due_date && dueText && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-xs font-bold border-[1.5px] border-[#171717] ${
            isDueUrgent ? 'bg-[#ff6f1e]/20 text-[#ce500a]' : 'bg-[#f7efe9] text-[#2b1a07]'
          }`}>
            <Clock className="w-3.5 h-3.5 text-[#ff6f1e]" />
            <span>{dueText}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#171717]/70">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#ff6f1e]" />
            <span className="line-clamp-1 font-semibold">{resource.author_name}</span>
          </div>

          <button
            onClick={() => onOpenReader(resource)}
            className="btn-pill inline-flex items-center gap-0.5 !py-1 !px-3 text-xs"
          >
            <span>قراءة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
