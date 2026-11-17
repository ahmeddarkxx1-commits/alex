import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Department, 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  AcademicYear, 
  AcademicSemester,
  SemesterNumber,
  ResourceType, 
  DayOfWeek,
  SectionNumber,
  SessionType,
  StudentUser
} from '@/types/database';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_SUBJECTS 
} from '@/lib/mockData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'iti_alex_departments_v4',
  SUBJECTS: 'iti_alex_subjects_v4',
  RESOURCES: 'iti_alex_resources_v4',
  SCHEDULES: 'iti_alex_schedules_v4',
  ANNOUNCEMENTS: 'iti_alex_announcements_v4',
  BOOKMARKS: 'iti_alex_bookmarks_v4',
  USER_PREFS: 'iti_alex_user_prefs_v4',
  STUDENT_USER: 'iti_alex_student_user_v4',
  STUDENT_ACCOUNTS: 'iti_alex_student_accounts_v4',
};

// Safe helper to get from LocalStorage (client side only)
function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ----------------- DEPARTMENTS -----------------
export async function getDepartments(): Promise<Department[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('departments').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data as Department[];
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local data', e);
    }
  }
  return getLocalItem<Department[]>(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
}

// ----------------- SUBJECTS -----------------
export async function getSubjects(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  semesterNumber?: SemesterNumber;
}): Promise<Subject[]> {
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams();
      if (params?.departmentId) q.set('departmentId', params.departmentId);
      if (params?.academicYear) q.set('academicYear', params.academicYear);
      if (params?.semesterNumber) q.set('semesterNumber', String(params.semesterNumber));
      const res = await fetch(`/api/subjects?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          try {
            const current = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
            const map = new Map<string, Subject>(current.map((s) => [s.id, s]));
            data.forEach((s: Subject) => {
              const old = map.get(s.id);
              map.set(s.id, old ? { ...old, ...s } : s);
            });
            setLocalItem(STORAGE_KEYS.SUBJECTS, Array.from(map.values()));
          } catch {
            // ignore
          }
          return data as Subject[];
        }
      }
    } catch (e) {
      // fallback
    }
  }

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('subjects').select('*');
      if (params?.departmentId) query = query.eq('department_id', params.departmentId);
      if (params?.academicYear) query = query.eq('academic_year', params.academicYear);
      if (params?.semesterNumber) query = query.eq('semester_number', params.semesterNumber);
      const { data, error } = await query.order('name_ar', { ascending: true });
      if (!error && data && data.length > 0) {
        try {
          const current = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
          const map = new Map<string, Subject>(current.map((s) => [s.id, s]));
          data.forEach((s: any) => {
            const old = map.get(s.id);
            map.set(s.id, old ? { ...old, ...s } : s);
          });
          setLocalItem(STORAGE_KEYS.SUBJECTS, Array.from(map.values()));
        } catch {
          // ignore
        }
        return data as Subject[];
      }
    } catch (e) {
      console.warn('Supabase subjects fetch failed, falling back', e);
    }
  }

  let list = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  if (params?.departmentId) list = list.filter((s) => s.department_id === params.departmentId);
  if (params?.academicYear) list = list.filter((s) => s.academic_year === params.academicYear);
  if (params?.semesterNumber) list = list.filter((s) => s.semester_number === params.semesterNumber);
  return list;
}

// ----------------- RESOURCES -----------------
export async function getResources(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  semesterNumber?: SemesterNumber;
  type?: ResourceType | 'الكل';
  subjectId?: string;
  search?: string;
  reviewStatus?: 'approved' | 'pending_review' | 'rejected' | 'all';
}): Promise<Resource[]> {
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams();
      if (params?.departmentId) q.set('departmentId', params.departmentId);
      if (params?.academicYear) q.set('academicYear', params.academicYear);
      if (params?.semesterNumber) q.set('semesterNumber', String(params.semesterNumber));
      if (params?.type && params.type !== 'الكل') q.set('type', params.type);
      if (params?.subjectId && params.subjectId !== 'all') q.set('subjectId', params.subjectId);
      if (params?.search) q.set('search', params.search);
      if (params?.reviewStatus) q.set('reviewStatus', params.reviewStatus);
      const res = await fetch(`/api/resources?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data as Resource[];
      }
    } catch (e) {
      // fallback
    }
  }

  let resources: Resource[] = [];

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('resources').select('*');
      if (params?.departmentId) query = query.eq('department_id', params.departmentId);
      if (params?.academicYear) query = query.eq('academic_year', params.academicYear);
      if (params?.type && params.type !== 'الكل') query = query.eq('type', params.type);
      if (params?.subjectId) query = query.eq('subject_id', params.subjectId);

      const { data, error } = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (!error && data) {
        resources = data as Resource[];
      }
    } catch (e) {
      console.warn('Supabase resources fetch failed', e);
    }
  }

  if (resources.length === 0) {
    resources = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, []);
  }

  const allDepts = await getDepartments();
  const allSubjs = await getSubjects();

  // Attach joins
  resources = resources.map((r) => ({
    ...r,
    department: allDepts.find((d) => d.id === r.department_id),
    subject: allSubjs.find((s) => s.id === r.subject_id),
  }));

  // In-memory filters
  if (params?.departmentId) {
    resources = resources.filter((r) => r.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    resources = resources.filter((r) => r.academic_year === params.academicYear);
  }
  if (params?.semesterNumber) {
    resources = resources.filter((r) => r.semester_number === params.semesterNumber || (r.subject && r.subject.semester_number === params.semesterNumber));
  }
  if (params?.type && params.type !== 'الكل') {
    resources = resources.filter((r) => r.type === params.type);
  }
  if (params?.subjectId && params.subjectId !== 'all') {
    resources = resources.filter((r) => r.subject_id === params.subjectId);
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        (r.subject?.name_ar && r.subject.name_ar.toLowerCase().includes(q)) ||
        (r.author_name && r.author_name.toLowerCase().includes(q))
    );
  }

  return resources;
}

