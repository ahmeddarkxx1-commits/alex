export type AcademicYear = 'الفرقة الأولى' | 'الفرقة الثانية';
export type AcademicSemester = 'الترم الأول' | 'الترم الثاني';
export type ResourceType = 'تلخيص محاضرة' | 'شيت وتكليف' | 'مذكرة سكشن عملي' | 'بنك أسئلة وامتحانات';
export type SessionType = 'محاضرة نظري' | 'سكشن عملي' | 'ورشة' | 'معمل';
export type SectionNumber = 'عام' | 'سكشن 1' | 'سكشن 2' | 'سكشن 3' | 'سكشن 4';
export type DayOfWeek = 'السبت' | 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
export type AnnouncementCategory = 'تسليم شيت' | 'امتحان عملي' | 'ميدتيرم' | 'تنبيه إداري';
export type UrgencyLevel = 'عاجل جداً' | 'هام' | 'عادي';
export type AdminRole = 'super_admin' | 'dept_rep';

export interface Department {
  id: string;
  slug: string;
  name_ar: string;
  short_name: string;
  description: string;
  icon_name: string;
  created_at?: string;
}

export interface Subject {
  id: string;
  department_id: string;
  academic_year: AcademicYear;
  semester: AcademicSemester;
  name_ar: string;
  code?: string;
  instructor_name?: string;
  created_at?: string;
}

export interface Resource {
  id: string;
  department_id: string;
  subject_id: string;
  academic_year: AcademicYear;
  type: ResourceType;
  title: string;
  summary: string;
  content_markdown: string;
  file_url?: string | null;
  due_date?: string | null;
  week_number?: number;
  author_name: string;
  is_pinned: boolean;
  views_count: number;
  created_at: string;
  // Joins / Populated fields for frontend convenience
  department?: Department;
  subject?: Subject;
}

export interface Schedule {
  id: string;
  department_id: string;
  subject_id: string;
  academic_year: AcademicYear;
  day_of_week: DayOfWeek;
  start_time: string; // HH:mm format
  end_time: string;   // HH:mm format
  session_type: SessionType;
  section_number: SectionNumber;
  location_room: string;
  instructor_name?: string;
  created_at?: string;
  // Joins
  subject?: Subject;
  department?: Department;
}

export interface Announcement {
  id: string;
  department_id?: string | null;
  title: string;
  details: string;
  category: AnnouncementCategory;
  urgency: UrgencyLevel;
  event_date?: string | null;
  is_active: boolean;
  created_at: string;
  // Joins
  department?: Department;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  assigned_department_id?: string | null;
  created_at: string;
}

// Supabase Database Mapping
export interface Database {
  public: {
    Tables: {
      departments: {
        Row: Department;
        Insert: Omit<Department, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Department>;
      };
      subjects: {
        Row: Subject;
        Insert: Omit<Subject, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Subject>;
      };
      resources: {
        Row: Resource;
        Insert: Omit<Resource, 'id' | 'created_at' | 'views_count'> & { id?: string; created_at?: string; views_count?: number };
        Update: Partial<Resource>;
      };
      schedules: {
        Row: Schedule;
        Insert: Omit<Schedule, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Schedule>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Announcement, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Announcement>;
      };
      admins: {
        Row: AdminUser;
        Insert: AdminUser;
        Update: Partial<AdminUser>;
      };
    };
  };
}
