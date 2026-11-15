import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Department, 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  AcademicYear, 
  ResourceType, 
  DayOfWeek,
  SectionNumber,
  SessionType
} from '@/types/database';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_SUBJECTS, 
  INITIAL_RESOURCES, 
  INITIAL_SCHEDULES, 
  INITIAL_ANNOUNCEMENTS 
} from '@/lib/mockData';

const STORAGE_KEYS = {
  DEPARTMENTS: 'iti_alex_departments',
  SUBJECTS: 'iti_alex_subjects',
  RESOURCES: 'iti_alex_resources',
  SCHEDULES: 'iti_alex_schedules',
  ANNOUNCEMENTS: 'iti_alex_announcements',
  BOOKMARKS: 'iti_alex_bookmarks',
  USER_PREFS: 'iti_alex_user_prefs',
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
export async function getSubjects(departmentId?: string, academicYear?: AcademicYear): Promise<Subject[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('subjects').select('*');
      if (departmentId) query = query.eq('department_id', departmentId);
      if (academicYear) query = query.eq('academic_year', academicYear);
      const { data, error } = await query.order('name_ar', { ascending: true });
      if (!error && data && data.length > 0) return data as Subject[];
    } catch (e) {
      console.warn('Supabase subjects fetch failed, falling back', e);
    }
  }

  let list = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  if (departmentId) list = list.filter((s) => s.department_id === departmentId);
  if (academicYear) list = list.filter((s) => s.academic_year === academicYear);
  return list;
}

// ----------------- RESOURCES -----------------
export async function getResources(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  type?: ResourceType | 'الكل';
  subjectId?: string;
  search?: string;
}): Promise<Resource[]> {
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
    resources = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  }

  const allDepts = await getDepartments();
  const allSubjs = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);

  // Attach joins
  resources = resources.map((r) => ({
    ...r,
    department: allDepts.find((d) => d.id === r.department_id),
    subject: allSubjs.find((s) => s.id === r.subject_id),
  }));

  // In-memory filters if needed
  if (params?.departmentId) {
    resources = resources.filter((r) => r.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    resources = resources.filter((r) => r.academic_year === params.academicYear);
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

export async function createResource(newRes: Omit<Resource, 'id' | 'views_count' | 'created_at'>): Promise<Resource> {
  const resourceToSave: Resource = {
    ...newRes,
    id: `res-${Date.now()}`,
    views_count: 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('resources') as any).insert([resourceToSave]).select().single();
      if (!error && data) return data as Resource;
    } catch (e) {
      console.error('Supabase create resource failed:', e);
    }
  }

  const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  const updated = [resourceToSave, ...list];
  setLocalItem(STORAGE_KEYS.RESOURCES, updated);
  return resourceToSave;
}

export async function deleteResource(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error('Supabase delete error:', e);
    }
  }

  const list = getLocalItem<Resource[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  const filtered = list.filter((r) => r.id !== id);
  setLocalItem(STORAGE_KEYS.RESOURCES, filtered);
  return true;
}

// ----------------- SCHEDULES -----------------
export async function getSchedules(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  dayOfWeek?: DayOfWeek | 'الكل';
  sectionNumber?: SectionNumber | 'الكل';
  sessionType?: SessionType | 'الكل';
}): Promise<Schedule[]> {
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
    schedules = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  }

  const allDepts = await getDepartments();
  const allSubjs = getLocalItem<Subject[]>(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);

  schedules = schedules.map((s) => ({
    ...s,
    department: allDepts.find((d) => d.id === s.department_id),
    subject: allSubjs.find((subj) => subj.id === s.subject_id),
  }));

  if (params?.departmentId) {
    schedules = schedules.filter((s) => s.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    schedules = schedules.filter((s) => s.academic_year === params.academicYear);
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

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('schedules') as any).insert([item]).select().single();
      if (!error && data) return data as Schedule;
    } catch (e) {
      console.error('Supabase create schedule failed', e);
    }
  }

  const list = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  const updated = [...list, item];
  setLocalItem(STORAGE_KEYS.SCHEDULES, updated);
  return item;
}

export async function deleteSchedule(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.error(e);
    }
  }
  const list = getLocalItem<Schedule[]>(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
  setLocalItem(STORAGE_KEYS.SCHEDULES, list.filter((s) => s.id !== id));
  return true;
}

// ----------------- ANNOUNCEMENTS -----------------
export async function getAnnouncements(departmentId?: string): Promise<Announcement[]> {
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
    announcements = getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
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

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase.from('announcements') as any).insert([item]).select().single();
      if (!error && data) return data as Announcement;
    } catch (e) {
      console.error(e);
    }
  }

  const list = getLocalItem<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
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
  academicYear: AcademicYear;
  semester: 'الترم الأول' | 'الترم الثاني';
  sectionNumber: SectionNumber;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  departmentId: 'dept-surveying',
  academicYear: 'الفرقة الأولى',
  semester: 'الترم الأول',
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