export async function getResourceById(id: string): Promise<Resource | null> {
  const allResources = await getResources({ reviewStatus: 'all' });
  const found = allResources.find((r) => r.id === id);
  if (found) return found;
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('resources').select('*').eq('id', id).maybeSingle();
      if (data) {
        const item = data as any;
        const allSubjs = await getSubjects();
        const allDepts = await getDepartments();
        return {
          ...item,
          subject: allSubjs.find((s) => s.id === item.subject_id),
          department: allDepts.find((d) => d.id === item.department_id),
        } as Resource;
      }
    } catch (e) {
      console.warn('getResourceById supabase error', e);
    }
  }
  return null;
}

export async function getSubjectByCodeOrId(codeOrId: string): Promise<Subject | null> {
  const allSubjs = await getSubjects({ departmentId: 'dept-surveying' });
  const clean = codeOrId.trim().toLowerCase();
  const found = allSubjs.find(
    (s) => s.code.toLowerCase() === clean || s.id.toLowerCase() === clean || s.name_ar.toLowerCase() === clean
  );
  return found || null;
}

export async function updateSubject(id: string, updates: Partial<Subject>): Promise<Subject | null> {
  let updatedRecord: Subject | null = null;

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/subjects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        updatedRecord = await res.json();
      }
    } catch (e) {
      console.warn('API updateSubject failed', e);
    }
  }

  if (!updatedRecord && isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('subjects' as any) as any)
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (!error && data) updatedRecord = data as Subject;
    } catch (e) {
      console.warn('Supabase updateSubject failed', e);
    }
  }

  const list = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  const idx = list.findIndex((s) => s.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...(updatedRecord || {}), ...updates };
    setLocalItem(STORAGE_KEYS.SUBJECTS, list);
    return updatedRecord || list[idx];
  } else if (updatedRecord) {
    list.push(updatedRecord);
    setLocalItem(STORAGE_KEYS.SUBJECTS, list);
    return updatedRecord;
  }
  return updatedRecord;
}

