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
      const savedPrefs = getUserPreferences();
      const prefYear = savedPrefs.academicYear || 'الفرقة الأولى';
      const prefSem = savedPrefs.semesterNumber || 1;
      setActiveYear(prefYear);
      setActiveSemester(prefSem);
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
        onSelectAnnouncement={() => setActiveTab('deadlines')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6 pt-2">
        {/* Clean Academic Page Header (Superr Warm Paper Aesthetic) */}
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

          <div className="flex items-center gap-2 text-xs text-[#2b1a07] bg-[#f7efe9] px-3.5 py-1.5 rounded-full border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.15)] self-start md:self-auto font-bold">
            <span className="font-extrabold text-[#2b1a07]">32 مقرراً دراسياً</span>
            <span>•</span>
            <span>4 فصول دراسية</span>
          </div>
        </div>

        {/* 4 Semesters Selector Controller with Year 1 & Year 2 Division */}
        <SemesterSelector
          activeYear={activeYear}
          activeSemester={activeSemester}
          activeSection={activeSection}
          onSelectYear={handleSelectYear}
          onSelectSemester={handleSelectSemester}
          onSelectSection={handleSelectSection}
          totalCoursesCount={subjects.length}
        />

        {/* LMS Academic Navigation Tabs - Superr Pill Style */}
        <div className="flex items-center gap-2 overflow-x-auto border-b-[1.5px] border-[#171717]/15 pb-3 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${
              activeTab === 'courses'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Layers className={`w-4 h-4 ${activeTab === 'courses' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المقررات الدراسية ({subjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${
              activeTab === 'resources'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'resources' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الملخصات والشيتات ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${
              activeTab === 'schedules'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>الجدول الدراسي ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${
              activeTab === 'deadlines'
                ? 'bg-[#171717] text-white border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] border-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'deadlines' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>مواعيد التسليم ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap border-[1.5px] ${
              activeTab === 'bookmarks'
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
                    className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all border-[1.5px] ${
                      selectedTypeFilter === type
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
