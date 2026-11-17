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
  DayOfWeek,
  StudentUser
} from '@/types/database';
import {
  getSubjects,
  getResources,
  getResourceById,
  getSubjectByCodeOrId,
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
import ToastNotification, { ToastData } from '@/components/ToastNotification';
import FeedbackModal from '@/components/FeedbackModal';
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
  Send,
  Link2,
  Check,
  MessageSquare
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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

  // Deep linked schedule filters
  const [scheduleDayParam, setScheduleDayParam] = useState<DayOfWeek | 'الكل' | undefined>(undefined);
  const [scheduleSecParam, setScheduleSecParam] = useState<SectionNumber | 'الكل' | undefined>(undefined);

  // Floating Toast Notifications
  const [toast, setToast] = useState<ToastData | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const student = getCurrentStudent();
      let isPortalMode = false;

      if (student) {
        setCurrentStudent(student);
        setActiveYear(student.academic_year);
        setActiveSemester(student.semester_number);
        setActiveSection(student.section_number);
        setIsPersonalizedOnly(true);
        isPortalMode = true;
      } else {
        const savedPrefs = getUserPreferences();
        const prefYear = savedPrefs.academicYear || 'الفرقة الأولى';
        const prefSem = savedPrefs.semesterNumber || 1;
        setActiveYear(prefYear);
        setActiveSemester(prefSem);
        setActiveSection(savedPrefs.sectionNumber || 'عام');
      }

      setBookmarks(getBookmarks());

      const [anns] = await Promise.all([
        getAnnouncements('dept-surveying'),
      ]);
      setAnnouncements(anns);

      // Deep Linking & URL Branching handling
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const courseParam = params.get('course') || params.get('subject');
        const resIdParam = params.get('resId');
        const tabParam = params.get('tab');
        const semParam = params.get('sem');
        const yearParam = params.get('year');
        const deptParam = params.get('dept');

        const dayParam = params.get('day');
        const secParam = params.get('sec');

        if (courseParam || resIdParam || tabParam || semParam || yearParam || deptParam || dayParam || secParam) {
          isPortalMode = true;
        }

        if (dayParam) setScheduleDayParam(dayParam as any);
        if (secParam) setScheduleSecParam(secParam as any);

        if (tabParam && ['courses', 'resources', 'schedules', 'deadlines', 'bookmarks'].includes(tabParam)) {
          setActiveTab(tabParam as any);
          if (['schedules', 'deadlines', 'resources', 'courses'].includes(tabParam)) {
            setTimeout(() => {
              const el = document.getElementById('main-tabs-content');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 300);
          }
        }

        if (tabParam === 'feedback' || tabParam === 'complaints') {
          setShowFeedbackModal(true);
        }

        if (semParam) {
          const sNum = parseInt(semParam, 10);
          if ([1, 2, 3, 4].includes(sNum)) {
            setActiveSemester(sNum as SemesterNumber);
            setActiveYear(sNum <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية');
            setIsPersonalizedOnly(false);
          }
        } else if (yearParam) {
          if (yearParam === '1' || yearParam === 'الفرقة الأولى') {
            setActiveYear('الفرقة الأولى');
            setActiveSemester(1);
            setIsPersonalizedOnly(false);
          } else if (yearParam === '2' || yearParam === 'الفرقة الثانية') {
            setActiveYear('الفرقة الثانية');
            setActiveSemester(3);
            setIsPersonalizedOnly(false);
          }
        }

        if (courseParam) {
          getSubjectByCodeOrId(courseParam).then((sub) => {
            if (sub) {
              setActiveYear(sub.academic_year);
              setActiveSemester(sub.semester_number);
              setIsPersonalizedOnly(false);
              setSelectedCourse(sub);
              showToast(`تم فتح مادة "${sub.name_ar}" (${sub.code}) مباشرة 📚`, 'info');
            }
          });
        }

        if (resIdParam) {
          getResourceById(resIdParam).then((res) => {
            if (res) {
              if (res.subject) {
                setActiveYear(res.subject.academic_year);
                setActiveSemester(res.subject.semester_number);
              }
              setIsPersonalizedOnly(false);
              setReadingResource(res);
              showToast(`تم فتح مستند "${res.title}" مباشرة 📄`, 'info');
            } else {
              showToast('هذا التلخيص أو المستند تم حذفه نهائياً من المنصة ولم يعد متاحاً ⚠️', 'error', 'المحتوى محذوف');
            }
          });
        }
      }

      setViewMode(isPortalMode ? 'portal' : 'landing');
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
          semesterNumber: activeSemester !== 'all' ? activeSemester : undefined,
          reviewStatus: 'approved',
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
    showToast(`أهلاً بك يا ${student.name} في منصة قسم المساحة ✨`, 'success');
  };

  const handleStudentLogout = () => {
    logoutStudent();
    setCurrentStudent(null);
    setIsPersonalizedOnly(false);
    setViewMode('landing');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmark(id);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
    showToast(
      isNowBookmarked ? 'تم حفظ التلخيص في قائمة المفضلة ⭐' : 'تمت إزالة التلخيص من المحفوظات',
      isNowBookmarked ? 'success' : 'info'
    );
  };

  const handleOpenCourse = (subject: Subject) => {
    setSelectedCourse(subject);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('course', subject.code);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCloseCourse = () => {
    setSelectedCourse(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('course');
      url.searchParams.delete('subject');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleOpenResource = (resource: Resource) => {
    setReadingResource(resource);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('resId', resource.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCloseResource = () => {
    setReadingResource(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('resId');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSwitchTab = (tab: 'courses' | 'resources' | 'schedules' | 'deadlines' | 'bookmarks', autoScroll = true) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());

      if (autoScroll) {
        setTimeout(() => {
          const el = document.getElementById('main-tabs-content');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 60);
      }
    }
  };

  const handleCopyDepartmentLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://survey.nexoura.org';
    const link = `${origin}/?dept=surveying`;
    navigator.clipboard.writeText(link);
    showToast('تم نسخ رابط منصة شعبة المساحة بنجاح! جاهز للإرسال للطلاب 📋', 'success');
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
    <div className="min-h-screen flex flex-col space-y-6 pb-16 bg-[#fdfbf9] text-[#171717] relative">
      {/* Floating Modern Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Top Academic Notification Banner */}
      <UrgentBanner
        announcements={announcements}
        onSelectAnnouncement={() => {
          setViewMode('portal');
          handleSwitchTab('deadlines');
        }}
      />

      {/* ==================================================== */}
      {/* ZERO-CONTENT GATE: BEFORE REGISTRATION / LOGIN */}
      {/* ==================================================== */}
      {viewMode === 'landing' && !currentStudent ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-2">
          <SurveyingLandingPage
            onStudentRegistered={(student) => {
              handleStudentLoginSuccess(student);
            }}
            onExploreAsGuest={() => {
              setViewMode('portal');
            }}
          />
        </div>
      ) : (
        /* ==================================================== */
        /* PORTAL VIEW (PERSONALIZED STUDENT WORKSPACE) */
        /* ==================================================== */
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full space-y-3 sm:space-y-4 pt-1 sm:pt-2">
          {currentStudent ? (
            /* ==================================================== */
            /* COMPACT LOGGED-IN STUDENT BAR (MINIMAL VERTICAL CLUTTER) */
            /* ==================================================== */
            <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[14px] p-2.5 sm:px-4 sm:py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-wrap items-center justify-between gap-2.5">
              {/* Student Name & Meta Badges */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center font-black text-xs sm:text-sm text-[#2b1a07] shadow-sm shrink-0">
                  {currentStudent.name.charAt(0)}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm text-[#2b1a07]">
                    أهلاً، {currentStudent.name}
                  </span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] border-[1px] border-[#171717]">
                    {currentStudent.academic_year} • {getSemesterLabel(currentStudent.semester_number)} • {currentStudent.section_number}
                  </span>
                </div>
              </div>

              {/* Compact Action Pills */}
              <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto text-xs">
                {/* Toggle personalized vs browse all */}
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isPersonalizedOnly;
                    setIsPersonalizedOnly(nextVal);
                    if (nextVal && currentStudent) {
                      setActiveYear(currentStudent.academic_year);
                      setActiveSemester(currentStudent.semester_number);
                      setActiveSection(currentStudent.section_number);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full border-[1.5px] font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                    isPersonalizedOnly
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9]'
                  }`}
                  title={isPersonalizedOnly ? 'أنت تشاهد مواد ترمك وسنتك فقط' : 'تصفح كل المواد'}
                >
                  {isPersonalizedOnly ? (
                    <>
                      <Lock className="w-3 h-3 text-[#ff6f1e]" />
                      <span>موادي فقط (8)</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3 h-3 text-[#ff6f1e]" />
                      <span>كل الفصول</span>
                    </>
                  )}
                </button>

                {/* Telegram link */}
                <a
                  href={
                    currentStudent.academic_year === 'الفرقة الأولى'
                      ? (process.env.NEXT_PUBLIC_TELEGRAM_YEAR1_LINK || 'https://t.me/+DDGoyeN4sCI5N2U0')
                      : (process.env.NEXT_PUBLIC_TELEGRAM_YEAR2_LINK || 'https://t.me/+XTuMbMJS0akzN2Nk')
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e]/15 text-[#2b1a07] border-[1.5px] border-[#171717] font-bold text-[11px] shadow-sm transition-all flex items-center gap-1"
                  title="قناة تليجرام الفرقة"
                >
                  <Send className="w-3 h-3 text-[#ff6f1e]" />
                  <span>تليجرام 📲</span>
                </a>

                {/* Copy link */}
                <button
                  type="button"
                  onClick={handleCopyDepartmentLink}
                  className="px-2.5 py-1 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e]/15 text-[#2b1a07] border-[1.5px] border-[#171717] font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  title="نسخ رابط منصة شعبة المساحة"
                >
                  <Link2 className="w-3 h-3 text-[#ff6f1e]" />
                  <span>مشاركة 🔗</span>
                </button>

                {/* Feedback & Complaints button */}
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-2.5 py-1 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e]/15 text-[#2b1a07] border-[1.5px] border-[#171717] font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  title="إرسال شكوى أو مقترح للإدارة"
                >
                  <MessageSquare className="w-3 h-3 text-[#ff6f1e]" />
                  <span>شكاوى ومقترحات 📬</span>
                </button>

                {/* Edit student info */}
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="px-2.5 py-1 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#2b1a07] border-[1.5px] border-[#171717] font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  title="تعديل الترم أو السكشن"
                >
                  <Settings className="w-3 h-3 text-[#ff6f1e]" />
                  <span>تعديل</span>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleStudentLogout}
                  className="px-2.5 py-1 rounded-full bg-[#fdfbf9] hover:bg-rose-50 text-rose-700 border-[1.5px] border-[#171717] font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  title="تسجيل خروج"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              </div>
            </div>
          ) : (
            /* Clean Header for Guests */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-3">
              <div>
                <div className="text-xs font-bold text-[#171717]/70">المعهد الفني الصناعي بالإسكندرية</div>
                <h1 className="text-xl sm:text-2xl font-black text-[#2b1a07]">شعبة <span className="marker-highlight">المساحة العامة</span></h1>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-[#ff6f1e] text-[#2b1a07] hover:bg-[#ff6f1e]/85 text-xs font-black border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#2b1a07]" />
                  <span>تسجيل طالب 🎓</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyDepartmentLink}
                  className="px-3 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e] text-xs font-bold text-[#171717] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1"
                >
                  <Link2 className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  <span>نسخ الرابط 🔗</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-3 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#ff6f1e]/15 text-xs font-bold text-[#2b1a07] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] transition-all cursor-pointer flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  <span>الشكاوى والمقترحات 📬</span>
                </button>
              </div>
            </div>
          )}

          {/* Semester Selector only when not a student or when browsing other semesters */}
          {(!currentStudent || !isPersonalizedOnly) && (
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
          <div id="main-tabs-content" className="scroll-mt-16 sm:scroll-mt-20 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto border-b-[1.5px] border-[#171717]/15 pb-3 scrollbar-none text-xs sm:text-sm -mx-2 px-2 touch-pan-x">
          <button
            onClick={() => handleSwitchTab('courses')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] cursor-pointer ${activeTab === 'courses'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'courses' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المقررات الدراسية ({subjects.length})</span>
          </button>

          <button
            onClick={() => handleSwitchTab('resources')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] cursor-pointer ${activeTab === 'resources'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'resources' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الملخصات والشيتات ({resources.length})</span>
          </button>

          <button
            onClick={() => handleSwitchTab('schedules')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] cursor-pointer ${activeTab === 'schedules'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الجدول الدراسي ({schedules.length})</span>
          </button>

          <button
            onClick={() => handleSwitchTab('deadlines')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] cursor-pointer ${activeTab === 'deadlines'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'deadlines' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>مواعيد التسليم ({announcements.length})</span>
          </button>

          <button
            onClick={() => handleSwitchTab('bookmarks')}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] cursor-pointer ${activeTab === 'bookmarks'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
              }`}
          >
            <Bookmark className={`w-4 h-4 ${activeTab === 'bookmarks' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المحفوظات ({bookmarks.length})</span>
          </button>
        </div>
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
                              onOpenSubject={handleOpenCourse}
                              onCopyLink={(s) => showToast(`تم نسخ رابط مقرر "${s.name_ar}" (${s.code}) بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
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
                        onOpenSubject={handleOpenCourse}
                        onCopyLink={(s) => showToast(`تم نسخ رابط مقرر "${s.name_ar}" (${s.code}) بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
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
                    onOpenReader={handleOpenResource}
                    onCopyLink={(r) => showToast(`تم نسخ رابط "${r.title}" بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
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
            initialDay={scheduleDayParam}
            initialSection={scheduleSecParam}
            onCopyLink={(link, title) => showToast(`تم نسخ رابط ${title} بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: DEADLINES */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'deadlines' && (
          <DeadlinesTab
            announcements={announcements}
            resourcesWithDueDates={resources}
            onOpenResource={handleOpenResource}
            onCopyLink={(link, title) => showToast(`تم نسخ رابط ${title} بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
          />
        )}
      </div>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        subject={selectedCourse}
        resources={resources}
        onClose={handleCloseCourse}
        onOpenResource={handleOpenResource}
        onCopyLink={(link, title) => showToast(`تم نسخ رابط ${title} بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
      />

      {/* Study Reader Modal */}
      <StudyReaderModal
        resource={readingResource}
        onClose={handleCloseResource}
        onCopyLink={(link, title) => showToast(`تم نسخ رابط "${title}" بنجاح! جاهز للإرسال للطلاب 📋`, 'success')}
      />

      {/* Student Account & Onboarding Modal */}
      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleStudentLoginSuccess}
        initialStudent={currentStudent}
      />

      {/* Complaints & Suggestions Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        currentStudent={currentStudent}
        onSuccessToast={(msg) => showToast(msg, 'success')}
      />

      {/* Floating Action Button (FAB) for Complaints & Suggestions */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          type="button"
          onClick={() => setShowFeedbackModal(true)}
          className="px-3.5 py-2.5 rounded-full bg-[#2b1a07] text-[#fdfbf9] hover:bg-[#ff6f1e] hover:text-[#2b1a07] border-[2px] border-[#171717] font-black text-xs shadow-[0_4px_16px_rgba(0,0,0,0.25)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="صندوق الشكاوى والمقترحات • تواصل مع الإدارة"
        >
          <MessageSquare className="w-4 h-4 text-[#ff6f1e] group-hover:text-[#2b1a07] transition-colors" />
          <span className="hidden sm:inline">الشكاوى والمقترحات</span>
          <span className="sm:hidden">شكاوى ومقترحات</span>
          <span className="w-2 h-2 rounded-full bg-[#ff6f1e] group-hover:bg-[#2b1a07] animate-pulse"></span>
        </button>
      </div>
    </div>
  );
}