export async function createResource(newRes: Omit<Resource, 'id' | 'views_count' | 'created_at'>): Promise<Resource> {
  const resourceToSave: Resource = {
    ...newRes,
    id: `res-${Date.now()}`,
    views_count: 0,
    created_at: new Date().toISOString(),
  };

  // Sync with Backend Server DB
  if (typeof window !== 'undefined') {
    fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceToSave),
    }).catch((e) => console.warn('Backend resource sync error:', e));
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('resources') as any).insert([resourceToSave]).select().single();
      if (!error && data) return data as Resource;
    } catch (e) {
      console.error('Supabase create resource failed:', e);
    }
  }

  const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, []);
  const updated = [resourceToSave, ...list];
  setLocalItem(STORAGE_KEYS.RESOURCES, updated);
  return resourceToSave;
}

export async function deleteResource(id: string, fileUrl?: string): Promise<boolean> {
  // 1. Await Backend Server Permanent Delete (purges Supabase records, staged files, storage & disk files)
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams({ id });
      if (fileUrl) q.set('fileUrl', fileUrl);
      const res = await fetch(`/api/resources?${q.toString()}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        console.log('Successfully purged resource from server');
      }
    } catch (e) {
      console.warn('Backend resource delete error:', e);
    }
  }

  // 2. Direct Supabase Cloud delete fallback
  if (isSupabaseConfigured) {
    try {
      await supabase.from('resources').delete().eq('id', id);
      if (fileUrl) {
        const cleanName = fileUrl.split('/').pop() || '';
        if (cleanName) {
          await (supabase.from('resources') as any)
            .delete()
            .or(`file_url.ilike.%${cleanName}%,summary.ilike.%${cleanName}%`);
        }
      }
    } catch (e) {
      console.error('Supabase delete error:', e);
    }
  }

  // 3. Remove from local cache
  const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, []);
  const filtered = list.filter((r) => r.id !== id && (!fileUrl || r.file_url !== fileUrl));
  setLocalItem(STORAGE_KEYS.RESOURCES, filtered);
  return true;
}

export async function updateResource(id: string, updates: Partial<Resource>): Promise<Resource | null> {
  // Sync update with Backend Server DB
  if (typeof window !== 'undefined') {
    fetch('/api/resources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch((e) => console.warn('Backend resource update error:', e));
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('resources') as any).update(updates).eq('id', id).select().single();
      if (!error && data) return data as Resource;
    } catch (e) {
      console.error('Supabase update resource failed:', e);
    }
  }

  const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, []);
  const idx = list.findIndex((r) => r.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    setLocalItem(STORAGE_KEYS.RESOURCES, list);
    return list[idx];
  }
  return null;
}

// ----------------- SCHEDULES -----------------
export async function getSchedules(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  semesterNumber?: SemesterNumber;
  dayOfWeek?: DayOfWeek | 'الكل';
  sectionNumber?: SectionNumber | 'الكل';
  sessionType?: SessionType | 'الكل';
}): Promise<Schedule[]> {
  if (typeof window !== 'undefined') {
    try {
      const q = new URLSearchParams();
      if (params?.departmentId) q.set('departmentId', params.departmentId);
      if (params?.academicYear) q.set('academicYear', params.academicYear);
      if (params?.dayOfWeek && params.dayOfWeek !== 'الكل') q.set('dayOfWeek', params.dayOfWeek);
      if (params?.sectionNumber && params.sectionNumber !== 'الكل' && params.sectionNumber !== 'عام') {
        q.set('sectionNumber', params.sectionNumber);
      }
      const res = await fetch(`/api/schedules?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data as Schedule[];
      }
    } catch (e) {
      // fallback
    }
  }

  let schedules: Schedule[] = [];

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('schedules').select('*');
      if (params?.departmentId) query = query.eq('department_id', params.departmentId);
      if (params?.academicYear) query = query.eq('academic_year', params.academicYear);
      if (params?.dayOfWeek && params.dayOfWeek !== 'الكل') query = query.eq('day_of_week', params.dayOfWeek);

      const { data, error } = await query.order('start_time', { ascending: true });
      if (!error && data) {
        schedules = data as Schedule[];
      }
    } catch (e) {
      console.warn('Supabase schedules fetch failed', e);
    }
  }

  if (schedules.length === 0) {
    schedules = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  }

  const allDepts = await getDepartments();
  const allSubjs = await getSubjects();

  schedules = schedules.map((s) => {
    const sub = allSubjs.find((subj) => subj.id === s.subject_id);
    return {
      ...s,
      subject: sub,
      instructor_name: s.instructor_name || sub?.instructor_name || 'هيئة تدريس المعهد',
      department: allDepts.find((d) => d.id === s.department_id),
    };
  });

  if (params?.departmentId) {
    schedules = schedules.filter((s) => s.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    schedules = schedules.filter((s) => s.academic_year === params.academicYear);
  }
  if (params?.semesterNumber) {
    schedules = schedules.filter((s) => s.semester_number === params.semesterNumber || (s.subject && s.subject.semester_number === params.semesterNumber));
  }
  if (params?.dayOfWeek && params.dayOfWeek !== 'الكل') {
    schedules = schedules.filter((s) => s.day_of_week === params.dayOfWeek);
  }
  if (params?.sectionNumber && params.sectionNumber !== 'الكل') {
    schedules = schedules.filter(
      (s) => s.section_number === params.sectionNumber || s.section_number === 'عام'
    );
  }
  if (params?.sessionType && params.sessionType !== 'الكل') {
    schedules = schedules.filter((s) => s.session_type === params.sessionType);
  }

  return schedules;
}

