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
import { Search, BookOpen, Calendar, Clock, Bookmark, Layers } from 'lucide-react';

export default function SurveyingPortal() {
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

  useEffect(() => {
    async function updateSemesterData() {
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

  const handleSelectSemester = (sem: SemesterNumber) => {
    setActiveSemester(sem);
    setSelectedSubjectFilter('all');
    saveUserPreferences({ 
      semesterNumber: sem, 
      academicYear: sem <= 2 ? 'الفرقة الأولى' : 'الفرقة الثانية' 
    });
  };

  const handleSelectSection = (sec: SectionNumber) => {
    setActiveSection(sec);
    saveUserPreferences({ sectionNumber: sec });
  };

  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmark(id);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const getSemesterLabel = (sem: SemesterNumber) => {
    switch (sem) {
      case 1: return 'الفصل الدراسي الأول';
      case 2: return 'الفصل الدراسي الثاني';
      case 3: return 'الفصل الدراسي الثالث';
      case 4: return 'الفصل الدراسي الرابع';
    }
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
    <div className="min-h-screen flex flex-col space-y-6 pb-16 bg-[#0B0F19]">
      {/* Top Academic Notification Banner */}
      <UrgentBanner 
        announcements={announcements} 
        onSelectAnnouncement={() => setActiveTab('deadlines')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-2">
        {/* Clean Academic Page Header (Dignified, no glowing bloat) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-400">
              المعهد الفني الصناعي بالإسكندرية
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              شعبة المساحة العامة
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              المقررات الدراسية والمحاضرات والشيتات والتكليفات العملية لجميع الفصول الدراسية.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start md:self-auto">
            <span className="font-semibold text-slate-300">32 مقرراً دراسياً</span>
            <span>•</span>
            <span>4 فصول دراسية</span>
          </div>
        </div>

        {/* 4 Semesters Selector Controller */}
        <SemesterSelector
          activeSemester={activeSemester}
          activeSection={activeSection}
          onSelectSemester={handleSelectSemester}
          onSelectSection={handleSelectSection}
          totalCoursesCount={subjects.length}
        />

        {/* LMS Academic Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المقررات الدراسية ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الملخصات والشيتات ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'schedules'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>الجدول الدراسي ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'deadlines'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواعيد التسليم ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>المحفوظات ({bookmarks.length})</span>
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: COURSES GRID */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
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

        {/* ---------------------------------------------------- */}
        {/* TAB 2: RESOURCES FEED */}
        {/* ---------------------------------------------------- */}
        {(activeTab === 'resources' || activeTab === 'bookmarks') && (
          <div className="space-y-4">
            {/* Search & Subject Filter Bar */}
            <div className="bg-[#0F1422] border border-slate-800 p-3.5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث في المذكرات والشيتات والمحاضرات..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs sm:text-sm rounded-xl py-2 pr-9 pl-3 text-white placeholder-slate-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-64">
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs rounded-xl py-2 px-3 text-slate-300 focus:outline-none cursor-pointer"
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
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedTypeFilter === type
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources List */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 bg-[#0F1422] rounded-2xl border border-slate-800 p-6 space-y-2">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-300">لا توجد مذكرات أو شيتات مطابقة</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTypeFilter('الكل');
                    setSelectedSubjectFilter('all');
                  }}
                  className="text-xs text-blue-400 hover:underline"
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
            activeYear={getSemesterLabel(activeSemester)}
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
    </div>
  );
}
