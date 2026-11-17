'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Subject, Resource } from '@/types/database';
import { X, FileText, Download, Clock, ChevronLeft, Link2, Check } from 'lucide-react';

interface CourseDetailModalProps {
  subject: Subject | null;
  resources: Resource[];
  onClose: () => void;
  onOpenResource: (resource: Resource) => void;
  onCopyLink?: (link: string, title: string) => void;
}

export default function CourseDetailModal({
  subject,
  resources,
  onClose,
  onOpenResource,
  onCopyLink,
}: CourseDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (subject) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [subject]);

  if (!mounted || !subject) return null;

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

  const portalTarget = typeof document !== 'undefined'
    ? (document.getElementById('portal-root') || document.body)
    : null;

  if (!portalTarget) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 w-screen h-screen min-h-[100dvh] z-[9999999] flex items-center justify-center p-3 sm:p-6 bg-[#171717]/85 backdrop-blur-md animate-fade-in cursor-pointer overflow-y-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100dvh', zIndex: 9999999 }}
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden cursor-default my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-[1.5px] border-[#171717] bg-[#f7efe9] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2b1a07] bg-[#fdfbf9] border-[1.5px] border-[#171717] px-2.5 py-0.5 rounded-[8px]">
                {subject.code}
              </span>
              <span className="text-xs text-[#2b1a07]/70 font-semibold">
                {subject.semester} • {subject.academic_year}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-[#2b1a07] mt-1.5">
              {subject.name_ar}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                const origin = typeof window !== 'undefined' ? window.location.origin : 'https://survey.nexoura.org';
                const link = `${origin}/?course=${subject.code}`;
                navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
                if (onCopyLink) {
                  onCopyLink(link, `مقرر ${subject.name_ar} (${subject.code})`);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#fdfbf9] hover:bg-[#ff6f1e] text-[#171717] hover:text-[#2b1a07] border-[1.5px] border-[#171717] text-xs font-bold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] cursor-pointer"
              title="نسخ رابط المادة المباشر"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Link2 className="w-3.5 h-3.5 text-[#ff6f1e]" />}
              <span className="hidden sm:inline">{copiedLink ? 'تم نسخ الرابط ✓' : 'نسخ رابط المادة 🔗'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.15)] cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
            className="btn-pill !py-1 !px-4 text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
