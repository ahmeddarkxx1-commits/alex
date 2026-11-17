'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Lightbulb, 
  AlertTriangle, 
  Wrench, 
  HelpCircle, 
  Send, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { FeedbackType, StudentUser } from '@/types/database';
import { createFeedback } from '@/lib/dataService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent?: StudentUser | null;
  onSuccessToast?: (msg: string) => void;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  currentStudent,
  onSuccessToast,
}: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('اقتراح');
  const [name, setName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmittedSuccess(false);
      setErrorMessage('');
      if (currentStudent) {
        setName(currentStudent.name);
        if (currentStudent.phone) setContactInfo(currentStudent.phone);
      } else {
        setName('');
        setContactInfo('');
      }
      setTitle('');
      setMessage('');
      setIsAnonymous(false);
    }
  }, [isOpen, currentStudent]);

  if (!isOpen) return null;

  const quickPillClick = (txt: string) => {
    if (!title) {
      setTitle(txt);
    } else {
      setMessage((prev) => (prev ? `${prev}\n- ${txt}` : txt));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('يرجى كتابة عنوان مختصر للرسالة');
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setErrorMessage('يرجى كتابة تفاصيل الشكوى أو الاقتراح بشكل أوضح');
      return;
    }

    setIsSubmitting(true);
    try {
      await createFeedback({
        name: isAnonymous ? 'طالب بالمعهد (فاعل خير / سرّي)' : (name.trim() || 'طالب بالمعهد'),
        student_id: isAnonymous ? null : currentStudent?.id || null,
        contact_info: isAnonymous ? 'سرّي (دون وسيلة تواصل)' : contactInfo.trim(),
        department_name: currentStudent?.department_name || 'شعبة المساحة العامة',
        academic_year: currentStudent?.academic_year || 'شعبة المساحة',
        section_number: currentStudent?.section_number || 'عام',
        type,
        title: title.trim(),
        message: message.trim(),
      });

      setSubmittedSuccess(true);
      if (onSuccessToast) {
        onSuccessToast('تم إرسال رسالتك بنجاح ووصلت للإدارة! 📩');
      }

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] max-w-lg w-full max-h-[92vh] overflow-y-auto overflow-x-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b-[1.5px] border-[#171717]/15 flex items-start justify-between bg-[#f7efe9] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1.5px] border-[#171717] flex items-center justify-center font-black shadow-[0_2px_0_#171717] shrink-0">
              <MessageSquare className="w-5 h-5 text-[#2b1a07]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#2b1a07] tracking-tight">
                صندوق الشكاوى والمقترحات 📬
              </h2>
              <p className="text-xs text-[#171717]/75 font-medium mt-0.5">
                تصل رسالتك مباشرة وبكل سرية إلى إدارة المعهد للمتابعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] text-[#171717] hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-[2px] border-emerald-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-black text-[#2b1a07]">
              تم استلام رسالتك بنجاح! 🎉
            </h3>
            <p className="text-xs text-[#171717]/80 leading-relaxed max-w-sm mx-auto">
              تم استلام رسالتك وتدوينها في لوحة تحكم الإدارة للمتابعة والرد. شكراً لحرصك على التطوير!
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>جاري الإغلاق تلقائياً...</span>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-right">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border-[1.5px] border-rose-500 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Type Selector Pills */}
            <div>
              <label className="block text-xs font-extrabold text-[#2b1a07] mb-2">
                حدد تصنيف الرسالة:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setType('اقتراح')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'اقتراح'
                      ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717] shadow-[0_2px_0_#171717]'
                      : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#2b1a07]" />
                  <span>💡 اقتراح</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('شكوى')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'شكوى'
                      ? 'bg-rose-500 text-white border-[#171717] shadow-[0_2px_0_#171717]'
                      : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>⚠️ شكوى</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('مشكلة تقنية')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'مشكلة تقنية'
                      ? 'bg-sky-500 text-white border-[#171717] shadow-[0_2px_0_#171717]'
                      : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>🔧 مشكلة تقنية</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('استفسار')}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border-[1.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    type === 'استفسار'
                      ? 'bg-purple-600 text-white border-[#171717] shadow-[0_2px_0_#171717]'
                      : 'bg-[#f7efe9] text-[#171717] border-[#171717]/30 hover:border-[#171717]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>❓ استفسار</span>
                </button>
              </div>
            </div>

            {/* Quick Templates Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#171717]/60">مقترحات شائعة:</span>
              {[
                'طلب تلخيص لمادة',
                'تعديل موعد تسليم شيت',
                'مشكلة في فتح ملف PDF',
                'اقتراح ميزة إضافية',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => quickPillClick(tag)}
                  className="px-2 py-0.5 rounded-full bg-[#f7efe9] hover:bg-[#ff6f1e]/20 border-[1px] border-[#171717]/30 text-[10px] font-bold text-[#2b1a07] transition-colors cursor-pointer"
                >
                  + {tag}
                </button>
              ))}
            </div>

            {/* Title / Topic */}
            <div>
              <label className="block text-xs font-extrabold text-[#2b1a07] mb-1">
                عنوان الموضوع: <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  type === 'شكوى'
                    ? 'مثال: مشكلة في مواعيد تسليم شيت المساحة...'
                    : type === 'اقتراح'
                    ? 'مثال: اقتراح إضافة نماذج امتحانات السنوات السابقة...'
                    : type === 'مشكلة تقنية'
                    ? 'مثال: ملف المذكرة لا يحمل على هاتف الأندرويد...'
                    : 'اكتب عنوان استفسارك باختصار...'
                }
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-xl px-3 py-2 text-xs font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#ff6f1e]"
                required
              />
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-extrabold text-[#2b1a07] mb-1">
                تفاصيل الرسالة أو الشكوى بالتفصيل: <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب كل التفاصيل التي تريد إيصالها للإدارة حتى نتمكن من المتابعة وحل المشكلة بأسرع وقت..."
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-xl p-3 text-xs font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#ff6f1e] leading-relaxed resize-none"
                required
              />
              <div className="text-[10px] text-[#171717]/50 text-left mt-0.5 font-mono">
                {message.length} حرف
              </div>
            </div>

            {/* Sender Identity & Privacy Toggle */}
            <div className="bg-[#f7efe9] p-3 rounded-xl border-[1px] border-[#171717]/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#2b1a07] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  <span>بيانات المرسل والتواصل:</span>
                </span>

                <label className="flex items-center gap-1.5 text-xs font-bold text-[#2b1a07] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#ff6f1e] rounded cursor-pointer"
                  />
                  <span>إرسال بهوية مجهولة (سرّي)</span>
                </label>
              </div>

              {!isAnonymous ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#171717]/70 mb-0.5">
                      الاسم:
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك (أو تركه فارغاً)"
                      className="w-full bg-[#fdfbf9] border-[1px] border-[#171717]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#171717]/70 mb-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#ff6f1e]" />
                      <span>رقم الهاتف أو تليجرام (للرد عليك):</span>
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="مثال: 010xxxxxxx أو @telegram"
                      className="w-full bg-[#fdfbf9] border-[1px] border-[#171717]/30 rounded-lg px-2.5 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-[#2b1a07]/80 font-medium flex items-center gap-1.5 bg-[#fdfbf9] p-2 rounded-lg border-[1px] border-[#171717]/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    الوضع السرّي مفعل: لن يتم إرفاق اسمك أو رقمك مع الرسالة للإدارة.
                  </span>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#fdfbf9] hover:bg-[#f7efe9] text-xs font-bold text-[#171717] border-[1.5px] border-[#171717] transition-all cursor-pointer shadow-sm"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#ff6f1e] hover:bg-[#ff6f1e]/85 text-[#2b1a07] text-xs font-black border-[1.5px] border-[#171717] shadow-[0_2px_0_#171717] hover:shadow-none hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#2b1a07] border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#2b1a07]" />
                    <span>إرسال</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