export async function createSchedule(newSch: Omit<Schedule, 'id' | 'created_at'>): Promise<Schedule> {
  const item: Schedule = {
    ...newSch,
    id: `sch-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // Sync with Backend Server DB
  if (typeof window !== 'undefined') {
    fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).catch((e) => console.warn('Backend schedule sync error:', e));
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('schedules') as any).insert([item]).select().single();
      if (!error && data) return data as Schedule;
    } catch (e) {
      console.error('Supabase create schedule failed', e);
    }
  }

  const list = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  const updated = [...list, item];
  setLocalItem(STORAGE_KEYS.SCHEDULES, updated);
  return item;
}

export async function deleteSchedule(id: string): Promise<boolean> {
  // Sync delete with Backend Server DB
  if (typeof window !== 'undefined') {
    fetch(`/api/schedules?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch((e) => console.warn('Backend schedule delete error:', e));
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  const list = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  const filtered = list.filter((s) => s.id !== id);
  setLocalItem(STORAGE_KEYS.SCHEDULES, filtered);
  return true;
}

// ----------------- ANNOUNCEMENTS -----------------
export async function getAnnouncements(departmentId?: string): Promise<Announcement[]> {
  if (typeof window !== 'undefined') {
    try {
      const url = departmentId ? `/api/announcements?departmentId=${encodeURIComponent(departmentId)}` : '/api/announcements';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data as Announcement[];
      }
    } catch (e) {
      // fallback
    }
  }

  let announcements: Announcement[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (!error && data) {
        announcements = data as Announcement[];
      }
    } catch (e) {
      console.warn('Supabase announcements failed', e);
    }
  }

  if (announcements.length === 0) {
    announcements = getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  }

  if (departmentId) {
    announcements = announcements.filter(
      (a) => !a.department_id || a.department_id === departmentId
    );
  }

  return announcements;
}

