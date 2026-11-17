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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen z-50 flex items-center justify-center p-3 sm:p-6 bg-[#171717]/65 backdrop-blur-md animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-[1.5px] border-[#171717] bg-[#f7efe9]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2b1a07] bg-[#fdfbf9] border-[1.5px] border-[#171717] px-2.5 py-0.5 rounded-[8px]">
                {subject.code}
              </span>
              <span className="text-xs text-[#2b1a07]/70 font-semibold">
                {subject.semester} • {subject.academic_year}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#2b1a07] mt-1.5">
              {subject.name_ar}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Instructor & Info box */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[12px] p-4 text-xs text-[#171717] space-y-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <p className="font-bold text-[#2b1a07]">
              المحاضر المسؤول: {subject.instructor_name || 'هيئة تدريس المعهد'}
            </p>
            <p className="text-[#171717]/80 leading-relaxed font-normal">
              {subject.description || 'مقرر دراسي معتمد بقسم المساحة العامة بالمعهد الفني الصناعي بالإسكندرية.'}
            </p>
          </div>

          {/* Resources List */}
          <div>
            <h3 className="text-sm font-black text-[#2b1a07] mb-3">
              الملفات والمذكرات المرفوعة للمادة ({subjectResources.length}):
            </h3>

            {subjectResources.length === 0 ? (
              <div className="text-center py-10 bg-[#f7efe9]/50 rounded-[12px] border-[1.5px] border-dashed border-[#171717]/40 p-6 space-y-1.5">
                <FileText className="w-8 h-8 text-[#171717]/40 mx-auto" />
                <p className="text-xs font-bold text-[#2b1a07]">لا توجد ملفات مرفوعة لهذه المادة حالياً</p>
                <p className="text-[11px] text-[#171717]/60">يتم رفع التلخيصات والشيتات تباعاً من خلال مندوب الدفعة.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {subjectResources.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#f7efe9] transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[20px] border-[1px] ${getBadgeStyle(res.type)}`}>
                          {res.type}
                        </span>
                        {res.week_number && (
                          <span className="text-[11px] text-[#2b1a07]/60 font-semibold">
                            الأسبوع {res.week_number}
                          </span>
                        )}
                        {res.due_date && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#ce500a] font-bold">
                            <Clock className="w-3 h-3 text-[#ff6f1e]" />
                            تسليم: {new Date(res.due_date).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-[#2b1a07]">
                        {res.title}
                      </h4>

                      <p className="text-xs text-[#171717]/70 line-clamp-1">
                        {res.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenResource(res);
                        }}
                        className="btn-pill inline-flex items-center gap-1 !py-1 !px-3 text-xs"
                      >
                        <span>قراءة</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      {res.file_url && (
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:text-[#ff6f1e] transition-colors"
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
        <div className="p-4 border-t-[1.5px] border-[#171717] bg-[#f7efe9] flex justify-end">
          <button
            onClick={onClose}
            className="btn-pill !py-1 !px-4 text-xs"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
