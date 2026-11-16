'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Department, 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  AdminUser, 
  AcademicYear, 
  ResourceType, 
  DayOfWeek, 
  SectionNumber, 
  SessionType,
  AnnouncementCategory,
  UrgencyLevel
} from '@/types/database';
import { 
  getDepartments, 
  getSubjects, 
  getResources, 
  getSchedules, 
  getAnnouncements, 
  createResource, 
  deleteResource, 
  createSchedule, 
  deleteSchedule, 
  createAnnouncement 
} from '@/lib/dataService';
import { isSupabaseConfigured } from '@/lib/supabase';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  PlusCircle, 
  Calendar, 
  Bell, 
  Database, 
  FileText, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Download, 
  Upload, 
  ArrowRight,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

export default function AdminDashboard() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Data State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'create-resource' | 'schedules' | 'announcements' | 'manage'>('create-resource');

  // Feedback Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tab 1: New Resource Form State
  const [newResDeptId, setNewResDeptId] = useState('');
  const [newResYear, setNewResYear] = useState<AcademicYear>('الفرقة الأولى');
  const [newResSubjectId, setNewResSubjectId] = useState('');
  const [newResType, setNewResType] = useState<ResourceType>('تلخيص محاضرة');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResSummary, setNewResSummary] = useState('');
  const [newResMarkdown, setNewResMarkdown] = useState('');
  const [newResFileUrl, setNewResFileUrl] = useState('');
  const [newResDueDate, setNewResDueDate] = useState('');
  const [newResWeek, setNewResWeek] = useState('3');
  const [notifyTelegram, setNotifyTelegram] = useState(true);
  const [resTgTarget, setResTgTarget] = useState<'year1' | 'year2' | 'both'>('year1');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedPdfName, setUploadedPdfName] = useState('');

  // Tab 2: New Schedule Form State
  const [schDeptId, setSchDeptId] = useState('');
  const [schYear, setSchYear] = useState<AcademicYear>('الفرقة الأولى');
  const [schSubjectId, setSchSubjectId] = useState('');
  const [schDay, setSchDay] = useState<DayOfWeek>('السبت');
  const [schStart, setSchStart] = useState('09:00');
  const [schEnd, setSchEnd] = useState('11:00');
  const [schType, setSchType] = useState<SessionType>('محاضرة نظري');
  const [schSection, setSchSection] = useState<SectionNumber>('عام');
  const [schRoom, setSchRoom] = useState('مدرج 2');
  const [schInstructor, setSchInstructor] = useState('د. إبراهيم عبد العزيز');

  // Tab 3: New Announcement Form State
  const [annDeptId, setAnnDeptId] = useState<string>('all');
  const [annTitle, setAnnTitle] = useState('');
  const [annDetails, setAnnDetails] = useState('');
  const [annCategory, setAnnCategory] = useState<AnnouncementCategory>('تسليم شيت');
  const [annUrgency, setAnnUrgency] = useState<UrgencyLevel>('عاجل جداً');
  const [annDate, setAnnDate] = useState('');
  const [annNotifyTg, setAnnNotifyTg] = useState(true);
  const [annTgTarget, setAnnTgTarget] = useState<'year1' | 'year2' | 'both'>('both');

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Initial Data
  const refreshAllData = async () => {
    const [depts, res, sch, anns] = await Promise.all([
      getDepartments(),
      getResources(),
      getSchedules(),
      getAnnouncements(),
    ]);

    setDepartments(depts);
    setResources(res);
    setSchedules(sch);
    setAnnouncements(anns);

    if (depts.length > 0) {
      if (!newResDeptId) setNewResDeptId(depts[0].id);
      if (!schDeptId) setSchDeptId(depts[0].id);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update subjects dropdown when department or year changes
  useEffect(() => {
    if (!newResDeptId) return;
    getSubjects({ departmentId: newResDeptId, academicYear: newResYear }).then((subs) => {
      setSubjects(subs);
      if (subs.length > 0) {
        setNewResSubjectId(subs[0].id);
        setSchSubjectId(subs[0].id);
      }
    });
  }, [newResDeptId, newResYear]);

  // Login handler
  const handleLogin = (role: 'super' | 'rep') => {
    if (role === 'super') {
      setCurrentUser({
        id: 'admin-super',
        email: 'admin@iti-alex.edu.eg',
        full_name: 'المهندس المشرف (Super Admin)',
        role: 'super_admin',
        assigned_department_id: null,
        created_at: new Date().toISOString(),
      });
      showToast('مرحباً بك! تم تسجيل الدخول بصلاحيات Super Admin كاملة.');
    } else {
      const surveyDept = departments.find((d) => d.slug === 'surveying') || departments[0];
      setCurrentUser({
        id: 'rep-survey',
        email: 'survey-rep@iti-alex.edu.eg',
        full_name: 'مندوب شعبة المساحة العامة',
        role: 'dept_rep',
        assigned_department_id: surveyDept ? surveyDept.id : null,
        created_at: new Date().toISOString(),
      });
      if (surveyDept) {
        setNewResDeptId(surveyDept.id);
        setSchDeptId(surveyDept.id);
      }
      showToast('تم تسجيل الدخول كمندوب لشعبة المساحة العامة.');
    }
  };

  // Broadcast to Telegram Helper
  const triggerTelegramBroadcast = async (payload: any) => {
    try {
      const res = await fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'تم إرسال إشعار فوري لقنوات التليجرام بنجاح!');
      } else {
        showToast(data.message || 'تم تسجيل الإشعار محلياً', 'error');
      }
    } catch (e) {
      console.warn('Telegram broadcast failed', e);
    }
  };

  // Handle PDF Upload with Strict Image Prohibition
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      showToast('❌ غير مسموح برفع الصور! المنصة تعتمد ملفات PDF فقط (.pdf) توفيراً للمساحة وسرعة التصفح لجميع الطلاب.', 'error');
      e.target.value = '';
      return;
    }

    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل في رفع مستند الـ PDF');
      }
      setNewResFileUrl(data.url);
      setUploadedPdfName(data.filename);
      showToast(`تم رفع مستند الـ PDF بنجاح (${data.file_size})!`);
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء رفع الملف', 'error');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Submit New Resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResTitle.trim() || !newResSummary.trim()) {
      showToast('يرجى ملء عنوان التلخيص والملخص السريع', 'error');
      return;
    }

    const dept = departments.find((d) => d.id === newResDeptId);
    const subj = subjects.find((s) => s.id === newResSubjectId);

    const created = await createResource({
      department_id: newResDeptId,
      subject_id: newResSubjectId,
      academic_year: newResYear,
      type: newResType,
      title: newResTitle.trim(),
      summary: newResSummary.trim(),
      content_markdown: newResMarkdown.trim() || newResSummary.trim(),
      file_url: newResFileUrl.trim() || null,
      due_date: newResDueDate ? new Date(newResDueDate).toISOString() : null,
      week_number: Number(newResWeek) || 1,
      author_name: currentUser?.full_name || 'مندوب الشعبة',
      is_pinned: false,
    });

    showToast('تم نشر المحتوى الأكاديمي وحفظه بقاعدة البيانات بنجاح!');

    // Send Telegram broadcast if checked with specific channel (Year 1 or Year 2)
    if (notifyTelegram) {
      triggerTelegramBroadcast({
        type: 'resource',
        title: created.title,
        departmentName: dept?.name_ar || 'شعبة المساحة العامة',
        academicYear: created.academic_year,
        subjectName: subj?.name_ar || '',
        details: created.summary,
        dueDate: created.due_date || undefined,
        resourceType: created.type,
        targetChannel: resTgTarget,
      });
    }

    // Reset Form
    setNewResTitle('');
    setNewResSummary('');
    setNewResMarkdown('');
    setNewResFileUrl('');
    setUploadedPdfName('');
    setNewResDueDate('');
    refreshAllData();
  };

  // Submit New Schedule
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schRoom.trim()) {
      showToast('يرجى كتابة مكان المدرج أو القاعة أو المعمل', 'error');
      return;
    }

    await createSchedule({
      department_id: schDeptId,
      subject_id: schSubjectId,
      academic_year: schYear,
      day_of_week: schDay,
      start_time: schStart,
      end_time: schEnd,
      session_type: schType,
      section_number: schSection,
      location_room: schRoom.trim(),
      instructor_name: schInstructor.trim(),
    });

    showToast('تمت إضافة الفترة الدراسية بنجاح إلى جدول الأسبوع!');
    refreshAllData();
  };

  // Submit New Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annDetails.trim()) {
      showToast('يرجى كتابة عنوان التنبيه والتفاصيل', 'error');
      return;
    }

    const dept = departments.find((d) => d.id === annDeptId);

    const created = await createAnnouncement({
      department_id: annDeptId === 'all' ? null : annDeptId,
      title: annTitle.trim(),
      details: annDetails.trim(),
      category: annCategory,
      urgency: annUrgency,
      event_date: annDate ? new Date(annDate).toISOString() : null,
      is_active: true,
    });

    showToast('تم نشر الإعلان والتنبيه بنجاح!');

    // Broadcast to Telegram
    if (annNotifyTg) {
      triggerTelegramBroadcast({
        type: 'announcement',
        title: created.title,
        departmentName: dept?.name_ar || 'شعبة المساحة العامة',
        details: created.details,
        targetChannel: annTgTarget,
      });
    }

    setAnnTitle('');
    setAnnDetails('');
    setAnnDate('');
    refreshAllData();
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exported_at: new Date().toISOString(),
      departments,
      subjects,
      resources,
      schedules,
      announcements,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iti_alex_hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('تم تحميل ملف النسخة الاحتياطية بنجاح بصيغة JSON!');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.resources) localStorage.setItem('iti_alex_resources', JSON.stringify(json.resources));
        if (json.schedules) localStorage.setItem('iti_alex_schedules', JSON.stringify(json.schedules));
        if (json.announcements) localStorage.setItem('iti_alex_announcements', JSON.stringify(json.announcements));
        showToast('تمت استعادة البيانات بنجاح من ملف النسخة الاحتياطية!');
        refreshAllData();
      } catch {
        showToast('فشل في قراءة ملف JSON، تأكد من صحة الملف', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Delete Resource item
  const handleDeleteResource = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التلخيص/الشيت نهائياً؟')) {
      await deleteResource(id);
      showToast('تم حذف المحتوى بنجاح.');
      refreshAllData();
    }
  };

  // Delete Schedule item
  const handleDeleteSchedule = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الميعاد من الجدول؟')) {
      await deleteSchedule(id);
      showToast('تم حذف الميعاد بنجاح.');
      refreshAllData();
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (If not logged in)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#fdfbf9]">
        <div className="w-full max-w-md bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.08)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center mx-auto text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              <ShieldCheck className="w-8 h-8 text-[#ff6f1e]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
              بوابة إدارة المعهد الفني الصناعي
            </h1>
            <p className="text-xs text-[#171717]/70">
              تسجيل دخول الأدمن ومناديب الشعب الأكاديمية لنشر التلخيصات والشيتات وتحديث الجداول
            </p>
          </div>

          {/* Quick Demo Access Options */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleLogin('super')}
              className="w-full flex items-center justify-between p-3.5 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-bold text-sm shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#ff6f1e]" />
                <span>دخول سريع كـ Super Admin (مؤسس المنصة)</span>
              </div>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>

            <button
              onClick={() => handleLogin('rep')}
              className="w-full flex items-center justify-between p-3.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] border-[1.5px] border-[#171717] text-[#171717] font-bold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#ff6f1e]" />
                <span>دخول سريع كـ مندوب شعبة المساحة العامة</span>
              </div>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#171717]/15 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#171717]/80 hover:text-[#ff6f1e] transition-colors"
            >
              <span>العودة لصفحة الطلاب الرئيسية</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGGED IN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-[#fdfbf9] text-[#171717]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg border-[1.5px] border-[#171717] text-sm font-bold ${
          toast.type === 'success'
            ? 'bg-[#22c55e]/20 text-[#171717]'
            : 'bg-[#ff6f1e]/20 text-[#2b1a07]'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#22c55e]" /> : <AlertCircle className="w-5 h-5 text-[#ce500a]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#f7efe9] border-[1.5px] border-[#171717] p-5 rounded-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center text-[#2b1a07]">
            <ShieldCheck className="w-6 h-6 text-[#ff6f1e]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-[#2b1a07]">
                لوحة تحكم المنصة الأكاديمية
              </h1>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#fdfbf9] text-[#2b1a07] border-[1.5px] border-[#171717]">
                {currentUser.role === 'super_admin' ? 'Super Admin' : 'مندوب شعبة'}
              </span>
            </div>
            <p className="text-xs text-[#171717]/70 mt-0.5">
              مرحباً {currentUser.full_name} ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/"
            className="px-4 py-2 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-xs font-bold text-[#171717] border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all"
          >
            معاينة واجهة الطلاب
          </Link>
          <button
            onClick={() => setCurrentUser(null)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fdfbf9] hover:bg-rose-50 border-[1.5px] border-[#171717] text-rose-700 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* 4 Dashboard Tabs Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveTab('create-resource')}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all ${
            activeTab === 'create-resource'
              ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
          }`}
        >
          <PlusCircle className={`w-4 h-4 ${activeTab === 'create-resource' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
          <span>نشر تلخيص / شيت جديد</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all ${
            activeTab === 'schedules'
              ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
          }`}
        >
          <Calendar className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
          <span>إدارة جدول الفترات</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all ${
            activeTab === 'announcements'
              ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
          }`}
        >
          <Bell className={`w-4 h-4 ${activeTab === 'announcements' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
          <span>نشر تنبيه أو موعد تسليم</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center justify-center gap-2 p-3.5 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all ${
            activeTab === 'manage'
              ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
              : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
          }`}
        >
          <Database className={`w-4 h-4 ${activeTab === 'manage' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
          <span>المحتوى والنسخ الاحتياطي</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CREATE NEW RESOURCE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'create-resource' && (
        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-6">
          <div className="border-b-[1.5px] border-[#171717]/15 pb-4">
            <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#ff6f1e]" />
              <span>نشر تلخيص جديد، شيت مطلوب تسليمه، أو بنك أسئلة</span>
            </h2>
            <p className="text-xs text-[#171717]/70 mt-1">
              سيظهر المحتوى فوراً في واجهة الطلاب مع إمكانية إرسال إشعار تليجرام تلقائي لقناة الدفعة
            </p>
          </div>

          <form onSubmit={handleCreateResource} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">الشعبة الدراسية:</label>
                <select
                  value={newResDeptId}
                  onChange={(e) => setNewResDeptId(e.target.value)}
                  disabled={currentUser.role === 'dept_rep'}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] disabled:opacity-60 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">الفرقة الدراسية:</label>
                <select
                  value={newResYear}
                  onChange={(e) => {
                    const yr = e.target.value as AcademicYear;
                    setNewResYear(yr);
                    setResTgTarget(yr === 'الفرقة الأولى' ? 'year1' : 'year2');
                  }}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] cursor-pointer"
                >
                  <option value="الفرقة الأولى">الفرقة الأولى</option>
                  <option value="الفرقة الثانية">الفرقة الثانية</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">المادة الدراسية:</label>
                <select
                  value={newResSubjectId}
                  onChange={(e) => setNewResSubjectId(e.target.value)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Resource Type */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">نوع المحتوى:</label>
                <select
                  value={newResType}
                  onChange={(e) => setNewResType(e.target.value as ResourceType)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] cursor-pointer"
                >
                  <option value="تلخيص محاضرة">تلخيص محاضرة</option>
                  <option value="شيت وتكليف">شيت وتكليف مطلوب تسليمه</option>
                  <option value="مذكرة سكشن عملي">مذكرة سكشن عملي / ورشة</option>
                  <option value="بنك أسئلة وامتحانات">بنك أسئلة ونماذج امتحانات</option>
                </select>
              </div>

              {/* Week Number */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">رقم المحاضرة / الأسبوع:</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={newResWeek}
                  onChange={(e) => setNewResWeek(e.target.value)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>

              {/* Due Date if Sheet */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">
                  موعد التسليم الأخير (للشيتات والتكليفات):
                </label>
                <input
                  type="date"
                  value={newResDueDate}
                  onChange={(e) => setNewResDueDate(e.target.value)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">عنوان التلخيص / الشيت:</label>
              <input
                type="text"
                required
                value={newResTitle}
                onChange={(e) => setNewResTitle(e.target.value)}
                placeholder="مثال: شرح اختبار الوتدين لجهاز الميزان وقوانين تصحيح التحديب والانكسار"
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">الملخص السريع (يظهر في كارت المعاينة):</label>
              <textarea
                required
                rows={2}
                value={newResSummary}
                onChange={(e) => setNewResSummary(e.target.value)}
                placeholder="اكتب نبذة مختصرة تلخص أهم ما جاء في المحاضرة أو الشيت..."
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
              />
            </div>

            {/* Markdown Explanation */}
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                الشرح الكامل والقوانين وخطوات الحل (Markdown مع دعم المعادلات):
              </label>
              <textarea
                rows={6}
                value={newResMarkdown}
                onChange={(e) => setNewResMarkdown(e.target.value)}
                placeholder="### المحتويات الرئيسية:&#10;1. القانون الرياضي: C = 0.0675 * D^2&#10;2. خطوات المعايرة الميدانية..."
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] font-mono"
              />
            </div>

            {/* PDF File Upload & Attachment (STRICTLY PDF ONLY TO SAVE STORAGE) */}
            <div className="p-4 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1px] border-[#171717]/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#f7efe9] border-[1px] border-[#171717] flex items-center justify-center text-[#ff6f1e]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-[#2b1a07]">
                    مستند المحتوى الأكاديمي (مستندات PDF فقط)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                  <span>🛡️ نظام توفير السعة: PDF فقط (ممنوع الصور)</span>
                </span>
              </div>

              <div className="text-[11px] text-[#171717]/70 leading-relaxed">
                توفيراً لمساحة السيرفر وضماناً لسرعة تحميل وتصفح المواد للطلاب، يسمح برفع مستندات <strong>PDF فقط (.pdf)</strong> بحجم حتى 30 ميجابايت، ويتم حظر الصور والتنسيقات غير المتوافقة تلقائياً.
              </div>

              {/* Direct File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    1. رفع ملف PDF من جهازك:
                  </label>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f7efe9] hover:bg-[#ff6f1e]/10 border-[1.5px] border-dashed border-[#171717] rounded-[8px] cursor-pointer text-xs font-bold text-[#2b1a07] transition-all">
                    <Upload className="w-4 h-4 text-[#ff6f1e]" />
                    <span>{uploadingPdf ? 'جاري رفع ملف الـ PDF...' : 'اختر ملف PDF للرفع 📄'}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={uploadingPdf}
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedPdfName && (
                    <div className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم رفع: {uploadedPdfName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    2. أو رابط ملف PDF خارجي (Google Drive / Direct PDF):
                  </label>
                  <input
                    type="url"
                    value={newResFileUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
                        showToast('❌ غير مسموح بروابط الصور! يرجى إرفاق رابط مستند PDF فقط توفيراً للمساحة.', 'error');
                        return;
                      }
                      setNewResFileUrl(val);
                    }}
                    placeholder="https://.../surveying-sheet.pdf"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
                  />
                </div>
              </div>
            </div>

            {/* Telegram notification toggle & Independent Channel Selection */}
            <div className="p-4 rounded-[12px] bg-[#fdfbf9] border-[1.5px] border-[#171717] space-y-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="notifyTg"
                  checked={notifyTelegram}
                  onChange={(e) => setNotifyTelegram(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ff6f1e] focus:ring-[#ff6f1e] cursor-pointer accent-[#ff6f1e]"
                />
                <label htmlFor="notifyTg" className="text-xs sm:text-sm font-extrabold text-[#2b1a07] cursor-pointer flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#ff6f1e]" />
                  <span>إرسال إشعار فوري لقناة التليجرام الرسمية فور النشر</span>
                </label>
              </div>

              {notifyTelegram && (
                <div className="pt-1 pr-6 space-y-2 border-t-[1px] border-[#171717]/15">
                  <span className="block text-xs font-bold text-[#171717]">
                    اختر القناة المستهدفة بالإشعار:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setResTgTarget('year1')}
                      className={`p-2.5 rounded-[8px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        resTgTarget === 'year1'
                          ? 'bg-[#171717] text-white border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                      }`}
                    >
                      📘 قناة الفرقة الأولى فقط
                    </button>

                    <button
                      type="button"
                      onClick={() => setResTgTarget('year2')}
                      className={`p-2.5 rounded-[8px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        resTgTarget === 'year2'
                          ? 'bg-[#171717] text-white border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                      }`}
                    >
                      📙 قناة الفرقة الثانية فقط
                    </button>

                    <button
                      type="button"
                      onClick={() => setResTgTarget('both')}
                      className={`p-2.5 rounded-[8px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        resTgTarget === 'both'
                          ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40 hover:bg-[#fdfbf9]'
                      }`}
                    >
                      🌐 القناتين معاً (إشعار عام)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-black text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر التلخيص / مستند الـ PDF الآن</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SCHEDULES MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-6">
            <div className="border-b-[1.5px] border-[#171717]/15 pb-4">
              <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#ff6f1e]" />
                <span>إضافة فترة دراسية جديدة (محاضرة نظري / سكشن عملي / ورشة)</span>
              </h2>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">الشعبة:</label>
                  <select
                    value={schDeptId}
                    onChange={(e) => setSchDeptId(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">الفرقة:</label>
                  <select
                    value={schYear}
                    onChange={(e) => setSchYear(e.target.value as AcademicYear)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    <option value="الفرقة الأولى">الفرقة الأولى</option>
                    <option value="الفرقة الثانية">الفرقة الثانية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">اليوم:</label>
                  <select
                    value={schDay}
                    onChange={(e) => setSchDay(e.target.value as DayOfWeek)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    {['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">المادة:</label>
                  <select
                    value={schSubjectId}
                    onChange={(e) => setSchSubjectId(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">نوع الفترة:</label>
                  <select
                    value={schType}
                    onChange={(e) => setSchType(e.target.value as SessionType)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    <option value="محاضرة نظري">محاضرة نظري</option>
                    <option value="سكشن عملي">سكشن عملي</option>
                    <option value="ورشة">ورشة</option>
                    <option value="معمل">معمل</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">الفئة / السكشن:</label>
                  <select
                    value={schSection}
                    onChange={(e) => setSchSection(e.target.value as SectionNumber)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  >
                    <option value="عام">عام (كل الدفعة)</option>
                    <option value="سكشن 1">سكشن 1</option>
                    <option value="سكشن 2">سكشن 2</option>
                    <option value="سكشن 3">سكشن 3</option>
                    <option value="سكشن 4">سكشن 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">وقت البدء:</label>
                  <input
                    type="time"
                    value={schStart}
                    onChange={(e) => setSchStart(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">وقت الانتهاء:</label>
                  <input
                    type="time"
                    value={schEnd}
                    onChange={(e) => setSchEnd(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">المكان بالتفصيل:</label>
                  <input
                    type="text"
                    required
                    value={schRoom}
                    onChange={(e) => setSchRoom(e.target.value)}
                    placeholder="مثال: مدرج 2، صالة الرسم المساحي، معمل المساحة الدقيقة..."
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1.5">اسم الدكتور / المهندس المحاضر:</label>
                  <input
                    type="text"
                    value={schInstructor}
                    onChange={(e) => setSchInstructor(e.target.value)}
                    placeholder="مثال: د. إبراهيم عبد العزيز / م. حسام الدين"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-extrabold text-sm border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-all cursor-pointer"
              >
                إضافة الفترة للجدول
              </button>
            </form>
          </div>

          {/* Current Schedules Table */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <h3 className="font-bold text-[#2b1a07] text-base">قائمة الفترات والمحاضرات المسجلة حالياً ({schedules.length}):</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#f7efe9] text-[#2b1a07] font-bold border-b-[1.5px] border-[#171717]">
                  <tr>
                    <th className="p-3">اليوم</th>
                    <th className="p-3">المادة</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">السكشن</th>
                    <th className="p-3">التوقيت</th>
                    <th className="p-3">المكان</th>
                    <th className="p-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-[#f7efe9]">
                      <td className="p-3 font-bold text-[#171717]">{s.day_of_week}</td>
                      <td className="p-3 text-[#2b1a07] font-bold">{s.subject?.name_ar || 'مادة تخصصية'}</td>
                      <td className="p-3 text-[#171717]">{s.session_type}</td>
                      <td className="p-3 text-[#171717]">{s.section_number}</td>
                      <td className="p-3 font-mono dir-ltr">{s.start_time} - {s.end_time}</td>
                      <td className="p-3 text-[#171717]/80">{s.location_room}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: ANNOUNCEMENTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'announcements' && (
        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-6">
          <div className="border-b-[1.5px] border-[#171717]/15 pb-4">
            <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#ff6f1e]" />
              <span>نشر تنبيه أو موعد تسليم عاجل</span>
            </h2>
            <p className="text-xs text-[#171717]/70 mt-1">
              التنبيهات العاجلة جداً ستظهر في الشريط العلوي للموقع فوراً
            </p>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">توجيه التنبيه إلى:</label>
                <select
                  value={annDeptId}
                  onChange={(e) => setAnnDeptId(e.target.value)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                >
                  <option value="all">إعلان عام لجميع شعب وطلاب المعهد</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name_ar}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">التصنيف:</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as AnnouncementCategory)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                >
                  <option value="تسليم شيت">تسليم شيت وتكليف</option>
                  <option value="امتحان عملي">امتحان عملي معملي</option>
                  <option value="ميدتيرم">امتحان منتصف الفصل (ميدتيرم)</option>
                  <option value="تنبيه إداري">تنبيه إداري وشئون طلاب</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1.5">مستوى الأهمية والسرعة:</label>
                <select
                  value={annUrgency}
                  onChange={(e) => setAnnUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
                >
                  <option value="عاجل جداً">عاجل جداً (شريط أحمر علوي)</option>
                  <option value="هام">هام</option>
                  <option value="عادي">عادي</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">عنوان التنبيه:</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="مثال: آخر موعد لتسليم شيت 2 ميزانيات معملية وتوقيع دفاتر الحقل"
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">تفاصيل التنبيه:</label>
              <textarea
                required
                rows={3}
                value={annDetails}
                onChange={(e) => setAnnDetails(e.target.value)}
                placeholder="اكتب التوجيهات بالتفصيل والمكان ومواعيد السكاشن..."
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">تاريخ الحدث / آخر موعد للتسليم:</label>
              <input
                type="date"
                value={annDate}
                onChange={(e) => setAnnDate(e.target.value)}
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717]"
              />
            </div>

            {/* Telegram Notification Options for Announcements */}
            <div className="p-3.5 rounded-[12px] bg-[#fdfbf9] border-[1.5px] border-[#171717] space-y-2.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="annNotifyTgBox"
                  checked={annNotifyTg}
                  onChange={(e) => setAnnNotifyTg(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ff6f1e] focus:ring-[#ff6f1e] cursor-pointer accent-[#ff6f1e]"
                />
                <label htmlFor="annNotifyTgBox" className="text-xs font-extrabold text-[#2b1a07] cursor-pointer flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  <span>إرسال هذا التنبيه فوراً إلى قناة التليجرام</span>
                </label>
              </div>

              {annNotifyTg && (
                <div className="pr-6 pt-1 space-y-1.5 border-t border-[#171717]/10">
                  <span className="block text-[11px] font-bold text-[#171717]">القناة المستهدفة:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAnnTgTarget('year1')}
                      className={`py-2 px-2 rounded-[6px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        annTgTarget === 'year1'
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40'
                      }`}
                    >
                      قناة سنة أولى
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnTgTarget('year2')}
                      className={`py-2 px-2 rounded-[6px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        annTgTarget === 'year2'
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40'
                      }`}
                    >
                      قناة سنة ثانية
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnTgTarget('both')}
                      className={`py-2 px-2 rounded-[6px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                        annTgTarget === 'both'
                          ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717]'
                          : 'bg-[#f7efe9] text-[#171717] border-[#171717]/40'
                      }`}
                    >
                      القناتين معاً (إشعار عام)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-full bg-[#ff6f1e] hover:bg-[#ff6f1e]/90 text-[#2b1a07] font-black text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>نشر التنبيه الفوري</span>
            </button>
          </form>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: CONTENT MANAGEMENT & JSON BACKUP */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Database Synchronization Status Panel */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-[#171717]/15 pb-3">
              <div>
                <h3 className="font-extrabold text-[#2b1a07] text-base flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#ff6f1e]" />
                  <span>حالة تزامن وحفظ قواعد البيانات (Database Synchronization)</span>
                </h3>
                <p className="text-xs text-[#171717]/70 mt-0.5">
                  تأكيد اتصال وتزامن السيرفر والذاكرة السحابية لقسم المساحة
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-emerald-800">النظام متزامن ومحفوظ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Local File DB Card */}
              <div className="p-4 rounded-[12px] bg-[#f7efe9] border-[1.5px] border-[#171717] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#2b1a07]">1. قاعدة البيانات المحلية (Permanent Server DB)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                    نشطة لحظياً ✓
                  </span>
                </div>
                <p className="text-[#171717]/80 text-[11px] leading-relaxed">
                  يتم حفظ وتحديث الطلاب (حساباتهم وفرقهم)، والمقررات الـ 32، والمذكرات والسكاشن تلقائياً ومباشرة في <code className="bg-[#fdfbf9] px-1 py-0.5 rounded border border-[#171717]/20">data/db.json</code> وتعمل بدون أي انقطاع.
                </p>
              </div>

              {/* Supabase Cloud DB Card */}
              <div className="p-4 rounded-[12px] bg-[#f7efe9] border-[1.5px] border-[#171717] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-[#2b1a07]">2. سحابة Supabase السحابية (PostgreSQL + Storage)</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isSupabaseConfigured ? 'متصلة سحابياً ✓' : 'جاهزة للربط عبر .env.local'}
                  </span>
                </div>
                <p className="text-[#171717]/80 text-[11px] leading-relaxed">
                  {isSupabaseConfigured
                    ? 'مشروع Supabase مربوط ويعمل بكفاءة عبر مفاتيح API السحابية.'
                    : 'يمكن وضع رابط ومفتاح Supabase في ملف .env.local للتزامن المباشر مع سحابة PostgreSQL و Supabase Storage.'}
                </p>
              </div>
            </div>
          </div>

          {/* Backup Actions Card */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-[#2b1a07] text-base">النسخ الاحتياطي واستيراد البيانات (JSON Backup)</h3>
              <p className="text-xs text-[#171717]/70 mt-1">
                يمكنك تحميل نسخة كاملة من جميع التلخيصات والشيتات والجداول والاحتفاظ بها كملف أو استعادتها لاحقاً
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleExportBackup}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] font-bold text-xs border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#ff6f1e]" />
                <span>تصدير نسخة JSON</span>
              </button>

              <label className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-[#171717] font-bold text-xs border-[1.5px] border-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-[#ff6f1e]" />
                <span>استيراد نسخة JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Published Resources List */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <h3 className="font-bold text-[#2b1a07] text-base">المذكرات والشيتات المنشورة ({resources.length}):</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#f7efe9] text-[#2b1a07] font-bold border-b-[1.5px] border-[#171717]">
                  <tr>
                    <th className="p-3">العنوان</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">المادة</th>
                    <th className="p-3">الفرقة</th>
                    <th className="p-3">المشاهدات</th>
                    <th className="p-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10">
                  {resources.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f7efe9]">
                      <td className="p-3 font-bold text-[#171717] line-clamp-1 max-w-xs">{r.title}</td>
                      <td className="p-3 text-[#ff6f1e] font-bold">{r.type}</td>
                      <td className="p-3 text-[#171717]">{r.subject?.name_ar || 'مادة تخصصية'}</td>
                      <td className="p-3 text-[#171717]/70">{r.academic_year}</td>
                      <td className="p-3 font-mono">{r.views_count}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteResource(r.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

