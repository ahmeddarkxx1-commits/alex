'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Department, 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  AcademicYear, 
  AcademicSemester, 
  SectionNumber, 
  ResourceType 
} from '@/types/database';
import { 
  getDepartments, 
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
import DepartmentSelector from '@/components/DepartmentSelector';
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
  SlidersHorizontal, 
  CheckCircle2, 
  GraduationCap, 
  FileText,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function StudentAcademicHub() {
  // 1. Core State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Active persistent preferences
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-surveying');
  const [selectedYear, setSelectedYear] = useState<AcademicYear>('الفرقة الأولى');
  const [selectedSemester, setSelectedSemester] = useState<AcademicSemester>('الترم الأول');
  const [selectedSection, setSelectedSection] = useState<SectionNumber>('عام');

  // UI State: Active View Tab
  const [activeTab, setActiveTab] = useState<'resources' | 'schedules' | 'deadlines' | 'bookmarks'>('resources');

  // Resource Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ResourceType | 'الكل'>('الكل');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // Modal Reader state
  const [readingResource, setReadingResource] = useState<Resource | null>(null);

  // 2. Initial Data Load & Local Storage Recovery
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      // Load saved preferences
      const savedPrefs = getUserPreferences();
      setSelectedDeptId(savedPrefs.departmentId);
      setSelectedYear(savedPrefs.academicYear);
      setSelectedSemester(savedPrefs.semester);
      setSelectedSection(savedPrefs.sectionNumber);

      // Load bookmark IDs
      setBookmarks(getBookmarks());

      // Fetch data
      const [depts, anns] = await Promise.all([
        getDepartments(),
        getAnnouncements(savedPrefs.departmentId),
      ]);
      setDepartments(depts);
      setAnnouncements(anns);
      setLoading(false);
    }

    loadInitialData();
  }, []);

  // Fetch subjects, resources & schedules when department or year changes
  useEffect(() => {
    async function updateAcademicData() {
      if (!selectedDeptId) return;

      const [subjs, res, sch, anns] = await Promise.all([
        getSubjects(selectedDeptId, selectedYear),
        getResources({ departmentId: selectedDeptId, academicYear: selectedYear }),
        getSchedules({ departmentId: selectedDeptId, academicYear: selectedYear }),
        getAnnouncements(selectedDeptId),
      ]);

      setSubjects(subjs);
      setResources(res);
      setSchedules(sch);
      setAnnouncements(anns);
    }

    updateAcademicData();
  }, [selectedDeptId, selectedYear]);

  // Handle Preference Changes & Persistence
  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedSubjectFilter('all');
    saveUserPreferences({ departmentId: deptId });
  };

  const handleYearChange = (year: AcademicYear) => {
    setSelectedYear(year);
    setSelectedSubjectFilter('all');
    saveUserPreferences({ academicYear: year });
  };

  const handleSemesterChange = (sem: AcademicSemester) => {
    setSelectedSemester(sem);
    saveUserPreferences({ semester: sem });
  };

  const handleSectionChange = (sec: SectionNumber) => {
    setSelectedSection(sec);
    saveUserPreferences({ sectionNumber: sec });
  };

  // Handle Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    const isNowBookmarked = toggleBookmark(id);
    setBookmarks((prev) =>
      isNowBookmarked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  // Filtered Resources for Display
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

  // Department name lookup
  const activeDept = departments.find((d) => d.id === selectedDeptId);
  const activeDeptName = activeDept ? activeDept.name_ar : 'شعبة المساحة العامة';

  return (
    <div className="min-h-screen flex flex-col space-y-6 pb-12">
      {/* 1. Urgent Announcements Top Banner */}
      <UrgentBanner 
        announcements={announcements} 
        onSelectAnnouncement={() => setActiveTab('deadlines')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        {/* 2. Hero Section: Welcome & Institute Motto */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-surface to-slate-900 border border-border p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/10 text-brand-cyan border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنصة الأكاديمية الشاملة لطلاب المعهد</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                المعهد الفني الصناعي بالإسكندرية
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                كل ما تحتاجه للتميز الأكاديمي: تلخيصات المحاضرات، شيتات وتكليفات، مذكرات السكاشن العملية والورش، وجداول الأسبوع التفاعلية مع عداد تنازلي للتسليمات.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-slate-900/80 border border-border/80 p-3 rounded-2xl text-center">
                <span className="block text-xl sm:text-2xl font-black text-brand-cyan font-mono">
                  {subjects.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400">مواد مسجلة</span>
              </div>
              <div className="bg-slate-900/80 border border-border/80 p-3 rounded-2xl text-center">
                <span className="block text-xl sm:text-2xl font-black text-brand-emerald font-mono">
                  {resources.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400">ملخصات وشيتات</span>
              </div>
              <div className="bg-slate-900/80 border border-border/80 p-3 rounded-2xl text-center">
                <span className="block text-xl sm:text-2xl font-black text-brand-amber font-mono">
                  {schedules.length}
                </span>
                <span className="text-[11px] font-bold text-slate-400">محاضرات وسكاشن</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Smart Department & Year Selector */}
        <DepartmentSelector
          departments={departments}
          selectedDeptId={selectedDeptId}
          selectedYear={selectedYear}
          selectedSemester={selectedSemester}
          selectedSection={selectedSection}
          onSelectDept={handleDeptChange}
          onSelectYear={handleYearChange}
          onSelectSemester={handleSemesterChange}
          onSelectSection={handleSectionChange}
        />

        {/* 4. Main Views Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border/80 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'resources'
                ? 'bg-brand-cyan text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المذكرات والشيتات وبنك الأسئلة ({resources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'schedules'
                ? 'bg-brand-emerald text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>جدول المحاضرات والسكاشن والورش ({schedules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'deadlines'
                ? 'bg-brand-amber text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواعيد التسليم والتنبيهات ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>المفضلة المحفوظة ({bookmarks.length})</span>
          </button>
        </div>

        {/* 5. TAB CONTENT: RESOURCES / STUDY HUB */}
        {(activeTab === 'resources' || activeTab === 'bookmarks') && (
          <div className="space-y-6">
            {/* Search Bar & Quick Filters */}
            <div className="bg-surface/80 border border-border p-4 rounded-2xl space-y-3.5">
              <div className="flex flex-col md:flex-row items-center gap-3">
                {/* Search input */}
                <div className="relative w-full flex-1">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في عنوان التلخيص، اسم المادة، أو اسم الدكتور/المهندس..."
                    className="w-full bg-slate-900/90 border border-border focus:border-cyan-500 text-xs sm:text-sm rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-slate-500 focus:outline-none transition-colors"
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

                {/* Filter by Subject dropdown */}
                <div className="w-full md:w-64">
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full bg-slate-900/90 border border-border focus:border-cyan-500 text-xs sm:text-sm rounded-xl py-2.5 px-3 text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900">كل المواد الدراسية</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900">
                        {s.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-slate-400 font-bold ml-1 hidden sm:inline">النوع:</span>
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
                        ? 'bg-slate-100 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-border'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-16 bg-surface/40 rounded-3xl border border-dashed border-border p-8 space-y-3">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">لا توجد ملخصات أو شيتات تطابق هذا البحث</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  جرب تغيير كلمات البحث، أو تصفير الفلاتر لمعاينة جميع المواد المتاحة لـ {activeDeptName}.
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

        {/* 6. TAB CONTENT: SCHEDULES */}
        {activeTab === 'schedules' && (
          <SchedulesTab
            schedules={schedules}
            activeDeptName={activeDeptName}
            activeYear={selectedYear}
          />
        )}

        {/* 7. TAB CONTENT: DEADLINES & ANNOUNCEMENTS */}
        {activeTab === 'deadlines' && (
          <DeadlinesTab
            announcements={announcements}
            resourcesWithDueDates={resources}
            onOpenResource={setReadingResource}
          />
        )}
      </div>

      {/* 8. Study & PDF Reader Modal */}
      <StudyReaderModal
        resource={readingResource}
        onClose={() => setReadingResource(null)}
      />
    </div>
  );
}
