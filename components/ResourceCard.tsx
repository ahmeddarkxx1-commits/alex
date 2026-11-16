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
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'شيت وتكليف':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'مذكرة سكشن عملي':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'بنك أسئلة وامتحانات':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
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
    <div className="flex flex-col justify-between bg-[#0F1422] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-colors">
      <div>
        {/* Top: Category & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded border ${getBadgeStyle()}`}>
            {resource.type}
          </span>

          <button
            onClick={() => onToggleBookmark(resource.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-400 bg-amber-950/40'
                : 'text-slate-500 hover:text-slate-300'
            }`}
            title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Subject & Semester */}
        <div className="text-xs text-slate-400 font-medium mb-1.5">
          <span className="text-slate-300 font-semibold">{resource.subject?.name_ar}</span>
          {resource.week_number && (
            <span> • الأسبوع {resource.week_number}</span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenReader(resource)}
          className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer leading-snug line-clamp-2 mb-2"
        >
          {resource.title}
        </h3>

        {/* Summary */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {resource.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800/80 space-y-3">
        {resource.due_date && dueText && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
            isDueUrgent ? 'bg-rose-950/40 text-rose-300' : 'bg-slate-900 text-slate-400'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{dueText}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="line-clamp-1">{resource.author_name}</span>
          </div>

          <button
            onClick={() => onOpenReader(resource)}
            className="inline-flex items-center gap-0.5 font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>عرض الملخص</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
