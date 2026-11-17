'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  UrgencyLevel,
  SemesterNumber,
  StudentUser
} from '@/types/database';
import { 
  getDepartments, 
  getSubjects, 
  getResources, 
  getSchedules, 
  getAnnouncements, 
  createResource, 
  deleteResource,
  updateResource,
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
  Users,
  Eye,
  EyeOff,
  UserCheck,
  UserPlus,
  KeyRound,
  CheckCheck,
  XCircle,
  Search,
  FileSpreadsheet,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen
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
  const [students, setStudents] = useState<StudentUser[]>([]);

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<'create-resource' | 'schedules' | 'announcements' | 'manage' | 'review' | 'students' | 'staff'>('create-resource');

  // Real Authentication States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Staff Management States (Super Admin)
  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'dept_rep' | 'reviewer_admin'>('dept_rep');
  const [newStaffDeptId, setNewStaffDeptId] = useState('');
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);

  // PDF File Input Ref
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Quick Form Collapsible Mode
  const [showDetailedMarkdown, setShowDetailedMarkdown] = useState(false);

  // Inline PDF Preview Modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Student Directory State
  const [studentSearch, setStudentSearch] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState<AcademicYear | 'all'>('all');

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
  const [uploadedPdfBase64, setUploadedPdfBase64] = useState('');

  // Review Queue Filter State
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected'>('all');

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

    // Load registered students
    try {
      const stRes = await fetch('/api/students');
      if (stRes.ok) {
        const stData = await stRes.json();
        if (Array.isArray(stData)) setStudents(stData);
      }
    } catch (e) {
      // ignore
    }

    if (depts.length > 0) {
      if (!newResDeptId) setNewResDeptId(depts[0].id);
      if (!schDeptId) setSchDeptId(depts[0].id);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Export Students to CSV
  const handleExportStudentsCsv = () => {
    if (students.length === 0) {
      showToast('لا يوجد طلاب مسجلين للتصدير حالياً', 'error');
      return;
    }

    const headers = ['م', 'اسم الطالب', 'كود الطالب', 'الفرقة الدراسية', 'الفصل الدراسي', 'السكشن', 'رقم الهاتف', 'تاريخ التسجيل'];
    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.student_code || '-'}"`,
      `"${s.academic_year}"`,
      `"الترم ${s.semester_number}"`,
      `"${s.section_number || 'عام'}"`,
      `"${s.phone || '-'}"`,
      `"${new Date(s.created_at).toLocaleDateString('ar-EG')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kashf_students_iti_alex_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast(`تم تصدير كشف ${students.length} طالب بنجاح كملف Excel (CSV)!`);
  };

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

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iti_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.email) {
          setCurrentUser(parsed);
          if (parsed.role === 'reviewer_admin') setActiveTab('review');
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch staff list when logged in as super_admin
  const refreshStaffList = async () => {
    try {
      const res = await fetch('/api/admins');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setStaffList(data);
      }
    } catch (e) {
      console.warn('Failed to fetch staff list', e);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      refreshStaffList();
    }
  }, [currentUser]);

  // Real Login Handler
  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      setCurrentUser(data.user);
      localStorage.setItem('iti_admin_session', JSON.stringify(data.user));
      showToast(data.message || `مرحباً بك يا ${data.user.full_name}`);

      if (data.user.role === 'reviewer_admin') {
        setActiveTab('review');
      } else {
        setActiveTab('create-resource');
      }
    } catch (err: any) {
      setLoginError(err.message || 'بيانات الدخول غير صحيحة');
      showToast(err.message || 'بيانات الدخول غير صحيحة', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Real Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('iti_admin_session');
    setLoginPassword('');
    showToast('تم تسجيل الخروج بنجاح');
  };

  // Promote / Demote Staff Role
  const handleToggleStaffRole = async (targetAdmin: AdminUser) => {
    const nextRole = targetAdmin.role === 'dept_rep' ? 'reviewer_admin' : 'dept_rep';
    const actionLabel = nextRole === 'reviewer_admin' ? 'ترقية لمراجع ومدقق أكاديمي' : 'تخفيض لمندوب رفع فقط';

    try {
      const res = await fetch('/api/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetAdmin.id, role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحديث الصلاحية');

      showToast(`تم ${actionLabel} لـ "${targetAdmin.full_name}" بنجاح!`);
      refreshStaffList();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الصلاحية', 'error');
    }
  };

  // Toggle Staff Active/Suspended Status
  const handleToggleStaffStatus = async (targetAdmin: AdminUser) => {
    const nextStatus = targetAdmin.is_active === false ? true : false;
    try {
      const res = await fetch('/api/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetAdmin.id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل تحديث حالة الحساب');

      showToast(nextStatus ? `تم تفعيل حساب "${targetAdmin.full_name}"` : `تم تعطيل حساب "${targetAdmin.full_name}"`);
      refreshStaffList();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الحساب', 'error');
    }
  };

  // Delete Staff Member
  const handleDeleteStaff = async (targetAdmin: AdminUser) => {
    if (targetAdmin.id === 'admin-super' || targetAdmin.role === 'super_admin') {
      showToast('لا يمكن حذف حساب المشرف العام الرئيسي', 'error');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف حساب "${targetAdmin.full_name}" نهائياً من المنصة؟`)) return;

    try {
      const res = await fetch(`/api/admins?id=${targetAdmin.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حذف الحساب');

      showToast(`تم حذف حساب "${targetAdmin.full_name}" بنجاح`);
      refreshStaffList();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الحساب', 'error');
    }
  };

  // Create New Staff Member
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword.trim()) {
      showToast('يرجى ملء جميع بيانات المشرف أو المندوب الجديد', 'error');
      return;
    }

    setIsStaffSubmitting(true);
    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: newStaffName.trim(),
          email: newStaffEmail.trim(),
          password: newStaffPassword.trim(),
          role: newStaffRole,
          assigned_department_id: newStaffDeptId || 'dept-surveying',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة المشرف');

      showToast(`تمت إضافة ${newStaffRole === 'reviewer_admin' ? 'المراجع الأكاديمي' : 'مندوب الشعبة'} "${data.full_name}" بنجاح!`);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      refreshStaffList();
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة المشرف', 'error');
    } finally {
      setIsStaffSubmitting(false);
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
      if (data.file_base64) {
        setUploadedPdfBase64(data.file_base64);
      }
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

    // Compute semester number so that the student filter always finds this resource!
    let semNumber: SemesterNumber = 1;
    if (subj?.semester_number) {
      semNumber = subj.semester_number;
    } else {
      semNumber = newResYear === 'الفرقة الثانية' ? 3 : 1;
    }

    const isAutoApproved = currentUser?.role === 'super_admin';

    // If a PDF was uploaded, store the base64 payload in content_markdown for persistent cloud serving
    const textMarkdown = newResMarkdown.trim() || newResSummary.trim();
    const finalContentMarkdown = uploadedPdfBase64
      ? `PDF_DATA:::${uploadedPdfBase64}:::${textMarkdown}`
      : textMarkdown;

    const created = await createResource({
      department_id: newResDeptId || 'dept-surveying',
      subject_id: newResSubjectId,
      academic_year: newResYear,
      semester_number: semNumber,
      type: newResType,
      title: newResTitle.trim(),
      summary: newResSummary.trim(),
      content_markdown: finalContentMarkdown,
      file_url: newResFileUrl.trim() || null,
      due_date: newResDueDate ? new Date(newResDueDate).toISOString() : null,
      week_number: Number(newResWeek) || 1,
      author_name: currentUser?.full_name || 'مندوب الشعبة',
      is_pinned: false,
      review_status: isAutoApproved ? 'approved' : 'pending_review',
    });

    showToast(
      isAutoApproved
        ? 'تم نشر واعتماد المحتوى الأكاديمي للطلاب بنجاح!'
        : 'تم رفع المحتوى الأكاديمي وحفظه بقاعدة البيانات، وهو الآن بانتظار مراجعة واعتماد المشرف.'
    );

    // Send Telegram broadcast if checked with specific channel (Year 1 or Year 2)
    if (notifyTelegram && isAutoApproved) {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alex-iota-two.vercel.app';
      const postUrl = `${currentOrigin}/?resId=${created.id}`;
      let fileUrlFormatted: string | undefined = undefined;
      if (created.file_url) {
        fileUrlFormatted = created.file_url.startsWith('http') ? created.file_url : `${currentOrigin}${created.file_url}`;
      }

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
        postUrl: postUrl,
        fileUrl: fileUrlFormatted,
      });
    }

    // Reset Form
    setNewResTitle('');
    setNewResSummary('');
    setNewResMarkdown('');
    setNewResFileUrl('');
    setUploadedPdfName('');
    setUploadedPdfBase64('');
    setNewResDueDate('');
    refreshAllData();
  };

  // Approve a resource in review
  const handleApproveResource = async (resItem: Resource) => {
    await updateResource(resItem.id, {
      review_status: 'approved',
      reviewer_name: currentUser?.full_name || 'المشرف العام',
      reviewed_at: new Date().toISOString(),
    });
    showToast(`تم اعتماد ونشر "${resItem.title}" للطلاب بنجاح!`);

    // Broadcast to the respective Telegram channel upon approval!
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alex-iota-two.vercel.app';
    const postUrl = `${currentOrigin}/?resId=${resItem.id}`;
    let fileUrlFormatted: string | undefined = undefined;
    if (resItem.file_url) {
      fileUrlFormatted = resItem.file_url.startsWith('http') ? resItem.file_url : `${currentOrigin}${resItem.file_url}`;
    }

    triggerTelegramBroadcast({
      type: 'resource',
      title: resItem.title,
      departmentName: resItem.department?.name_ar || 'شعبة المساحة العامة',
      academicYear: resItem.academic_year,
      subjectName: resItem.subject?.name_ar || '',
      details: `[تم اعتماد المذكرة/الشيت رسمياً]\n${resItem.summary}`,
      dueDate: resItem.due_date || undefined,
      resourceType: resItem.type,
      targetChannel: resItem.academic_year === 'الفرقة الأولى' ? 'year1' : 'year2',
      postUrl: postUrl,
      fileUrl: fileUrlFormatted,
    });

    refreshAllData();
  };

  // Reject a resource
  const handleRejectResource = async (id: string) => {
    if (confirm('هل أنت متأكد من رفض هذا المحتوى وطلب تعديله من المندوب؟')) {
      await updateResource(id, {
        review_status: 'rejected',
        reviewer_name: currentUser?.full_name || 'المشرف العام',
        reviewed_at: new Date().toISOString(),
      });
      showToast('تم تحديث حالة المحتوى إلى مرفوض.');
      refreshAllData();
    }
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
  // LOGIN SCREEN (Real Secure Authentication)
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#fdfbf9]">
        <div className="w-full max-w-md bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] flex items-center justify-center mx-auto text-[#2b1a07] shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              <ShieldCheck className="w-8 h-8 text-[#ff6f1e]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2b1a07]">
              بوابة تسجيل دخول المشرفين والمناديب
            </h1>
            <p className="text-xs text-[#171717]/70">
              سجل الدخول بحسابك المعتمد لإدارة المذكرات والشيتات والجداول وتدقيق المحتوى
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-[12px] bg-rose-50 border-[1.5px] border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleRealLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                البريد الإلكتروني:
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@iti-alex.edu.eg"
                className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[10px] p-3 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1.5">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[10px] p-3 pr-10 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#171717]/60 hover:text-[#171717] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-black text-sm border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loginLoading ? (
                <span>جاري التحقق وتأمين الجلسة...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#ff6f1e]" />
                  <span>تسجيل الدخول الآمن</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#171717]/15">
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
                {currentUser.role === 'super_admin' ? 'Super Admin (المشرف العام)' : currentUser.role === 'reviewer_admin' ? 'مشرف ومدقق أكاديمي' : 'مندوب شعبة'}
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
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fdfbf9] hover:bg-rose-50 border-[1.5px] border-[#171717] text-rose-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[14px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#171717]/70">المحتويات المعتمدة والمنشورة</p>
            <h3 className="text-xl font-black text-[#2b1a07] mt-0.5">
              {resources.filter((r) => !r.review_status || r.review_status === 'approved').length}
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold">متاحة لجميع الطلاب ✓</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border border-[#171717] flex items-center justify-center text-emerald-600">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[14px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#171717]/70">طابور المراجعة والاعتماد</p>
            <h3 className="text-xl font-black text-[#ff6f1e] mt-0.5">
              {resources.filter((r) => r.review_status === 'pending_review').length}
            </h3>
            <span className="text-[10px] text-[#ce500a] font-bold">بانتظار موافقة المشرف ⏳</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border border-[#171717] flex items-center justify-center text-[#ff6f1e]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[14px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#171717]/70">الطلاب المسجلون بالمنصة</p>
            <h3 className="text-xl font-black text-[#2b1a07] mt-0.5">
              {students.length}
            </h3>
            <span className="text-[10px] text-[#171717]/70 font-bold">حسابات موثقة بالدليل 👥</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border border-[#171717] flex items-center justify-center text-[#2b1a07]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[14px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#171717]/70">قنوات التليجرام المرتبطة</p>
            <h3 className="text-xl font-black text-[#2b1a07] mt-0.5">
              2
            </h3>
            <span className="text-[10px] text-emerald-700 font-bold">قناة سنة 1 + سنة 2 متصلتان 📡</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#fdfbf9] border border-[#171717] flex items-center justify-center text-[#0284c7]">
            <Send className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Role-Based Dashboard Tabs Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {(currentUser.role === 'super_admin' || currentUser.role === 'dept_rep') && (
          <button
            onClick={() => setActiveTab('create-resource')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'create-resource'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <PlusCircle className={`w-4 h-4 ${activeTab === 'create-resource' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>نشر تلخيص / شيت</span>
          </button>
        )}

        {(currentUser.role === 'super_admin' || currentUser.role === 'reviewer_admin' || currentUser.role === 'dept_rep') && (
          <button
            onClick={() => setActiveTab('review')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer relative ${
              activeTab === 'review'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <CheckCheck className={`w-4 h-4 ${activeTab === 'review' ? 'text-[#22c55e]' : 'text-[#171717]'}`} />
            <span>{currentUser.role === 'dept_rep' ? 'ملفاتي وحالة الاعتماد' : 'طابور مراجعة واعتماد المحتوى'}</span>
            {resources.filter((r) => r.review_status === 'pending_review').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#ff6f1e] text-[#2b1a07] text-[10px] font-black flex items-center justify-center border border-[#171717]">
                {resources.filter((r) => r.review_status === 'pending_review').length}
              </span>
            )}
          </button>
        )}

        {(currentUser.role === 'super_admin' || currentUser.role === 'reviewer_admin') && (
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'students' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>دليل وقوائم الطلاب ({students.length})</span>
          </button>
        )}

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'schedules' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>إدارة جدول الفترات</span>
          </button>
        )}

        {(currentUser.role === 'super_admin' || currentUser.role === 'reviewer_admin') && (
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Bell className={`w-4 h-4 ${activeTab === 'announcements' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>نشر تنبيه أو موعد تسليم</span>
          </button>
        )}

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'staff' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>إدارة المشرفين والمناديب ({staffList.length})</span>
          </button>
        )}

        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold border-[1.5px] border-[#171717] transition-all cursor-pointer ${
              activeTab === 'manage'
                ? 'bg-[#171717] text-white shadow-[0_2px_4px_rgba(0,0,0,0.2)]'
                : 'bg-[#fdfbf9] text-[#171717] hover:bg-[#f7efe9] shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
            }`}
          >
            <Database className={`w-4 h-4 ${activeTab === 'manage' ? 'text-[#ff6f1e]' : 'text-[#171717]'}`} />
            <span>المحتوى والنسخ الاحتياطي</span>
          </button>
        )}
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
                  <optgroup label={newResYear === 'الفرقة الأولى' ? 'الفصل الدراسي الأول (الترم 1)' : 'الفصل الدراسي الأول (الترم 3)'}>
                    {subjects
                      .filter((s) => s.semester_number === 1 || s.semester_number === 3)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name_ar}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={newResYear === 'الفرقة الأولى' ? 'الفصل الدراسي الثاني (الترم 2)' : 'الفصل الدراسي الثاني (الترم 4)'}>
                    {subjects
                      .filter((s) => s.semester_number === 2 || s.semester_number === 4)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name_ar}
                        </option>
                      ))}
                  </optgroup>
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

            {/* Collapsible Detailed Markdown Explanation */}
            <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] p-3.5 space-y-2">
              <button
                type="button"
                onClick={() => setShowDetailedMarkdown(!showDetailedMarkdown)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#2b1a07] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#ff6f1e]" />
                  <span>كتابة شرح نصي مفصل / قوانين بالمعادلات (اختياري - في حال عدم توفر PDF)</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#171717]/60">
                  <span>{showDetailedMarkdown ? 'طي الشرح' : 'توسيع وحفظ'}</span>
                  {showDetailedMarkdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              {showDetailedMarkdown && (
                <div className="pt-2 border-t border-[#171717]/10 space-y-1.5">
                  <p className="text-[11px] text-[#171717]/60">
                    يمكنك كتابة القوانين الرياضية والخطوات الميدانية باستخدام Markdown وسيعرضها الموقع بشكل منسق للطلاب:
                  </p>
                  <textarea
                    rows={5}
                    value={newResMarkdown}
                    onChange={(e) => setNewResMarkdown(e.target.value)}
                    placeholder="### المحتويات الرئيسية:&#10;1. القانون الرياضي: C = 0.0675 * D^2&#10;2. خطوات المعايرة الميدانية..."
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs sm:text-sm text-[#171717] focus:outline-none focus:border-[#ff6f1e] font-mono"
                  />
                </div>
              )}
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
                  <button
                    type="button"
                    onClick={() => pdfInputRef.current?.click()}
                    disabled={uploadingPdf}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f7efe9] hover:bg-[#ff6f1e]/10 border-[1.5px] border-dashed border-[#171717] rounded-[8px] cursor-pointer text-xs font-bold text-[#2b1a07] transition-all disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-[#ff6f1e]" />
                    <span>{uploadingPdf ? 'جاري رفع ملف الـ PDF وتأمينه...' : 'اختر ملف PDF للرفع من جهازك 📄'}</span>
                  </button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploadingPdf}
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  {uploadedPdfName && (
                    <div className="text-[11px] font-bold text-emerald-800 mt-1.5 flex items-center justify-between gap-1 bg-emerald-50 p-2 rounded-[6px] border border-emerald-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                        <span className="truncate">تم إرفاق: {uploadedPdfName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPdfName('');
                          setUploadedPdfBase64('');
                          setNewResFileUrl('');
                        }}
                        className="text-rose-600 hover:text-rose-800 text-[10px] font-black underline flex-shrink-0 cursor-pointer"
                      >
                        إلغاء الملف
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] mb-1">
                    2. أو رابط ملف PDF خارجي (Google Drive / Direct PDF):
                  </label>
                  <input
                    type="text"
                    value={newResFileUrl}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (val.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
                        showToast('❌ غير مسموح بروابط الصور! يرجى إرفاق رابط مستند PDF فقط توفيراً للمساحة.', 'error');
                        return;
                      }
                      setNewResFileUrl(val);
                    }}
                    placeholder="https://.../surveying-sheet.pdf أو رابط مباشر"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
                  />
                  {uploadedPdfName && (
                    <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                      ✓ تم تعيين مسار الملف المرفوع تلقائياً وجاهز للنشر
                    </span>
                  )}
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
      {/* TAB: REVIEW & APPROVAL QUEUE (مشرف ومدقق أكاديمي) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
                  <CheckCheck className="w-6 h-6 text-[#22c55e]" />
                  <span>مركز مراجعة واعتماد المحتوى الأكاديمي (Academic Review Queue)</span>
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1 leading-relaxed">
                  نظام التدقيق والجودة: يقوم مناديب الشعب برفع التلخيصات والشيتات كملفات PDF، وتبقى قيد المراجعة حتى يعتمدها المشرف الأكاديمي، وعند الاعتماد تُتاح للطلاب فوراً ويُرسل إشعار تلقائي إلى قناة التليجرام.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full bg-[#fdfbf9] border-[1.5px] border-[#171717] text-xs font-black text-[#2b1a07]">
                  {resources.filter((r) => r.review_status === 'pending_review').length} بانتظار الاعتماد
                </span>
              </div>
            </div>

            {/* Status Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setReviewFilter('all')}
                className={`p-3 rounded-[12px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/30 hover:bg-[#f7efe9]'
                }`}
              >
                <div className="text-lg font-black">{resources.length}</div>
                <div className="text-[11px] opacity-80">إجمالي المحتويات</div>
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('pending_review')}
                className={`p-3 rounded-[12px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                  reviewFilter === 'pending_review'
                    ? 'bg-[#ff6f1e] text-[#2b1a07] border-[#171717]'
                    : 'bg-[#fdfbf9] text-[#ce500a] border-[#171717]/30 hover:bg-amber-50'
                }`}
              >
                <div className="text-lg font-black">{resources.filter((r) => r.review_status === 'pending_review').length}</div>
                <div className="text-[11px] font-bold">⏳ قيد المراجعة (Pending)</div>
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('approved')}
                className={`p-3 rounded-[12px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                  reviewFilter === 'approved'
                    ? 'bg-[#22c55e] text-white border-[#171717]'
                    : 'bg-[#fdfbf9] text-emerald-800 border-[#171717]/30 hover:bg-emerald-50'
                }`}
              >
                <div className="text-lg font-black">{resources.filter((r) => !r.review_status || r.review_status === 'approved').length}</div>
                <div className="text-[11px] font-bold">✅ معتمد ومنشور للطلاب</div>
              </button>

              <button
                type="button"
                onClick={() => setReviewFilter('rejected')}
                className={`p-3 rounded-[12px] border-[1.5px] font-bold text-center transition-all cursor-pointer ${
                  reviewFilter === 'rejected'
                    ? 'bg-rose-600 text-white border-[#171717]'
                    : 'bg-[#fdfbf9] text-rose-700 border-[#171717]/30 hover:bg-rose-50'
                }`}
              >
                <div className="text-lg font-black">{resources.filter((r) => r.review_status === 'rejected').length}</div>
                <div className="text-[11px] font-bold">❌ مرفوض للتعديل</div>
              </button>
            </div>
          </div>

          {/* Resources Review Cards List */}
          <div className="space-y-4">
            {resources
              .filter((r) => {
                if (reviewFilter === 'all') return true;
                if (reviewFilter === 'approved') return !r.review_status || r.review_status === 'approved';
                return r.review_status === reviewFilter;
              })
              .map((r) => {
                const isPending = r.review_status === 'pending_review';
                const isApproved = !r.review_status || r.review_status === 'approved';
                const isRejected = r.review_status === 'rejected';

                return (
                  <div
                    key={r.id}
                    className={`bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.12)] space-y-4 transition-all ${
                      isPending ? 'border-amber-400 bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Top Row Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1px] border-[#171717]/15 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>⏳ قيد انتظار الاعتماد والمراجعة</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>✅ معتمد ومنشور للطلاب</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5 text-rose-700" />
                            <span>❌ مرفوض (يتطلب تعديل من المندوب)</span>
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#f7efe9] text-[#2b1a07] border border-[#171717]/30">
                          {r.type}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f7efe9] text-[#171717] border border-[#171717]/30">
                          {r.academic_year}
                        </span>

                        {r.semester_number && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f7efe9] text-[#171717] border border-[#171717]/30">
                            الترم {r.semester_number === 1 || r.semester_number === 3 ? 'الأول' : 'الثاني'}
                          </span>
                        )}

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#171717] text-white">
                          {r.subject?.name_ar || 'مادة تخصصية'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#171717]/60 font-mono">
                        {new Date(r.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#2b1a07]">
                        {r.title}
                      </h3>
                      {r.summary && (
                        <p className="text-xs sm:text-sm text-[#171717]/80 mt-1.5 leading-relaxed">
                          {r.summary}
                        </p>
                      )}
                    </div>

                    {/* Metadata & PDF Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t-[1px] border-[#171717]/10">
                      <div className="flex flex-wrap items-center gap-4 text-[#171717]/70 text-[11px]">
                        <span>
                          <strong>الرافع / المندوب:</strong> {r.author_name || 'مندوب الشعبة'}
                        </span>
                        {r.reviewer_name && (
                          <span>
                            <strong>تم التدقيق بواسطة:</strong> {r.reviewer_name}
                          </span>
                        )}
                        {r.due_date && (
                          <span className="text-rose-700 font-bold">
                            <strong>آخر موعد تسليم:</strong> {new Date(r.due_date).toLocaleDateString('ar-EG')}
                          </span>
                        )}
                      </div>

                      {/* PDF View / Download */}
                      {r.file_url ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPdfUrl(r.file_url || null);
                              setPreviewPdfTitle(r.title);
                              setPreviewResource(r);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#171717] hover:bg-[#171717]/85 border border-[#171717] text-xs font-bold text-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.15)] cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#ff6f1e]" />
                            <span>معاينة فورية سريعة 👁️</span>
                          </button>
                          <a
                            href={r.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7efe9] hover:bg-[#ff6f1e]/15 border-[1.5px] border-[#171717] text-xs font-bold text-[#2b1a07] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#ff6f1e]" />
                            <span>فتح بالمتصفح ↗</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#171717]/40 font-bold">
                          لا يوجد ملف PDF مرفق
                        </span>
                      )}
                    </div>

                    {/* Review Decision Controls */}
                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t-[1.5px] border-[#171717]/15">
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleApproveResource(r)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-black text-xs border-[1.5px] border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>اعتماد ونشر للطلاب وبث لقناة التليجرام ✓</span>
                        </button>
                      )}

                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => handleRejectResource(r.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border-[1.5px] border-rose-300 transition-all cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>رفض وطلب تعديل ❌</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteResource(r.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-full border border-rose-200 transition-colors cursor-pointer"
                        title="حذف المحتوى نهائياً"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

            {resources.filter((r) => {
              if (reviewFilter === 'all') return true;
              if (reviewFilter === 'approved') return !r.review_status || r.review_status === 'approved';
              return r.review_status === reviewFilter;
            }).length === 0 && (
              <div className="text-center py-12 bg-[#fdfbf9] border-[1.5px] border-dashed border-[#171717]/30 rounded-[16px] space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-extrabold text-[#2b1a07] text-sm">لا توجد عناصر في هذا التصنيف حالياً</h4>
                <p className="text-xs text-[#171717]/60">كل المحتويات معتمدة أو تم فحصها بالكامل.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: REGISTERED STUDENTS DIRECTORY (دليل وقوائم الطلاب) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#ff6f1e]" />
                  <span>دليل وقوائم الطلاب المسجلين بالمنصة ({students.length})</span>
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1 leading-relaxed">
                  يمكن لمشرفي الشعبة مراجعة بيانات الطلاب، متابعة أرقام الهواتف، والفرق الدراسية، وتصدير كشف رسمي بصيغة Excel / CSV.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportStudentsCsv}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-bold text-xs shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#22c55e]" />
                  <span>تصدير كشف الطلاب (Excel / CSV)</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-[#171717]/40 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="ابحث بالاسم، أو كود الطالب، أو رقم الهاتف..."
                  className="w-full pr-9 pl-3 py-2.5 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] text-xs text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStudentYearFilter('all')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-[8px] border-[1.5px] transition-all cursor-pointer ${
                    studentYearFilter === 'all'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/30 hover:bg-[#f7efe9]'
                  }`}
                >
                  الكل ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentYearFilter('الفرقة الأولى')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-[8px] border-[1.5px] transition-all cursor-pointer ${
                    studentYearFilter === 'الفرقة الأولى'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/30 hover:bg-[#f7efe9]'
                  }`}
                >
                  سنة 1 ({students.filter((s) => s.academic_year === 'الفرقة الأولى').length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentYearFilter('الفرقة الثانية')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-[8px] border-[1.5px] transition-all cursor-pointer ${
                    studentYearFilter === 'الفرقة الثانية'
                      ? 'bg-[#171717] text-white border-[#171717]'
                      : 'bg-[#fdfbf9] text-[#171717] border-[#171717]/30 hover:bg-[#f7efe9]'
                  }`}
                >
                  سنة 2 ({students.filter((s) => s.academic_year === 'الفرقة الثانية').length})
                </button>
              </div>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#f7efe9] text-[#2b1a07] font-bold border-b-[1.5px] border-[#171717]">
                  <tr>
                    <th className="p-3">م</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">كود الطالب</th>
                    <th className="p-3">الفرقة الدراسية</th>
                    <th className="p-3">الترم</th>
                    <th className="p-3">السكشن</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10">
                  {students
                    .filter((s) => {
                      if (studentYearFilter !== 'all' && s.academic_year !== studentYearFilter) return false;
                      if (!studentSearch.trim()) return true;
                      const q = studentSearch.toLowerCase();
                      return (
                        s.name.toLowerCase().includes(q) ||
                        (s.student_code && s.student_code.toLowerCase().includes(q)) ||
                        (s.phone && s.phone.includes(q))
                      );
                    })
                    .map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-[#f7efe9]/70 transition-colors">
                        <td className="p-3 font-mono text-[#171717]/60">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-[#2b1a07]">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#f7efe9] border border-[#171717] flex items-center justify-center text-[10px] font-black text-[#ff6f1e]">
                              {s.name.slice(0, 1)}
                            </div>
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#171717]">{s.student_code || '-'}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#f7efe9] border border-[#171717]/30 text-[#2b1a07]">
                            {s.academic_year}
                          </span>
                        </td>
                        <td className="p-3 text-[#171717]/80">الترم {s.semester_number}</td>
                        <td className="p-3 font-bold text-[#171717]">{s.section_number || 'عام'}</td>
                        <td className="p-3 font-mono text-[#171717]/80 dir-ltr text-right">{s.phone || '-'}</td>
                        <td className="p-3 text-[11px] text-[#171717]/60 font-mono">
                          {new Date(s.created_at).toLocaleDateString('ar-EG')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {students.filter((s) => {
                if (studentYearFilter !== 'all' && s.academic_year !== studentYearFilter) return false;
                if (!studentSearch.trim()) return true;
                const q = studentSearch.toLowerCase();
                return (
                  s.name.toLowerCase().includes(q) ||
                  (s.student_code && s.student_code.toLowerCase().includes(q)) ||
                  (s.phone && s.phone.includes(q))
                );
              }).length === 0 && (
                <div className="text-center py-10 space-y-2">
                  <Users className="w-8 h-8 text-[#171717]/30 mx-auto" />
                  <p className="text-xs font-bold text-[#171717]/60">لا يوجد طلاب يطابقون معايير البحث الحالية</p>
                </div>
              )}
            </div>
          </div>
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

      {/* ---------------------------------------------------- */}
      {/* TAB: STAFF & ROLE MANAGEMENT (إدارة المشرفين والمناديب) */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-[#f7efe9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-[#171717]/15 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#2b1a07] flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#ff6f1e]" />
                  <span>إدارة المشرفين والمناديب وتوزيع الصلاحيات (Staff & Access Control)</span>
                </h2>
                <p className="text-xs text-[#171717]/70 mt-1 leading-relaxed">
                  التحكم الكامل في حسابات المنصة: إضافة مناديب لرفع المذكرات والشيتات، وترقيتهم لمراجعين أكاديميين للاعتماد، أو تعطيل الحسابات وتغيير الصلاحيات بضغطة زر واحدة.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#fdfbf9] border border-[#171717] text-xs font-black text-[#2b1a07]">
                  {staffList.length} أعضاء بالفريق
                </span>
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#171717]/70">المشرف العام (Super Admin):</span>
                  <div className="text-lg font-black text-[#2b1a07]">
                    {staffList.filter((s) => s.role === 'super_admin').length}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-black">
                  👑
                </div>
              </div>

              <div className="p-3 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#171717]/70">مراجعون ومدققون معتمدون:</span>
                  <div className="text-lg font-black text-[#22c55e]">
                    {staffList.filter((s) => s.role === 'reviewer_admin').length}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  ✓
                </div>
              </div>

              <div className="p-3 bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[12px] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#171717]/70">مناديب الشعب (رافعو المواد):</span>
                  <div className="text-lg font-black text-[#ff6f1e]">
                    {staffList.filter((s) => s.role === 'dept_rep').length}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#ff6f1e] flex items-center justify-center font-black">
                  📤
                </div>
              </div>
            </div>
          </div>

          {/* Add New Staff Card */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <h3 className="font-extrabold text-[#2b1a07] text-sm flex items-center gap-2 border-b-[1px] border-[#171717]/15 pb-2.5">
              <UserPlus className="w-4 h-4 text-[#ff6f1e]" />
              <span>إضافة عضو جديد (مندوب شعبة أو مشرف مراجع)</span>
            </h3>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#171717] mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="مثال: م. أحمد مصطفى"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-[#171717] focus:outline-none focus:border-[#ff6f1e]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">البريد الإلكتروني الرسمي:</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="rep.ahmed@iti-alex.edu.eg"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">كلمة المرور:</label>
                  <input
                    type="text"
                    required
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    placeholder="كلمة مرور قوية (مثال: pass123)"
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-[#171717] focus:outline-none focus:border-[#ff6f1e] dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#171717] mb-1">الصلاحية المبدئية:</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-[#171717] focus:outline-none focus:border-[#ff6f1e] cursor-pointer"
                  >
                    <option value="dept_rep">مندوب شعبة (رفع فقط)</option>
                    <option value="reviewer_admin">مشرف ومدقق أكاديمي (اعتماد وتدقيق)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="w-full sm:w-1/2">
                  <label className="block font-bold text-[#171717] mb-1">الشعبة التابع لها:</label>
                  <select
                    value={newStaffDeptId}
                    onChange={(e) => setNewStaffDeptId(e.target.value)}
                    className="w-full bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[8px] p-2.5 text-[#171717] focus:outline-none focus:border-[#ff6f1e] cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name_ar}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-auto self-end">
                  <button
                    type="submit"
                    disabled={isStaffSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#171717] hover:bg-[#171717]/90 text-white font-black text-xs border border-[#171717] shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 text-[#ff6f1e]" />
                    <span>{isStaffSubmitting ? 'جاري الإضافة والتزامن...' : 'إضافة وتثبيت الحساب فوراً'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Staff Directory Table */}
          <div className="bg-[#fdfbf9] border-[1.5px] border-[#171717] rounded-[16px] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.15)] space-y-4">
            <h3 className="font-extrabold text-[#2b1a07] text-sm">
              قائمة أعضاء فريق العمل والمناديب المسجلين بالمنصة ({staffList.length}):
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#f7efe9] text-[#2b1a07] font-bold border-b-[1.5px] border-[#171717]">
                  <tr>
                    <th className="p-3">م</th>
                    <th className="p-3">المشرف / المندوب</th>
                    <th className="p-3">البريد الإلكتروني</th>
                    <th className="p-3">الشعبة</th>
                    <th className="p-3">الصلاحية الحالية</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">التحكم بالترقية والتخفيض</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/10">
                  {staffList.map((s, idx) => {
                    const isSuper = s.role === 'super_admin';
                    const isReviewer = s.role === 'reviewer_admin';
                    const isRep = s.role === 'dept_rep';
                    const isActive = s.is_active !== false;
                    const dept = departments.find((d) => d.id === s.assigned_department_id);

                    return (
                      <tr key={s.id || idx} className="hover:bg-[#f7efe9]/60 transition-colors">
                        <td className="p-3 font-mono text-[#171717]/60">{idx + 1}</td>
                        <td className="p-3 font-extrabold text-[#2b1a07]">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#f7efe9] border border-[#171717] flex items-center justify-center font-bold text-xs text-[#ff6f1e]">
                              {s.full_name ? s.full_name.slice(0, 1) : 'م'}
                            </div>
                            <span>{s.full_name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#171717]/80 dir-ltr text-right">{s.email}</td>
                        <td className="p-3 text-[#171717]">{dept ? dept.name_ar : 'عام / كل الشعب'}</td>
                        <td className="p-3">
                          {isSuper && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#171717] text-white">
                              👑 Super Admin (مدير عام)
                            </span>
                          )}
                          {isReviewer && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                              ✓ مراجع ومدقق أكاديمي
                            </span>
                          )}
                          {isRep && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              📤 مندوب شعبة (رافع)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span>نشط</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                              <span>معطل</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isSuper ? (
                            <span className="text-[10px] text-[#171717]/50 font-bold">الحساب الرئيسي</span>
                          ) : isRep ? (
                            <button
                              type="button"
                              onClick={() => handleToggleStaffRole(s)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-black transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                              title="ترقية إلى مراجع أكاديمي لمنحه صلاحية مراجعة واعتماد الملفات"
                            >
                              <span>ترقية إلى مراجع أكاديمي</span>
                              <span>⬆️</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStaffRole(s)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
                              title="تخفيض إلى مندوب لتقييد الصلاحيات على الرفع فقط"
                            >
                              <span>تخفيض إلى مندوب رفع</span>
                              <span>⬇️</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isSuper && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffStatus(s)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                    isActive
                                      ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                  title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                                >
                                  {isActive ? 'تعطيل' : 'تفعيل'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(s)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="حذف الحساب نهائياً"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* INLINE PDF PREVIEW MODAL */}
      {/* ---------------------------------------------------- */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[90vh] bg-[#fdfbf9] border-[2px] border-[#171717] rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#f7efe9] border-b-[1.5px] border-[#171717]">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-[#fdfbf9] border border-[#171717] flex items-center justify-center text-[#ff6f1e] flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-black text-[#2b1a07] truncate">
                    {previewPdfTitle || 'معاينة مستند الـ PDF'}
                  </h3>
                  <p className="text-[11px] text-[#171717]/60 truncate">
                    معاينة أصلية للمستند المرفوع من المندوب للتدقيق الأكاديمي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={previewPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-xs font-bold text-[#171717] border border-[#171717] transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#ff6f1e]" />
                  <span className="hidden sm:inline">فتح بالمتصفح</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setPreviewResource(null);
                  }}
                  className="w-8 h-8 rounded-full bg-[#fdfbf9] hover:bg-rose-100 text-rose-700 border border-[#171717] flex items-center justify-center font-black transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PDF Viewer Frame */}
            <div className="flex-1 bg-[#171717]/5 relative">
              <iframe
                src={`${previewPdfUrl}#toolbar=1`}
                className="w-full h-full border-none"
                title={previewPdfTitle}
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="p-3.5 bg-[#f7efe9] border-t-[1.5px] border-[#171717] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#171717]/70 font-bold">
                {previewResource ? (
                  <span>
                    الرافع: {previewResource.author_name} | {previewResource.academic_year} - {previewResource.subject?.name_ar}
                  </span>
                ) : (
                  <span>معاينة فورية لمستند PDF</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {previewResource && previewResource.review_status !== 'approved' && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleApproveResource(previewResource);
                      setPreviewPdfUrl(null);
                      setPreviewResource(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-black text-xs border border-[#171717] shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد المستند فوراً ✓</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setPreviewResource(null);
                  }}
                  className="px-4 py-2 rounded-full bg-[#fdfbf9] hover:bg-[#f7efe9] text-xs font-bold text-[#171717] border border-[#171717] transition-all cursor-pointer"
                >
                  إغلاق المعاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

