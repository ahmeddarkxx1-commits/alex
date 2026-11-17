'use client';

import React, { useState, useEffect } from 'react';
import { AcademicYear, SemesterNumber, SectionNumber, StudentUser } from '@/types/database';
import { saveCurrentStudent, getSavedStudentAccounts, loginStudentApi } from '@/lib/dataService';
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
  User,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Send
} from 'lucide-react';

interface SurveyingLandingPageProps {
  onStudentRegistered: (student: StudentUser) => void;
  onExploreAsGuest?: () => void;
}

export default function SurveyingLandingPage({
  onStudentRegistered,
  onExploreAsGuest,
}: SurveyingLandingPageProps) {
  // Mode: 'register' (new student) | 'login' (existing student)
  const [formMode, setFormMode] = useState<'register' | 'login'>('register');

  // Registration Form State
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [phone, setPhone] = useState('');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('الفرقة الأولى');
  const [semesterNumber, setSemesterNumber] = useState<SemesterNumber>(1);
  const [sectionNumber, setSectionNumber] = useState<SectionNumber>('سكشن 1');

  // Login Form State
  const [loginQuery, setLoginQuery] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Saved accounts on device
  const [savedAccounts, setSavedAccounts] = useState<StudentUser[]>([]);

  useEffect(() => {
    const accounts = getSavedStudentAccounts();
    setSavedAccounts(accounts);
  }, []);

  const handleSelectYear = (year: AcademicYear) => {
    setAcademicYear(year);
    if (year === 'الفرقة الأولى') {
      setSemesterNumber(1);
    } else {
      setSemesterNumber(3);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent: StudentUser = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      student_code: studentCode.trim() || undefined,
      phone: phone.trim() || undefined,
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginQuery.trim()) return;

    setLoginLoading(true);
    setLoginError('');

    try {
      const student = await loginStudentApi(loginQuery.trim());
      onStudentRegistered(student);
    } catch (err: any) {
      setLoginError(err.message || 'لم يتم العثور على طالب بهذه البيانات. يمكنك إنشاء حساب جديد بالأسفل.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSelectSaved = (student: StudentUser) => {
    const saved = saveCurrentStudent(student);
    onStudentRegistered(saved);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
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
        {/* Big Display Headline */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#2b1a07] tracking-tight leading-[1.15]">
            المنصة الأكاديمية لشعبة <br />
            <span className="marker-highlight inline-block mt-1">المساحة العامة</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#171717]/80 max-w-2xl mx-auto leading-relaxed pt-2 font-medium">
            بوابة رقمية مخصصة لطلاب شعبة المساحة. قم بتسجيل فرقتك وترمك لفتح المقررات الدراسية الـ 8 المخصصة لفصلك، وجداول السكاشن والشيتات الحقلية فوراً.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              setFormMode('register');
              scrollToSection('auth-section');
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-extrabold text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#2b1a07]" />
            <span>تسجيل طالب جديد والدخول لموادي</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setFormMode('login');
              scrollToSection('auth-section');
            }}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] font-bold text-sm border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-[#ff6f1e]" />
            <span>تسجيل الدخول لطالب مسجل مسبقاً</span>
          </button>

          {onExploreAsGuest && (
            <button
              onClick={onExploreAsGuest}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] font-bold text-sm border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#ff6f1e]" />
              <span>تصفح المواد والجدول كزائر ←</span>
            </button>
          )}
        </div>

        {/* Surveying Badges Row */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            📐 أجهزة الميزان والثيودوليت
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            🗺️ الخرائط المساحية والطبوغرافية
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            📋 شيتات وتكليفات حقلية
          </span>
          <span className="px-3 py-1 rounded-full bg-[#f7efe9] border-[1px] border-[#171717]/40 font-bold text-[#2b1a07]">
            🎓 محتوى مخصص حسب الفرقة والترم
          </span>
        </div>
      </section>

      {/* ==================================================== */}
      {/* 2. AUTHENTICATION & REGISTRATION SECTION (#auth-section) */}
      {/* ==================================================== */}
      <section id="auth-section" className="max-w-3xl mx-auto px-4 scroll-mt-20">
        <div className="bg-[#f7efe9] border-[2px] border-[#171717] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] space-y-6">
          
          {/* Header & Tabs */}
          <div className="border-b-[1.5px] border-[#171717]/15 pb-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ff6f1e]">
                <span>• بوابة الدخول الرسمية لشعبة المساحة</span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center bg-[#fdfbf9] p-1 rounded-full border-[1.5px] border-[#171717]">
                <button
                  type="button"
                  onClick={() => setFormMode('register')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    formMode === 'register'
                      ? 'bg-[#171717] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                      : 'text-[#171717] hover:text-[#ff6f1e]'
                  }`}
                >
                  تسجيل طالب جديد
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode('login')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    formMode === 'login'
                      ? 'bg-[#171717] text-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                      : 'text-[#171717] hover:text-[#ff6f1e]'
                  }`}
                >
                  تسجيل الدخول
                </button>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
              {formMode === 'register'
                ? 'سجل فرقتك وترمك لفتح مقرراتك وجدولك فقط'
                : 'تسجيل الدخول السريع بالاسم أو رقم الكود'}
            </h2>
            <p className="text-xs sm:text-sm text-[#171717]/70">
              {formMode === 'register'
                ? 'اختر سنتك وترمك وسكشنك، وسيفتح الموقع فوراً على الـ 8 مواد وجدول وسكاشن فصلك الحالي فقط دون أي تشتت.'
                : 'أدخل اسمك المسجل أو كود الطالب المسجل به مسبقاً لاسترجاع مقرراتك وجدولك مباشرة.'}
            </p>
          </div>

          {/* FORM: REGISTER NEW STUDENT */}
          {formMode === 'register' ? (
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
                        16 مادة (8 بالترم)
                      </span>
                    </div>
                    <div className="text-xs text-[#171717]/70">
                      تشمل الفصل الدراسي الأول أو الفصل الدراسي الثاني
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
                        16 مادة (8 بالترم)
                      </span>
                    </div>
                    <div className="text-xs text-[#171717]/70">
                      تشمل الفصل الدراسي الثالث أو الفصل الرابع والتخرج
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
                      className={`p-3.5 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
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
                      className={`p-3.5 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
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
                      className={`p-3.5 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
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
                      className={`p-3.5 rounded-[10px] border-[1.5px] text-center transition-all cursor-pointer ${
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
          ) : (
            /* FORM: LOGIN EXISTING STUDENT */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border-[1.5px] border-red-500 rounded-[8px] text-xs font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  اسم الطالب أو كود الطالب أو رقم الموبايل: <span className="text-[#ff6f1e]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  placeholder="أدخل اسمك أو كود الطالب (مثال: محمد أحمد أو 20241001)"
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-extrabold text-sm border-[1.5px] border-[#171717] shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4 text-[#ff6f1e]" />
                  <span>{loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول وفتح موادي'}</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setFormMode('register')}
                  className="text-xs font-bold text-[#ff6f1e] hover:underline cursor-pointer"
                >
                  ليس لديك حساب مسجل بعد؟ اضغط هنا لإنشاء حساب طالب جديد ←
                </button>
              </div>
            </form>
          )}

        </div>
      </section>

      {/* ==================================================== */}
      {/* 3. SURVEYING SPECIALTIES & FEATURES (No Course Dumping) */}
      {/* ==================================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b1a07]">
            ما تقدمه المنصة الأكاديمية لطلاب شعبة المساحة
          </h2>
          <p className="text-xs sm:text-sm text-[#171717]/70">
            تغطية شاملة للتدريب والتمارين الحقلية ومذكرات المعهد الرسمية
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
      {/* 4. OFFICIAL TELEGRAM CHANNELS (YEAR 1 & YEAR 2 SEPARATED) */}
      {/* ==================================================== */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#ff6f1e]">
            <Send className="w-4 h-4" />
            <span>قنوات التليجرام الرسمية المستقلة للدفعات</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
            قنوات منفصلة للفرقة الأولى والفرقة الثانية
          </h2>
          <p className="text-xs sm:text-sm text-[#171717]/70">
            لكل فرقة قناتها الخاصة لضمان وصول التنبيهات والشيتات الخاصة بها دون أي اختلاط
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Year 1 Channel Card */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#2b1a07]">📘 قناة الفرقة الأولى (سنة أولى)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdfbf9] border border-[#171717]">
                  الفصل 1 و 2
                </span>
              </div>
              <p className="text-xs text-[#171717]/80 leading-relaxed">
                مخصصة لطلاب سنة أولى: شيتات الميزانية، اختبار الوتدين، مواعيد تسليم رسومات الهندسة الوصفية وتنبيهات المعامل.
              </p>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_YEAR1_LINK || 'https://t.me/iti_alex_surveying_year1'}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-bold text-xs text-center border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#ff6f1e]" />
              <span>انضمام لقناة الفرقة الأولى (تليجرام) ←</span>
            </a>
          </div>

          {/* Year 2 Channel Card */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-5 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-base text-[#2b1a07]">📙 قناة الفرقة الثانية (سنة التخرج)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border border-[#171717]">
                  الفصل 3 و 4
                </span>
              </div>
              <p className="text-xs text-[#171717]/80 leading-relaxed">
                مخصصة لطلاب سنة ثانية: مشاريع التخرج، خرائط الجيوديسيا ونظم GIS، شيتات مساحة الأنفاق والمساحة التصويرية.
              </p>
            </div>

            <a
              href={process.env.NEXT_PUBLIC_TELEGRAM_YEAR2_LINK || 'https://t.me/iti_alex_surveying_year2'}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-black text-xs text-center border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>انضمام لقناة الفرقة الثانية (تليجرام) ←</span>
            </a>
          </div>
        </div>
      </section>

      {/* Safety & System Guarantee */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <div className="p-4 rounded-[14px] bg-[#fdfbf9] border-[1.5px] border-[#171717]/20 flex items-center justify-center gap-2 text-xs text-[#171717]/70 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#ff6f1e]" />
          <span>منصة معتمدة - جميع المقررات والجداول مطابقة للائحة المعهد الفني الصناعي بالإسكندرية (وزارة التعليم العالي)</span>
        </div>
      </section>
    </div>
  );
}
