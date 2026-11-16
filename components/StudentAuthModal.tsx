'use client';

import React, { useState, useEffect } from 'react';
import { 
  Department, 
  AcademicYear, 
  SemesterNumber, 
  SectionNumber, 
  StudentUser 
} from '@/types/database';
import { 
  getDepartments, 
  saveCurrentStudent, 
  getSavedStudentAccounts 
} from '@/lib/dataService';
import { 
  X, 
  GraduationCap, 
  User, 
  Phone, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Users
} from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (student: StudentUser) => void;
  initialStudent?: StudentUser | null;
}

export default function StudentAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialStudent,
}: StudentAuthModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<StudentUser[]>([]);
  const [activeMode, setActiveMode] = useState<'create' | 'saved'>(initialStudent ? 'create' : 'create');

  // Form Fields
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [departmentId, setDepartmentId] = useState('dept-surveying');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('الفرقة الأولى');
  const [semesterNumber, setSemesterNumber] = useState<SemesterNumber>(1);
  const [sectionNumber, setSectionNumber] = useState<SectionNumber>('سكشن 1');

  useEffect(() => {
    async function loadData() {
      const depts = await getDepartments();
      setDepartments(depts);
      const accounts = getSavedStudentAccounts();
      setSavedAccounts(accounts);
      if (!initialStudent && accounts.length > 0) {
        setActiveMode('saved');
      }
    }
    loadData();
  }, [initialStudent]);

  useEffect(() => {
    if (initialStudent) {
      setName(initialStudent.name);
      setStudentCode(initialStudent.student_code || '');
      setDepartmentId(initialStudent.department_id);
      setAcademicYear(initialStudent.academic_year);
      setSemesterNumber(initialStudent.semester_number);
      setSectionNumber(initialStudent.section_number);
      setActiveMode('create');
    }
  }, [initialStudent]);

  // Adjust semester when academic year changes
  const handleSelectYear = (year: AcademicYear) => {
    setAcademicYear(year);
    if (year === 'الفرقة الأولى') {
      setSemesterNumber(1);
    } else {
      setSemesterNumber(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedDept = departments.find((d) => d.id === departmentId);
    const newStudent: StudentUser = {
      id: initialStudent?.id || `student-${Date.now()}`,
      name: name.trim(),
      student_code: studentCode.trim() || undefined,
      department_id: departmentId,
      department_name: selectedDept?.name_ar || 'شعبة المساحة العامة',
      academic_year: academicYear,
      semester_number: semesterNumber,
      section_number: sectionNumber,
      created_at: initialStudent?.created_at || new Date().toISOString(),
    };

    const saved = saveCurrentStudent(newStudent);
    onSuccess(saved);
    onClose();
  };

  const handleSelectSavedAccount = (account: StudentUser) => {
    const saved = saveCurrentStudent(account);
    onSuccess(saved);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.15)] overflow-hidden my-8 animate-fade-in text-right"
        dir="rtl"
      >
        {/* Header Ribbon */}
        <div className="bg-[#f7efe9] border-b-[1.5px] border-[#171717] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <GraduationCap className="w-5 h-5 text-[#ff6f1e]" />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-[#ff6f1e]">
                • تخصيص الحساب والمزامنة الفورية
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#2b1a07]">
                {initialStudent ? 'تعديل بيانات الحساب والترم' : 'إنشاء حساب طالب جديد'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-[1.5px] border-[#171717] bg-[#fdfbf9] hover:bg-[#f7efe9] flex items-center justify-center text-[#171717] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector (if saved accounts exist) */}
        {!initialStudent && savedAccounts.length > 0 && (
          <div className="px-5 pt-4 flex gap-2">
            <button
              onClick={() => setActiveMode('create')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border-[1.5px] transition-all cursor-pointer ${
                activeMode === 'create'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
              }`}
            >
              تسجيل حساب جديد
            </button>
            <button
              onClick={() => setActiveMode('saved')}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border-[1.5px] transition-all cursor-pointer ${
                activeMode === 'saved'
                  ? 'bg-[#171717] text-white border-[#171717]'
                  : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
              }`}
            >
              حسابات مسجلة على هذا الجهاز ({savedAccounts.length})
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {activeMode === 'saved' && savedAccounts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#171717]/70 font-medium">
                اختر حسابك المسجل مسبقاً للدخول الفوري ومشاهدة مقرراتك وجدولك المخصص:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectSavedAccount(acc)}
                    className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#f7efe9] hover:bg-[#fdfbf9] border-[1.5px] border-[#171717] text-right transition-all shadow-[0_1px_2px_rgba(0,0,0,0.1)] group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#fdfbf9] border-[1px] border-[#171717] flex items-center justify-center font-black text-xs text-[#ff6f1e]">
                        {acc.academic_year === 'الفرقة الأولى' ? '1' : '2'}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-[#2b1a07] group-hover:text-[#ff6f1e] transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-[#171717]/70">
                          {acc.department_name || 'شعبة المساحة العامة'} • {acc.academic_year} (الترم {acc.semester_number}) • {acc.section_number}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#171717] rotate-180 group-hover:-translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveMode('create')}
                  className="text-xs font-bold text-[#ff6f1e] hover:underline cursor-pointer"
                >
                  + تسجيل طالب جديد أو تغيير البيانات
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    اسم الطالب ثلاثي: <span className="text-[#ff6f1e]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#171717]/50" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: أحمد محمود إبراهيم"
                      className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] py-2 pr-9 pl-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#ff6f1e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    رقم الكود / رقم الجلوس أو الموبايل:
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#171717]/50" />
                    <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder="مثال: 20241052 أو 010xxxxxxxx"
                      className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] py-2 pr-9 pl-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#ff6f1e]"
                    />
                  </div>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  الشعبة التخصصية: <span className="text-[#ff6f1e]">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ff6f1e]" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] py-2 pr-9 pl-3 text-xs sm:text-sm text-[#171717] font-bold focus:outline-none cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_ar} {d.id === 'dept-surveying' ? '(المنصة الحالية المكتملة)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Academic Year Selection (2 Big Cards) */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  السنة الدراسية (الفرقة): <span className="text-[#ff6f1e]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSelectYear('الفرقة الأولى')}
                    className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer ${
                      academicYear === 'الفرقة الأولى'
                        ? 'bg-[#ff6f1e]/15 border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.15)] ring-2 ring-[#ff6f1e]'
                        : 'bg-[#f7efe9] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">
                      📘 سنة أولى (الفرقة الأولى)
                    </div>
                    <div className="text-[11px] text-[#171717]/70 mt-0.5">
                      الفصل الدراسي 1 و 2
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectYear('الفرقة الثانية')}
                    className={`p-3 rounded-[10px] border-[1.5px] text-right transition-all cursor-pointer ${
                      academicYear === 'الفرقة الثانية'
                        ? 'bg-[#ff6f1e]/15 border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.15)] ring-2 ring-[#ff6f1e]'
                        : 'bg-[#f7efe9] border-[#171717]/40 hover:bg-[#fdfbf9]'
                    }`}
                  >
                    <div className="font-extrabold text-xs sm:text-sm text-[#2b1a07]">
                      📙 سنة ثانية (سنة التخرج)
                    </div>
                    <div className="text-[11px] text-[#171717]/70 mt-0.5">
                      الفصل الدراسي 3 و 4
                    </div>
                  </button>
                </div>
              </div>

              {/* Exact Semester Selection (Dynamic according to Year) */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  الترم الدراسي الحالي بالضبط: <span className="text-[#ff6f1e]">*</span>
                </label>
                {academicYear === 'الفرقة الأولى' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSemesterNumber(1)}
                      className={`p-2.5 rounded-[8px] border-[1.5px] text-center transition-all cursor-pointer ${
                        semesterNumber === 1
                          ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                          : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">الترم الأول</div>
                      <div className="text-[10px] opacity-80">الفصل الدراسي الأول</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSemesterNumber(2)}
                      className={`p-2.5 rounded-[8px] border-[1.5px] text-center transition-all cursor-pointer ${
                        semesterNumber === 2
                          ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                          : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">الترم الثاني</div>
                      <div className="text-[10px] opacity-80">الفصل الدراسي الثاني</div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSemesterNumber(3)}
                      className={`p-2.5 rounded-[8px] border-[1.5px] text-center transition-all cursor-pointer ${
                        semesterNumber === 3
                          ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                          : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">الترم الأول لسنة 2</div>
                      <div className="text-[10px] opacity-80">الفصل الدراسي الثالث</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSemesterNumber(4)}
                      className={`p-2.5 rounded-[8px] border-[1.5px] text-center transition-all cursor-pointer ${
                        semesterNumber === 4
                          ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                          : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/40 hover:bg-[#f7efe9]'
                      }`}
                    >
                      <div className="text-xs font-extrabold">ترم التخرج</div>
                      <div className="text-[10px] opacity-80">الفصل الدراسي الرابع</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Section Number Selection */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  السكشن / المجموعة: <span className="text-[#ff6f1e]">*</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-xs">
                  {(['سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4', 'عام'] as SectionNumber[]).map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSectionNumber(sec)}
                      className={`py-1.5 px-2 rounded-full border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        sectionNumber === sec
                          ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                          : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/30 hover:bg-[#f7efe9]'
                      }`}
                    >
                      {sec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-extrabold text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#2b1a07]" />
                  <span>حفظ الحساب وفتح مقرراتي المخصصة فقط</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
