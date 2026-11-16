'use client';

import React from 'react';
import { Subject, Resource } from '@/types/database';
import { X, FileText, Download, Clock, ChevronLeft } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0F1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0B0F19]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-900/60 px-2 py-0.5 rounded">
                {subject.code}
              </span>
              <span className="text-xs text-slate-400">
                {subject.semester} • {subject.academic_year}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
              {subject.name_ar}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Instructor & Info */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-slate-200">
              المحاضر: {subject.instructor_name || 'هيئة التدريس'}
            </p>
            <p className="text-slate-400 leading-relaxed">
              {subject.description || 'مقرر دراسي معتمد بقسم المساحة العامة بالمعهد الفني الصناعي بالإسكندرية.'}
            </p>
          </div>

          {/* Resources List */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3">
              الملفات والمذكرات المرفوعة للمادة ({subjectResources.length}):
            </h3>

            {subjectResources.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 p-6 space-y-1.5">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">لا توجد ملفات مرفوعة لهذه المادة حالياً</p>
                <p className="text-[11px] text-slate-400">يتم رفع التلخيصات والشيتات تباعاً من خلال مندوب الدفعة.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subjectResources.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(res.type)}`}>
                          {res.type}
                        </span>
                        {res.week_number && (
                          <span className="text-[11px] text-slate-400">
                            الأسبوع {res.week_number}
                          </span>
                        )}
                        {res.due_date && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
                            <Clock className="w-3 h-3" />
                            تسليم: {new Date(res.due_date).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {res.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {res.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenResource(res);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                      >
                        <span>قراءة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {res.file_url && (
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="تحميل الملف"
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
