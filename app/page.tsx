'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  SemesterNumber, 
  SectionNumber, 
  ResourceType 
} from '@/types/database';
import { 
  getSubjects, 
  getResources, 
  getSchedules, 
  getAnnouncements, 
  getBookmarks, 
  toggleBookmark, 
  getUserPreferences, 
  saveUserPreferences 
} from '@/lib/dataService';
import UrgentBanner from '@/components/UrgentBanner';
import SemesterSelector from '@/components/SemesterSelector';
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
  Sparkles, 
  Layers, 
  Compass, 
  FileText,
  GraduationCap,
  ChevronLeft,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export default function StudentSurveyingHub() {
  // 1. Core State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Preferences
  const [activeSemester, setActiveSemester] = useState<SemesterNumber>(1);
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

  // 2. Initial Data Loading
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const savedPrefs = getUserPreferences();
      setActiveSemester(savedPrefs.semesterNumber || 1);
      setActiveSection(savedPrefs.sectionNumber || 'عام');
      setBookmarks(getBookmarks());

      const [anns] = await Promise.all([
        getAnnouncements('dept-surveying'),
      ]);
      setAnnouncements(anns);
      setLoading(false);
    }

    loadInitialData();
  }, []);

  // Update subjects, resources and schedules when active semester changes
  useEffect(() => {
    async function updateSemesterData() {
      const year = activeSemester <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية';

      const [subjs, res, sch] = await Promise.all([
        getSubjects({ departmentId: 'dept-surveying', semesterNumber: activeSemester }),
        getResources({ departmentId: 'dept-surveying', semesterNumber: activeSemester }),
        getSchedules({ departmentId: 'dept-surveying', semesterNumber: activeSemester }),
      ]);

      setSubjects(subjs);
      setResources(res);
      setSchedules(sch);
    }

    updateSemesterData();
  }, [activeSemester]);

  // Handle Semester Switch
  const handleSelectSemester = (sem: SemesterNumber) => {
    setActiveSemester(sem);
    setSelectedSubjectFilter('all');
    saveUserPreferences({ semesterNumber: sem, academicYear: sem <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية' });
  };

  const handleSelectSection = (sec: SectionNumber) => {
    setActiveSection(sec);
    saveUserPreferences({ sectionNumber: sec });
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmark(id);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // Semester Titles
  const getSemesterTitle = (sem: SemesterNumber) => {
    switch (sem) {
      case 1: return 'الفصل الدراسي الأول (الفرقة الأولى)';
      case 2: return 'الفصل الدراسي الثاني (الفرقة الأولى)';
      case 3: return 'الفصل الدراسي الثالث (الفرقة الثانية)';
      case 4: return 'الفصل الدراسي الرابع (الفرقة الثانية - التخرج)';
    }
  };

  // Filtered resources for feed view
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
    <div className="min-h-screen flex flex-col space-y-6 pb-16 bg-[#070B14]">
      {/* 1. Urgent Top Announcements Banner */}
      <UrgentBanner 
        announcements={announcements} 
        onSelectAnnouncement={() => setActiveTab('deadlines')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        {/* 2. Hero Section: Surveying Engineering Identity */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#111C33] to-[#0A0F1D] border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-3.5 h-3.5" />
                <span>المعهد الفني الصناعي بالإسكندرية • كامب شيزار والمحرم بك</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                منصة شعبة المساحة العامة والخرائط
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                البوابة الأكاديمية الرسمية المعتمدة لطلاب المساحة العامة: المقررات الـ 32 لجميع الفصول الدراسية، ملخصات المحاضرات، شيتات التكليفات العملية، ومواعيد التسليم وجداول السكاشن.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="block text-2xl font-black text-cyan-400 font-mono">
                  32
                </span>
                <span className="text-[11px] font-bold text-slate-400">مقرراً (سنتين)</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="block text-2xl font-black text-emerald-400 font-mono">
                  {subjects.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400">مواد الفصل الحالي</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-center">
                <span className="block text-2xl font-black text-amber-400 font-mono">
                  {resources.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400">ملخصات وشيتات</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 4-Semester Selector Controller */}
        <SemesterSelector
          activeSemester={activeSemester}
          activeSection={activeSection}
          onSelectSemester={handleSelectSemester}
          onSelectSection={handleSelectSection}
          totalCoursesCount={subjects.length}
        />

        {/* 4. Elegant Main Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800/80 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>المقررات الدراسية الـ 8 ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المذكرات والشيتات وبنك الأسئلة ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
              activeTab === 'schedules'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول المحاضرات والسكاشن والورش ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
              activeTab === 'deadlines'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواعيد التسليم والتنبيهات ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>المفضلة المحفوظة ({bookmarks.length})</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VIEW 1: COURSES GRID (المقررات الدراسية الـ 8) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0F172A]/70 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  المقررات الدراسية المعتمدة لـ {getSemesterTitle(activeSemester)}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  اضغط على أي مادة لاستعراض الشيتات، المحاضرات، دليل المعمل العملي، ونماذج الامتحانات الخاصة بها.
                </p>
              </div>

              <span className="text-xs font-black text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-3 py-1 rounded-xl">
                8 مواد دراسية متوفرة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: RESOURCES & NOTES FEED */}
        {/* ---------------------------------------------------- */}
        {(activeTab === 'resources' || activeTab === 'bookmarks') && (
          <div className="space-y-6">
            {/* Search & Subject Filter Bar */}
            <div className="bg-[#0F172A]/80 border border-slate-800 p-4 rounded-2xl space-y-3.5">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في عنوان التلخيص، اسم المقرر المساحي، أو اسم الدكتور/المحاضر..."
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white font-bold"
                    >
                      مسح
                    </button>
                  )}
                </div>

                {/* Filter by Subject */}
                <div className="w-full md:w-72">
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all">كل مواد الفصل الدراسي ({subjects.length})</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_ar} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-slate-400 font-bold ml-1 hidden sm:inline">التصنيف:</span>
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
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      selectedTypeFilter === type
                        ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A]/40 rounded-3xl border border-dashed border-slate-800 p-8 space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">لا توجد ملخصات أو شيتات تطابق هذا البحث</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  جرب تغيير كلمات البحث أو اختيار مادة أخرى من مواد {getSemesterTitle(activeSemester)}.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTypeFilter('الكل');
                    setSelectedSubjectFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* VIEW 3: SCHEDULES (جدول السكاشن والورش) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'schedules' && (
          <SchedulesTab
            schedules={schedules}
            activeDeptName="شعبة المساحة العامة"
            activeYear={getSemesterTitle(activeSemester)}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 4: DEADLINES (تسليمات الشيتات والتنبيهات) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'deadlines' && (
          <DeadlinesTab
            announcements={announcements}
            resourcesWithDueDates={resources}
            onOpenResource={setReadingResource}
          />
        )}
      </div>

      {/* 5. Course Detail Modal */}
      <CourseDetailModal
        subject={selectedCourse}
        resources={resources}
        onClose={() => setSelectedCourse(null)}
        onOpenResource={setReadingResource}
      />

      {/* 6. Study & PDF Reader Modal */}
      <StudyReaderModal
        resource={readingResource}
        onClose={() => setReadingResource(null)}
      />
    </div>
  );
}
