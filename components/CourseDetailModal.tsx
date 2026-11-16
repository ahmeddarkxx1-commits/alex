'use client';

import React from 'react';
import { Subject, Resource } from '@/types/database';
import { 
  X, 
  BookOpen, 
  FileText, 
  FileCheck, 
  Download, 
  Clock, 
  ChevronLeft, 
  Sparkles,
  User,
  Layers,
  HelpCircle
} from 'lucide-react';

interface CourseDetailModalProps {
  subject: Subject | null;
  resources: Resource[];
  onClose: () => void;
  onOpenResource: (resource: Resource) => void;
}

export default function CourseDetailModal({
  subject,
  resources,
  onClose,
  onOpenResource,
}: CourseDetailModalProps) {
  if (!subject) return null;

  const subjectResources = resources.filter((r) => r.subject_id === subject.id);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'تلخيص محاضرة':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'شيت وتكليف':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'مذكرة سكشن عملي':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'بنك أسئلة وامتحانات':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0C1222] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full">
                  {subject.code}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {subject.semester} • {subject.academic_year}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {subject.name_ar}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Course Instructor & Description */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <User className="w-4 h-4" />
              <span>المحاضر المسؤول: {subject.instructor_name || 'هيئة تدريس المعهد'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {subject.description || 'مقرر دراسي معتمد بقسم المساحة العامة والخرائط بالمعهد الفني الصناعي بالإسكندرية.'}
            </p>
          </div>

          {/* Resources List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>الملفات والملخصات والشيتات المرفوعة ({subjectResources.length}):</span>
              </h3>
            </div>

            {subjectResources.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 p-6 space-y-2">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">لم يتم رفع ملخصات لهذه المادة بعد</h4>
                <p className="text-xs text-slate-400">
                  يمكن لمندوب الدفعة أو الأدمن رفع المحاضرات والشيتات الخاصة بهذه المادة من لوحة التحكم.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectResources.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-4 transition-all hover:bg-slate-900"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${getBadgeStyle(res.type)}`}>
                          {res.type}
                        </span>
                        {res.week_number && (
                          <span className="text-[11px] text-slate-400 font-semibold">
                            الأسبوع {res.week_number}
                          </span>
                        )}
                        {res.due_date && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                            <Clock className="w-3 h-3" />
                            تسليم: {new Date(res.due_date).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {res.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {res.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenResource(res);
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-colors shadow-md"
                      >
                        <span>فتح وقراءة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {res.file_url && (
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="تحميل PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>شعبة المساحة العامة • المعهد الفني الصناعي بالإسكندرية</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
