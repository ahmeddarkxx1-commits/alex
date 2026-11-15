'use client';

import React from 'react';
import { Resource } from '@/types/database';
import { 
  FileText, 
  Bookmark, 
  Eye, 
  Clock, 
  Calendar, 
  User, 
  Download, 
  ChevronLeft, 
  FileCheck,
  HelpCircle,
  Wrench,
  Pin
} from 'lucide-react';

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
  // Determine badge style according to type
  const getTypeBadge = () => {
    switch (resource.type) {
      case 'تلخيص محاضرة':
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        };
      case 'شيت وتكليف':
        return {
          icon: <FileCheck className="w-3.5 h-3.5" />,
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      case 'مذكرة سكشن عملي':
        return {
          icon: <Wrench className="w-3.5 h-3.5" />,
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'بنك أسئلة وامتحانات':
        return {
          icon: <HelpCircle className="w-3.5 h-3.5" />,
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        };
      default:
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          classes: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        };
    }
  };

  const badge = getTypeBadge();

  // Due date countdown logic
  let dueText = '';
  let isDueUrgent = false;
  if (resource.due_date) {
    const diffTime = new Date(resource.due_date).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      dueText = 'انتهى موعد التسليم';
      isDueUrgent = false;
    } else if (diffDays === 0) {
      dueText = 'عاجل: التسليم اليوم!';
      isDueUrgent = true;
    } else if (diffDays === 1) {
      dueText = 'عاجل: غداً آخر موعد تسليم';
      isDueUrgent = true;
    } else {
      dueText = `متبقي ${diffDays} أيام على التسليم`;
      isDueUrgent = diffDays <= 3;
    }
  }

  return (
    <div className={`relative flex flex-col justify-between bg-surface border rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-950/20 group ${
      resource.is_pinned 
        ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-surface' 
        : 'border-border hover:border-slate-700'
    }`}>
      {/* Pinned Pin Indicator */}
      {resource.is_pinned && (
        <div className="absolute -top-2.5 right-4 bg-brand-cyan text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-md">
          <Pin className="w-3 h-3 fill-slate-950" />
          <span>مثبت بالأعلى</span>
        </div>
      )}

      {/* Header: Type Badge & Bookmark button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.classes}`}>
            {badge.icon}
            {resource.type}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBookmark(resource.id)}
              aria-label="حفظ في المفضلة"
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subject & Department Info */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
          <span className="text-cyan-400 font-bold">
            {resource.subject?.name_ar || 'مادة تخصصية'}
          </span>
          <span>•</span>
          <span>{resource.academic_year}</span>
          {resource.week_number && (
            <>
              <span>•</span>
              <span>الأسبوع {resource.week_number}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenReader(resource)}
          className="text-base sm:text-lg font-bold text-slate-100 hover:text-brand-cyan transition-colors cursor-pointer leading-snug line-clamp-2 mb-2"
        >
          {resource.title}
        </h3>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {resource.summary}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-border/60 space-y-3">
        {/* Due date badge if applicable */}
        {resource.due_date && dueText && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
            isDueUrgent 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{dueText}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="line-clamp-1">{resource.author_name}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Eye className="w-3 h-3" />
            <span>{resource.views_count} مشاهدة</span>
          </div>
        </div>

        {/* Primary CTA button */}
        <button
          onClick={() => onOpenReader(resource)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-brand-cyan hover:text-slate-950 text-slate-200 text-xs sm:text-sm font-bold border border-border group-hover:border-cyan-500/40 transition-all duration-200 shadow-sm"
        >
          <span>عرض الشرح والملفات</span>
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
