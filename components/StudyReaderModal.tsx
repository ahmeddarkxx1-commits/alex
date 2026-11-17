'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Resource } from '@/types/database';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Clock, 
  BookOpen, 
  Share2 
} from 'lucide-react';

interface StudyReaderModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function StudyReaderModal({ resource, onClose }: StudyReaderModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (resource) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [resource]);

  if (!mounted || !resource) return null;

  const displayMarkdown = (() => {
    const raw = resource.content_markdown || '';
    if (raw.startsWith('PDF_DATA:::')) {
      const parts = raw.split(':::');
      return parts[2] || '';
    }
    return raw;
  })();

  const handleCopy = () => {
    const textToCopy = `${resource.title}\n\n${resource.summary}\n\n${displayMarkdown}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.summary,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  const renderFormattedContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-lg font-black text-[#2b1a07] mt-5 mb-2 pb-1 border-b-[1.5px] border-[#171717]/20">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-base font-bold text-[#ce500a] mt-4 mb-1.5">
            {paragraph.replace('#### ', '')}
          </h5>
        );
      }
      if (paragraph.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-r-[4px] border-[#ff6f1e] bg-[#f7efe9] p-3.5 rounded-l-[12px] border-[1px] border-[#171717]/20 text-[#2b1a07] text-sm my-3 font-medium">
            {paragraph.replace('> ', '')}
          </blockquote>
        );
      }

      const lines = paragraph.split('\n');
      if (lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1.5 text-[#171717] text-sm sm:text-base leading-relaxed mr-2 my-2">
            {lines.map((line, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className="text-[#171717] text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-line font-normal">
          {paragraph}
        </p>
      );
    });
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-[#171717]/80 backdrop-blur-lg animate-fade-in cursor-pointer"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b-[1.5px] border-[#171717] bg-[#f7efe9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#ff6f1e]">
                {resource.type} • {resource.subject?.name_ar}
              </span>
              <p className="text-xs text-[#2b1a07]/70 font-semibold">
                شعبة المساحة العامة ({resource.academic_year})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors"
              title="نسخ الشرح"
            >
              {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors hidden sm:flex"
              title="طباعة"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[20px] bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-colors"
              title="إغلاق النافذة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          <div className="space-y-2 border-b-[1.5px] border-[#171717]/20 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#2b1a07] leading-tight">
              {resource.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#2b1a07]/70 font-medium">
              <span>إعداد / نشر: {resource.author_name}</span>
              {resource.week_number && <span>• المحاضرة {resource.week_number}</span>}
              {resource.due_date && (
                <span className="inline-flex items-center gap-1 text-[#ce500a] bg-[#ff6f1e]/15 px-2.5 py-0.5 rounded-[20px] border-[1px] border-[#171717] font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  موعد التسليم: {new Date(resource.due_date).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
          </div>

          {resource.summary && (
            <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[12px] p-4 text-xs sm:text-sm text-[#171717] leading-relaxed shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <span className="font-black text-[#2b1a07] block mb-1">الخلاصة:</span>
              <p>{resource.summary}</p>
            </div>
          )}

          <div className="space-y-3 font-sans text-[#171717]">
            {renderFormattedContent(displayMarkdown || 'لا يوجد شرح تفصيلي مكتوب.')}
          </div>

          {resource.file_url && (
            <div className="mt-6 bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[12px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[8px] bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2b1a07] text-sm">ملف PDF مرفق</h4>
                  <p className="text-xs text-[#2b1a07]/60">ملف جاهز للطباعة والتحميل</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill inline-flex items-center justify-center gap-1.5 text-xs w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 text-[#ff6f1e]" />
                  <span>تحميل ملف PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-[1.5px] border-[#171717] bg-[#f7efe9] flex items-center justify-between text-xs text-[#2b1a07]/70 font-medium">
          <span>شعبة المساحة العامة • المعهد الفني الصناعي بالإسكندرية</span>
          <button
            onClick={onClose}
            className="btn-pill !py-1 !px-4 text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
