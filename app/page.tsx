'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Subject,
  Resource,
  Schedule,
  Announcement,
  AcademicYear,
  SemesterNumber,
  SectionNumber,
  ResourceType,
  StudentUser
} from '@/types/database';
import {
  getSubjects,
  getResources,
  getSchedules,
  getAnnouncements,
  getBookmarks,
  toggleBookmark,
  getUserPreferences,
  saveUserPreferences,
  getCurrentStudent,
  logoutStudent
} from '@/lib/dataService';
import UrgentBanner from '@/components/UrgentBanner';
import SemesterSelector from '@/components/SemesterSelector';
import StudentAuthModal from '@/components/StudentAuthModal';
import SurveyingLandingPage from '@/components/SurveyingLandingPage';
import CourseCard from '@/components/CourseCard';
import CourseDetailModal from '@/components/CourseDetailModal';
import ResourceCard from '@/components/ResourceCard';
import StudyReaderModal from '@/components/StudyReaderModal';
import SchedulesTab from '@/components/SchedulesTab';
import DeadlinesTab from '@/components/DeadlinesTab';
import {
  Search,
  BookOpen,
  Calendar,
  Clock,
  Bookmark,
  Layers,
  GraduationCap,
  Sparkles,
  User,
  Settings,
  LogOut,
  Lock,
  Globe,
  Compass,
  Send
} from 'lucide-react';