export async function createAnnouncement(newAnn: Omit<Announcement, 'id' | 'created_at'>): Promise<Announcement> {
  const item: Announcement = {
    ...newAnn,
    id: `ann-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  // Sync with Backend Server DB
  if (typeof window !== 'undefined') {
    fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).catch((e) => console.warn('Backend announcement sync error:', e));
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('announcements') as any).insert([item]).select().single();
      if (!error && data) return data as Announcement;
    } catch (e) {
      console.error(e);
    }
  }

  const list = getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
  setLocalItem(STORAGE_KEYS.ANNOUNCEMENTS, [item, ...list]);
  return item;
}

// ----------------- BOOKMARKS (Local Student Storage) -----------------
export function getBookmarks(): string[] {
  return getLocalItem<string[]>(STORAGE_KEYS.BOOKMARKS, []);
}

export function toggleBookmark(resourceId: string): boolean {
  const current = getBookmarks();
  let updated: string[];
  let isBookmarked = false;
  if (current.includes(resourceId)) {
    updated = current.filter((id) => id !== resourceId);
    isBookmarked = false;
  } else {
    updated = [...current, resourceId];
    isBookmarked = true;
  }
  setLocalItem(STORAGE_KEYS.BOOKMARKS, updated);
  return isBookmarked;
}

// ----------------- USER PREFERENCES -----------------
export interface UserPreferences {
  departmentId: string;
  semesterNumber: SemesterNumber;
  academicYear: AcademicYear;
  sectionNumber: SectionNumber;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  departmentId: 'dept-surveying',
  semesterNumber: 1,
  academicYear: 'الفرقة الأولى',
  sectionNumber: 'عام',
};

export function getUserPreferences(): UserPreferences {
  return getLocalItem<UserPreferences>(STORAGE_KEYS.USER_PREFS, DEFAULT_PREFERENCES);
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getUserPreferences();
  const updated = { ...current, ...prefs };
  setLocalItem(STORAGE_KEYS.USER_PREFS, updated);
  return updated;
}

// ----------------- STUDENT ACCOUNTS (Sync & Personalization) -----------------
export function getCurrentStudent(): StudentUser | null {
  return getLocalItem<StudentUser | null>(STORAGE_KEYS.STUDENT_USER, null);
}

export function saveCurrentStudent(student: StudentUser): StudentUser {
  setLocalItem(STORAGE_KEYS.STUDENT_USER, student);

  // Keep in accounts directory for fast switching / persistence
  const accounts = getLocalItem<StudentUser[]>(STORAGE_KEYS.STUDENT_ACCOUNTS, []);
  const existingIdx = accounts.findIndex((a) => a.id === student.id || (student.student_code && a.student_code === student.student_code));
  if (existingIdx >= 0) {
    accounts[existingIdx] = student;
  } else {
    accounts.push(student);
  }
  setLocalItem(STORAGE_KEYS.STUDENT_ACCOUNTS, accounts);

  // Sync preferences immediately
  saveUserPreferences({
    departmentId: student.department_id,
    academicYear: student.academic_year,
    semesterNumber: student.semester_number,
    sectionNumber: student.section_number,
  });

  // Asynchronously sync with the backend database
  if (typeof window !== 'undefined') {
    fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    }).catch((err) => console.warn('Could not sync student with backend database:', err));
  }

  return student;
}

export async function loginStudentApi(query: string): Promise<StudentUser> {
  const res = await fetch('/api/auth/student-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'تعذر تسجيل الدخول، يرجى التحقق من البيانات.');
  }

  const student = (await res.json()) as StudentUser;
  saveCurrentStudent(student);
  return student;
}

export function logoutStudent(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.STUDENT_USER);
  }
}

export function getSavedStudentAccounts(): StudentUser[] {
  return getLocalItem<StudentUser[]>(STORAGE_KEYS.STUDENT_ACCOUNTS, []);
}
