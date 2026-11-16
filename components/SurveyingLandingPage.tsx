'use client';

import React, { useState } from 'react';
import { AcademicYear, SemesterNumber, SectionNumber, StudentUser } from '@/types/database';
import { saveCurrentStudent } from '@/lib/dataService';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Ruler, 
  Crosshair, 
  Calendar, 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  ArrowDown, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface SurveyingLandingPageProps {
  onStudentRegistered: (student: StudentUser) => void;
  onExploreCurriculum: () => void;
}

export default function SurveyingLandingPage({
  onStudentRegistered,
  onExploreCurriculum,
}: SurveyingLandingPageProps) {
  // Registration Form State
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('الفرقة الأولى');
  const [semesterNumber, setSemesterNumber] = useState<SemesterNumber>(1);
  const [sectionNumber, setSectionNumber] = useState<SectionNumber>('سكشن 1');

  const handleSelectYear = (year: AcademicYear) => {
    setAcademicYear(year);
    if (year === 'الفرقة الأولى') {
      setSemesterNumber(1);
    } else {
      setSemesterNumber(3);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentUser = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      student_code: studentCode.trim() || undefined,
      department_id: 'dept-surveying',
      department_name: 'شعبة المساحة العامة',
      academic_year: academicYear,
      semester_number: semesterNumber,
      section_number: sectionNumber,
      created_at: new Date().toISOString(),
    };

    const saved = saveCurrentStudent(newStudent);
    onStudentRegistered(saved);
  };

  const scrollToRegister = () => {
    const el = document.getElementById('register-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 py-4">
      {/* ==================================================== */}
      {/* 1. HERO SECTION (Superr Warm Schoolyard Style) */}
      {/* ==================================================== */}
      <section className="relative max-w-5xl mx-auto text-center px-4 space-y-6 pt-4">
        {/* Subtle decorative sticker badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f7efe9] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] text-xs font-bold text-[#2b1a07]">
          <span className="w-2 h-2 rounded-full bg-[#ff6f1e] animate-pulse"></span>
          <span>المعهد الفني الصناعي بالإسكندرية • كامب شيزار والمحرم بك</span>
        </div>

        {/* Big Display Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2b1a07] tracking-tight leading-[1.15]">
            المنصة الأكاديمية لشعبة <br />
            <span className="marker-highlight inline-block mt-1">المساحة العامة</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#171717]/80 max-w-2xl mx-auto leading-relaxed pt-2 font-medium">
            منصتك الدراسية المخصصة لكل ما يخص علوم المساحة: أجهزة الميزان والرفع الحقلي، الخرائط الرقمية، جداول السكاشن، وتسليم التكليفات والشيتات.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={scrollToRegister}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-extrabold text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#2b1a07]" />
            <span>تسجيل كطالب وفتح موادي فوراً</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreCurriculum}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] font-bold text-sm border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#ff6f1e]" />
            <span>استعراض الخطة الدراسية (32 مادة)</span>
          </button>
        </div>

        {/* Surveying Badges Row */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            📐 أجهزة الميزان والثيودوليت
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            🗺️ الرفع المساحي ونظم GIS
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            📋 شيتات وتكليفات حقلية
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            🎓 سنتان دراسيتان (4 فصول)
          </span>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. INTERACTIVE STUDENT REGISTRATION SECTION (#register) */}
      {/* ==================================================== */}
      <section id="register-section" className="max-w-3xl mx-auto px-4 scroll-mt-24">
        <div className="bg-[#f7efe9] border-[2px] border-[#171717] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] space-y-6">
          <div className="border-b-[1.5px] border-[#171717]/15 pb-4 text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ff6f1e] mb-1">
              <span>• بطاقة تسجيل طالب شعبة المساحة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
              سجل فرقتك وترمك لفتح مقرراتك وجدولك فقط
            </h2>
            <p className="text-xs sm:text-sm text-[#171717]/70 mt-1">
              اختر سنتك وترمك وسكشنك، وسيفتح الموقع فوراً على الـ 8 مواد وجدول وسكاشن فصلك الحالي فقط دون أي تشتت.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Student Name & Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  اسم الطالب بالكامل: <span className="text-[#ff6f1e]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف محمود حسن"
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  رقم الكود / رقم الجلوس أو الموبايل:
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="مثال: 20241088 أو 010xxxxxxxx"
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>
            </div>

            {/* Academic Year Selection (Big Tactile Pill Cards) */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                1. اختر سنتك الدراسية (الفرقة): <span className="text-[#ff6f1e]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectYear('الفرقة الأولى')}
                  className={`p-4 rounded-[12px] border-[1.5px] text-right transition-all cursor-pointer ${
                    academicYear === 'الفرقة الأولى'
                      ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-2 ring-[#ff6f1e]'
                      : 'bg-[#fdfbf9]/60 border-[#171717]/40 hover:bg-[#fdfbf9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm sm:text-base text-[#2b1a07]">
                      📘 سنة أولى (الفرقة الأولى)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/30">
                      16 مادة
                    </span>
                  </div>
                  <div className="text-xs text-[#171717]/70">
                    تشمل الفصل الدراسي الأول والفصل الدراسي الثاني
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectYear('الفرقة الثانية')}
                  className={`p-4 rounded-[12px] border-[1.5px] text-right transition-all cursor-pointer ${
                    academicYear === 'الفرقة الثانية'
                      ? 'bg-[#fdfbf9] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-2 ring-[#ff6f1e]'
                      : 'bg-[#fdfbf9]/60 border-[#171717]/40 hover:bg-[#fdfbf9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm sm:text-base text-[#2b1a07]">
                      📙 سنة ثانية (سنة التخرج)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/30">
                      16 مادة
                    </span>
                  </div>
                  <div className="text-xs text-[#171717]/70">
                    تشمل الفصل الدراسي الثالث والفصل الدراسي الرابع
                  </div>
                </button>
              </div>
            </div>

            {/* Exact Semester Selection (Dynamic) */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                2. حدد الترم الحالي بالضبط: <span className="text-[#ff6f1e]">*</span>
              </label>
              {academicYear === 'الفرقة الأولى' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSemesterNumber(1)}
                    className={`p-3 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
                      semesterNumber === 1
                        ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="text-sm font-extrabold">الترم الأول</div>
                    <div className="text-xs opacity-80 mt-0.5">الفصل الدراسي الأول (8 مواد)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSemesterNumber(2)}
                    className={`p-3 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
                      semesterNumber === 2
                        ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="text-sm font-extrabold">الترم الثاني</div>
                    <div className="text-xs opacity-80 mt-0.5">الفصل الدراسي الثاني (8 مواد)</div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSemesterNumber(3)}
                    className={`p-3 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
                      semesterNumber === 3
                        ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="text-sm font-extrabold">الترم الأول لسنة 2</div>
                    <div className="text-xs opacity-80 mt-0.5">الفصل الدراسي الثالث (8 مواد)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSemesterNumber(4)}
                    className={`p-3 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
                      semesterNumber === 4
                        ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="text-sm font-extrabold">ترم التخرج</div>
                    <div className="text-xs opacity-80 mt-0.5">الفصل الدراسي الرابع (8 مواد)</div>
                  </button>
                </div>
              )}
            </div>

            {/* Section Selection */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-2">
                3. اختر السكشن / المجموعة: <span className="text-[#ff6f1e]">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {(['سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4', 'عام'] as SectionNumber[]).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSectionNumber(sec)}
                    className={`py-2 px-2 rounded-full border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                      sectionNumber === sec
                        ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit & Enter Portal Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-black text-base border-[1.5px] border-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>دخول المنصة وعرض موادي وترمي المخصص الآن 🚀</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. SURVEYING SPECIALTIES & FEATURES */}
      {/* ==================================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b1a07]">
            ما تقدمه المنصة لطلاب شعبة المساحة
          </h2>
          <p className="text-xs sm:text-sm text-[#171717]/70">
            تغطية شاملة لكافة المتطلبات الأكاديمية والتمارين الحقلية طوال العام
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[14px] p-5 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#f7efe9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#2b1a07]">
              الأجهزة المساحية الحقلية
            </h3>
            <p className="text-xs text-[#171717]/80 leading-relaxed">
              شرح تفصيلي لأجهزة الميزان، الثيودوليت، البوصلة، ومعايرة خط التسديد في أرض الرفع المساحي.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[14px] p-5 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#f7efe9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#2b1a07]">
              الخرائط الرقمية ونظم GIS
            </h3>
            <p className="text-xs text-[#171717]/80 leading-relaxed">
              تطبيقات المساحة التصويرية، إسقاط الخرائط الجيولوجية، ونظم المعلومات الجغرافية والمساحة الرقمية.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[14px] p-5 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#f7efe9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#2b1a07]">
              جدول المحاضرات والسكاشن
            </h3>
            <p className="text-xs text-[#171717]/80 leading-relaxed">
              مواعيد منظمة لكل فرقة وسكشن بالمدرجات وصالات الرسم المساحي والمعامل الحقلية.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[14px] p-5 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-[#f7efe9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-[#2b1a07]">
              تسليم الشيتات والتكليفات
            </h3>
            <p className="text-xs text-[#171717]/80 leading-relaxed">
              متابعة مواعيد تسليم شيتات الميزانيات، حسابات الكميات، ورسومات المساقط الهندسية أولاً بأول.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 4. CURRICULUM PREVIEW (32 ACCREDITED SUBJECTS) */}
      {/* ==================================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
              الخطة الدراسية المعتمدة (32 مقرراً عبر سنتين)
            </h2>
            <p className="text-xs text-[#171717]/70 mt-0.5">
              مقسمة بواقع 16 مادة لسنة أولى و 16 مادة لسنة ثانية
            </p>
          </div>

          <button
            onClick={onExploreCurriculum}
            className="text-xs font-extrabold text-[#ff6f1e] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض كافة المواد بالتفصيل</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Year 1 Box */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-5 space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-[#171717]/15 pb-2">
              <div className="font-black text-[#2b1a07] text-base">
                🎓 سنة أولى (الفرقة الأولى)
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdfbf9] border-[1px] border-[#171717]">
                16 مادة
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#fdfbf9] rounded-[8px] border-[1px] border-[#171717]/30">
                <span className="font-extrabold text-[#ff6f1e] block mb-1">الفصل الأول (8 مواد):</span>
                <span className="text-[#171717]/80 leading-relaxed">
                  أجهزة مساحية • تطبيقات مساحه مستويه • رسم فني • مساحه مستويه • رياضيات • تكنولوجيا المعلومات • لغة انجليزية • السلامة المهنية
                </span>
              </div>

              <div className="p-2.5 bg-[#fdfbf9] rounded-[8px] border-[1px] border-[#171717]/30">
                <span className="font-extrabold text-[#ff6f1e] block mb-1">الفصل الثاني (8 مواد):</span>
                <span className="text-[#171717]/80 leading-relaxed">
                  مساحة جيوديسية • تطبيقات مساحة جيوديسية • تك معلومات متقدمة • كميات ومواصفات • قوانين وتشريعات تخصصية • نظرية الأخطاء • رسم تخصصي • تصنيف تربة ومحاصيل
                </span>
              </div>
            </div>
          </div>

          {/* Year 2 Box */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-5 space-y-3">
            <div className="flex items-center justify-between border-b-[1.5px] border-[#171717]/15 pb-2">
              <div className="font-black text-[#2b1a07] text-base">
                🎓 سنة ثانية (الفرقة الثانية - تخرج)
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#fdfbf9] border-[1px] border-[#171717]">
                16 مادة
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-[#fdfbf9] rounded-[8px] border-[1px] border-[#171717]/30">
                <span className="font-extrabold text-[#ff6f1e] block mb-1">الفصل الثالث (8 مواد):</span>
                <span className="text-[#171717]/80 leading-relaxed">
                  مساحة انفاق • مقدمة رسم بالحاسب • مساحة تصويرية • تطبيقات مساحة تصويرية • اسقاط خرائط • مساحة طبوغرافية • تطبيقات مساحة طبوغرافية • خرائط جيوليجية
                </span>
              </div>

              <div className="p-2.5 bg-[#fdfbf9] rounded-[8px] border-[1px] border-[#171717]/30">
                <span className="font-extrabold text-[#ff6f1e] block mb-1">الفصل الرابع - التخرج (8 مواد):</span>
                <span className="text-[#171717]/80 leading-relaxed">
                  نظم معلومات • المساحة التصويرية الرقمية • تطبيقات الرسم المساحى بالحاسب • حساب مساحى • كتابة التقارير الفنية • كارتوجرافى • لغة انجليزية تخصصية • مشروع وثقافة العمل الحر
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