export default function SurveyingPortal() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'landing' (for introduction / landing page) | 'portal' (student workspace)
  const [viewMode, setViewMode] = useState<'landing' | 'portal'>('landing');

  // Student Account State
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isPersonalizedOnly, setIsPersonalizedOnly] = useState(true);

  // Active Preferences
  const [activeYear, setActiveYear] = useState<AcademicYear | 'all'>('الفرقة الأولى');
  const [activeSemester, setActiveSemester] = useState<SemesterNumber | 'all'>(1);
  const [activeSection, setActiveSection] = useState<SectionNumber>('عام');

  // Active View Tab: 'courses' | 'resources' | 'schedules' | 'deadlines' | 'bookmarks'
  const [activeTab, setActiveTab] = useState<'courses' | 'resources' | 'schedules' | 'deadlines' | 'bookmarks'>('courses');

  // Resource Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ResourceType | 'الكل'>('الكل');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Modals
  const [selectedCourse, setSelectedCourse] = useState<Subject | null>(null);
  const [readingResource, setReadingResource] = useState<Resource | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const student = getCurrentStudent();
      if (student) {
        setCurrentStudent(student);
        setActiveYear(student.academic_year);
        setActiveSemester(student.semester_number);
        setActiveSection(student.section_number);
        setIsPersonalizedOnly(true);
        setViewMode('portal');
      } else {
        const savedPrefs = getUserPreferences();
        const prefYear = savedPrefs.academicYear || 'الفرقة الأولى';
        const prefSem = savedPrefs.semesterNumber || 1;
        setActiveYear(prefYear);
        setActiveSemester(prefSem);
        setActiveSection(savedPrefs.sectionNumber || 'عام');
        setViewMode('landing');
      }

      setBookmarks(getBookmarks());

      const [anns] = await Promise.all([
        getAnnouncements('dept-surveying'),
      ]);
      setAnnouncements(anns);
      setLoading(false);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    async function updateSemesterData() {
      const [subjs, res, sch] = await Promise.all([
        getSubjects({
          departmentId: 'dept-surveying',
          academicYear: activeYear !== 'all' ? activeYear : undefined,
          semesterNumber: activeSemester !== 'all' ? activeSemester : undefined
        }),
        getResources({
          departmentId: 'dept-surveying',
          academicYear: activeYear !== 'all' ? activeYear : undefined,
          semesterNumber: activeSemester !== 'all' ? activeSemester : undefined
        }),
        getSchedules({
          departmentId: 'dept-surveying',
          academicYear: activeYear !== 'all' ? activeYear : undefined
        }),
      ]);

      setSubjects(subjs);
      setResources(res);
      setSchedules(sch);
    }

    updateSemesterData();
  }, [activeYear, activeSemester]);

  const handleSelectYear = (year: AcademicYear | 'all') => {
    setActiveYear(year);
    if (year === 'الفرقة الأولى') {
      setActiveSemester(1);
      saveUserPreferences({ academicYear: 'الفرقة الأولى', semesterNumber: 1 });
    } else if (year === 'الفرقة الثانية') {
      setActiveSemester(3);
      saveUserPreferences({ academicYear: 'الفرقة الثانية', semesterNumber: 3 });
    } else {
      setActiveSemester('all');
    }
    setSelectedSubjectFilter('all');
  };

  const handleSelectSemester = (sem: SemesterNumber | 'all', year?: AcademicYear) => {
    if (year) {
      setActiveYear(year);
    } else if (sem !== 'all') {
      setActiveYear(sem <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية');
    }
    setActiveSemester(sem);
    setSelectedSubjectFilter('all');
    if (sem !== 'all') {
      saveUserPreferences({
        semesterNumber: sem,
        academicYear: sem <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية'
      });
    }
  };

  const handleSelectSection = (sec: SectionNumber) => {
    setActiveSection(sec);
    saveUserPreferences({ sectionNumber: sec });
  };

  const handleStudentLoginSuccess = (student: StudentUser) => {
    setCurrentStudent(student);
    setActiveYear(student.academic_year);
    setActiveSemester(student.semester_number);
    setActiveSection(student.section_number);
    setIsPersonalizedOnly(true);
    setViewMode('portal');
  };

  const handleStudentLogout = () => {
    logoutStudent();
    setCurrentStudent(null);
    setIsPersonalizedOnly(false);
    setViewMode('landing');
  };

  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmark(id);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const getSemesterLabel = (sem: SemesterNumber | 'all') => {
    switch (sem) {
      case 1: return 'الفصل الدراسي الأول (الترم 1)';
      case 2: return 'الفصل الدراسي الثاني (الترم 2)';
      case 3: return 'الفصل الدراسي الثالث (الترم 1 لسنة ثانية)';
      case 4: return 'الفصل الدراسي الرابع (ترم التخرج)';
      case 'all':
        if (activeYear === 'الفرقة الأولى') return 'سنة أولى كاملة (الترمين الأول والثاني)';
        if (activeYear === 'الفرقة الثانية') return 'سنة ثانية كاملة (الترمين الثالث والرابع)';
        return 'جميع فصول السنتين';
    }
  };

  const getYearLabel = () => {
    if (activeYear === 'الفرقة الأولى') return 'سنة أولى (الفرقة الأولى)';
    if (activeYear === 'الفرقة الثانية') return 'سنة ثانية (الفرقة الثانية - تخرج)';
    return 'السنتين معاً (الفرقة الأولى والثانية)';
  };

  const filteredResources = useMemo(() => {
    let list = resources;

    if (activeTab === 'bookmarks') {
      list = list.filter((r) => bookmarks.includes(r.id));
    }

    if (selectedTypeFilter !== 'الكل') {
      list = list.filter((r) => r.type === selectedTypeFilter);
    }

    if (selectedSubjectFilter !== 'all') {
      list = list.filter((r) => r.subject_id === selectedSubjectFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          (r.subject?.name_ar && r.subject.name_ar.toLowerCase().includes(q)) ||
          (r.author_name && r.author_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [resources, activeTab, bookmarks, selectedTypeFilter, selectedSubjectFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col space-y-6 pb-16 bg-[#fdfbf9] text-[#171717]">
      {/* Top Academic Notification Banner */}
      <UrgentBanner
        announcements={announcements}
        onSelectAnnouncement={() => {
          setViewMode('portal');
          setActiveTab('deadlines');
        }}
      />

      {/* ==================================================== */}
      {/* ZERO-CONTENT GATE: BEFORE REGISTRATION / LOGIN */}
      {/* ==================================================== */}
      {!currentStudent ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-2">
          <SurveyingLandingPage
            onStudentRegistered={(student) => {
              handleStudentLoginSuccess(student);
            }}
          />
        </div>
      ) : (
        /* ==================================================== */
        /* PORTAL VIEW (PERSONALIZED STUDENT WORKSPACE) */
        /* ==================================================== */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-2">
          {/* Clean Academic Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-[1.5px] border-[#171717]/15 pb-5">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#171717]/70">
                المعهد الفني الصناعي بالإسكندرية
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2b1a07] tracking-tight">
                شعبة <span className="marker-highlight">المساحة العامة</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#171717]/80 max-w-2xl leading-relaxed">
                المقررات الدراسية والمحاضرات والشيتات والتكليفات لجميع الفصول الدراسية.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-xs font-bold text-[#171717] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-[#ff6f1e]" />
                <span>تعديل الفرقة / الترم</span>
              </button>

              <button
                onClick={handleStudentLogout}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-rose-50 text-xs font-bold text-rose-700 border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل خروج</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-[#2b1a07] bg-[#f7efe9] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] font-bold">
                <span className="font-extrabold text-[#2b1a07]">8 مقررات في الفصل الحالي</span>
              </div>
            </div>
          </div>

        {/* ==================================================== */}
        {/* STUDENT ACCOUNT SYNC & PERSONALIZATION CARD */}
        {/* ==================================================== */}
        {currentStudent ? (
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center font-black text-lg text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-black text-[#2b1a07] text-base sm:text-lg">
                    أهلاً، {currentStudent.name}
                  </h2>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1px] border-[#171717]">
                    طالب مفعل
                  </span>
                </div>
                <p className="text-xs text-[#171717]/80 mt-0.5 font-bold">
                  {currentStudent.department_name || 'شعبة المساحة العامة'} • {currentStudent.academic_year} ({getSemesterLabel(currentStudent.semester_number)}) • {currentStudent.section_number}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons for the Student */}
            <div className="flex items-center gap-2 flex-wrap self-end md:self-auto text-xs">
              <button
                onClick={() => {
                  const nextVal = !isPersonalizedOnly;
                  setIsPersonalizedOnly(nextVal);
                  if (nextVal && currentStudent) {
                    setActiveYear(currentStudent.academic_year);
                    setActiveSemester(currentStudent.semester_number);
                    setActiveSection(currentStudent.section_number);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full border-[1.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isPersonalizedOnly
                    ? 'bg-[#171717] text-white border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                    : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9]'
                  }`}
              >
                {isPersonalizedOnly ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#ff6f1e]" />
                    <span>موادي وترمي فقط (8 مواد)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-[#ff6f1e]" />
                    <span>تصفح باقي الفصول</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] border-[1.5px] border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-[#ff6f1e]" />
                <span>تعديل الترم / السكشن</span>
              </button>

              {/* Dedicated Telegram Channel Link for Batch */}
              <a
                href={
                  currentStudent.academic_year === 'الفرقة الأولى'
                    ? (process.env.NEXT_PUBLIC_TELEGRAM_YEAR1_LINK || 'https://t.me/iti_alex_surveying_year1')
                    : (process.env.NEXT_PUBLIC_TELEGRAM_YEAR2_LINK || 'https://t.me/iti_alex_surveying_year2')
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e]/10 text-[#2b1a07] border-[1.5px] border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
                title={currentStudent.academic_year === 'الفرقة الأولى' ? 'قناة تليجرام سنة أولى الرسمية' : 'قناة تليجرام سنة ثانية الرسمية'}
              >
                <Send className="w-3.5 h-3.5 text-[#ff6f1e]" />
                <span>
                  {currentStudent.academic_year === 'الفرقة الأولى' ? 'قناة تليجرام أولى 📲' : 'قناة تليجرام ثانية 📲'}
                </span>
              </a>

              <button
                onClick={handleStudentLogout}
                className="px-3.5 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-rose-50 text-rose-700 border-[1.5px] border-[#171717] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                <GraduationCap className="w-5 h-5 text-[#ff6f1e]" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#2b1a07] text-sm sm:text-base">
                  هل أنت طالب في المعهد الفني الصناعي بالإسكندرية؟
                </h3>
                <p className="text-xs text-[#171717]/70">
                  سجل حسابك وحدد شعبتك وسنتك الدراسية ليفتح الموقع مباشرة على مقرراتك وجدولك وتكليفاتك الخاصة فقط!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-pill inline-flex items-center gap-2 text-xs font-bold whitespace-nowrap cursor-pointer hover:bg-[#ff6f1e] hover:text-[#2b1a07] transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ff6f1e]" />
              <span>تسجيل دخول / إنشاء حساب طالب 🎓</span>
            </button>
          </div>
        )}

        {/* Personalized Mode Status Tag or Full Selector */}
        {currentStudent && isPersonalizedOnly ? (
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f1e]"></span>
              <span className="text-xs font-black text-[#2b1a07]">
                وضع الطالب المخصص: أنت تشاهد الآن فقط الـ 8 مواد وجدول وسكاشن ({currentStudent.academic_year} - {getSemesterLabel(currentStudent.semester_number)})
              </span>
            </div>
            <button
              onClick={() => setIsPersonalizedOnly(false)}
              className="text-xs font-extrabold text-[#ff6f1e] hover:underline cursor-pointer"
            >
              عرض كافة فصول وسنوات المعهد ←
            </button>
          </div>
        ) : (
          /* 4 Semesters Selector Controller with Year 1 & Year 2 Division */
          <SemesterSelector
            activeYear={activeYear}
            activeSemester={activeSemester}
            activeSection={activeSection}
            onSelectYear={handleSelectYear}
            onSelectSemester={handleSelectSemester}
            onSelectSection={handleSelectSection}
            totalCoursesCount={subjects.length}
          />
        )}

        {/* LMS Academic Navigation Tabs - Superr Pill Style */}
        <div className="flex items-center gap-2 overflow-x-auto border-b-[1.5px] border-[#171717]/15 pb-3 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${activeTab === 'courses'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'courses' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المقررات الدراسية ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${activeTab === 'resources'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'resources' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الملخصات والشيتات ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${activeTab === 'schedules'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الجدول الدراسي ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${activeTab === 'deadlines'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'deadlines' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>مواعيد التسليم ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${activeTab === 'bookmarks'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المحفوظات ({bookmarks.length})</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: COURSES GRID */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {activeSemester === 'all' ? (
              /* Grouped by Semester View */
              <div className="space-y-6">
                {[1, 2, 3, 4].map((semNum) => {
                  const semSubjects = subjects.filter((s) => s.semester_number === semNum);
                  if (semSubjects.length === 0) return null;
                  return (
                    <div key={semNum} className="space-y-3 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-between border-b-[1.5px] border-[#171717]/15 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ff6f1e]"></span>
                          <h3 className="font-extrabold text-[#2b1a07] text-base sm:text-lg">
                            {getSemesterLabel(semNum as SemesterNumber)}
                          </h3>
                          <span className="text-xs font-semibold text-[#171717]/60">
                            • {semNum <= 2 ? 'سنة أولى' : 'سنة ثانية'}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f7efe9] text-[#2b1a07] border-[1px] border-[#171717]/40">
                          {semSubjects.length} مواد معتمدة
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        {semSubjects.map((sub) => {
                          const subResources = resources.filter((r) => r.subject_id === sub.id);
                          const subSheets = subResources.filter((r) => r.type === 'شيت وتكليف');
                          return (
                            <CourseCard
                              key={sub.id}
                              subject={sub}
                              resourcesCount={subResources.length}
                              sheetsCount={subSheets.length}
                              onOpenSubject={setSelectedCourse}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single Semester View */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[#171717]/70">
                  <span className="font-bold text-[#2b1a07]">
                    مواد {getSemesterLabel(activeSemester)} ({subjects.length} مواد معتمدة):
                  </span>
                  <span>اضغط على أي مادة لعرض الملفات والشيتات المرفوعة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {subjects.map((sub) => {
                    const subResources = resources.filter((r) => r.subject_id === sub.id);
                    const subSheets = subResources.filter((r) => r.type === 'شيت وتكليف');
                    return (
                      <CourseCard
                        key={sub.id}
                        subject={sub}
                        resourcesCount={subResources.length}
                        sheetsCount={subSheets.length}
                        onOpenSubject={setSelectedCourse}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: RESOURCES FEED */}
        {/* ---------------------------------------------------- */}
        {(activeTab === 'resources' || activeTab === 'bookmarks') && (
          <div className="space-y-4">
            {/* Search & Subject Filter Bar */}
            <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] p-3.5 rounded-[12px] space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#171717]/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في المذكرات والشيتات والمحاضرات..."
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] focus:border-[#ff6f1e] text-xs sm:text-sm rounded-[8px] py-2 pr-9 pl-3 text-[#171717] placeholder-[#171717]/50 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#171717]/60 hover:text-[#171717] font-bold"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-64">
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] text-xs rounded-[8px] py-2 px-3 text-[#171717] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="all">كل مواد الفصل ({subjects.length})</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
                {(
                  [
                    'الكل',
                    'تلخيص محاضرة',
                    'شيت وتكليف',
                    'مذكرة سكشن عملي',
                    'بنك أسئلة وامتحانات',
                  ] as (ResourceType | 'الكل')[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedTypeFilter(type)}
                    className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all border-[1.5px] ${selectedTypeFilter === type
                        ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
                        : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9]'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources List */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 bg-[#f7efe9] rounded-[12px] border-[1.5px] border-[#171717] p-6 space-y-2">
                <BookOpen className="w-8 h-8 text-[#171717]/50 mx-auto" />
                <p className="text-xs font-bold text-[#2b1a07]">لا توجد مذكرات أو شيتات مطابقة</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTypeFilter('الكل');
                    setSelectedSubjectFilter('all');
                  }}
                  className="text-xs text-[#ce500a] font-bold hover:underline"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isBookmarked={bookmarks.includes(res.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenReader={setReadingResource}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: SCHEDULES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'schedules' && (
          <SchedulesTab
            schedules={schedules}
            activeDeptName="شعبة المساحة العامة"
            activeYear={`${getYearLabel()} (${getSemesterLabel(activeSemester)})`}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: DEADLINES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'deadlines' && (
          <DeadlinesTab
            announcements={announcements}
            resourcesWithDueDates={resources}
            onOpenResource={setReadingResource}
          />
        )}
      </div>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        subject={selectedCourse}
        resources={resources}
        onClose={() => setSelectedCourse(null)}
        onOpenResource={setReadingResource}
      />

      {/* Study Reader Modal */}
      <StudyReaderModal
        resource={readingResource}
        onClose={() => setReadingResource(null)}
      />

      {/* Student Account & Onboarding Modal */}
      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleStudentLoginSuccess}
        initialStudent={currentStudent}
      />
    </div>
  );
}
