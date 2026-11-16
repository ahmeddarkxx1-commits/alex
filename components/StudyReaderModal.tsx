'use client';

import React, { useState } from 'react';
import { Resource } from '@/types/database';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Clock, 
  ExternalLink,
  BookOpen,
  Calendar,
  Share2
} from 'lucide-react';

interface StudyReaderModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function StudyReaderModal({ resource, onClose }: StudyReaderModalProps) {
  const [copied, setCopied] = useState(false);

  if (!resource) return null;

  const handleCopy = () => {
    const textToCopy = `${resource.title}\n\n${resource.summary}\n\n${resource.content_markdown}`;
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

  // Convert basic markdown format (headers, lists, bold) for nice display
  const renderFormattedContent = (content: string) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-lg font-bold text-cyan-300 mt-4 mb-2 pb-1 border-b border-cyan-900/40">
            {paragraph.replace('### ', '')}
          </h4>
        );
      }
      if (paragraph.startsWith('#### ')) {
        return (
          <h5 key={idx} className="text-base font-bold text-emerald-300 mt-3 mb-1.5">
            {paragraph.replace('#### ', '')}
          </h5>
        );
      }
      if (paragraph.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-r-4 border-amber-400 bg-amber-500/10 p-3 rounded-l-xl text-amber-200 text-sm my-3 font-medium">
            {paragraph.replace('> ', '')}
          </blockquote>
        );
      }

      // Format bullets or regular paragraphs
      const lines = paragraph.split('\n');
      if (lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
        return (
          <ul key={idx} className="list-disc list-inside space-y-1.5 text-slate-300 text-sm sm:text-base leading-relaxed mr-2 my-2">
            {lines.map((line, lIdx) => (
              <li key={lIdx} className="leading-relaxed">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className="text-slate-200 text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-line font-normal">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-surface border border-border/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden glass-panel"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-border/70 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-brand-cyan">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400">
                {resource.type} • {resource.subject?.name_ar}
              </span>
              <p className="text-xs text-slate-400">
                {resource.department?.name_ar} ({resource.academic_year})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="نسخ الشرح"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="مشاركة"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:flex"
              title="طباعة"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {/* Main Title & Meta */}
          <div className="space-y-3 border-b border-border/60 pb-5">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {resource.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">إعداد / نشر: {resource.author_name}</span>
              {resource.week_number && <span>• المحاضرة / الأسبوع {resource.week_number}</span>}
              {resource.due_date && (
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  موعد التسليم: {new Date(resource.due_date).toLocaleDateString('ar-EG')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Summary Card */}
          {resource.summary && (
            <div className="bg-slate-900/90 border border-border/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-extrabold text-cyan-400 block mb-1">الخلاصة السريعة:</span>
              <p>{resource.summary}</p>
            </div>
          )}

          {/* Formatted Markdown Content */}
          <div className="prose prose-invert max-w-none space-y-3 font-sans">
            {renderFormattedContent(resource.content_markdown || 'لا يوجد شرح تفصيلي مكتوب.')}
          </div>

          {/* PDF Viewer / Attachment Box */}
          {resource.file_url && (
            <div className="mt-6 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-900/60 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">ملف PDF مرفق</h4>
                  <p className="text-xs text-slate-400">ملف جاهز للطباعة والتحميل</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={resource.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل ملف PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-xs text-slate-400">
          <span>شعبة المساحة العامة • المعهد الفني الصناعي بالإسكندرية</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

