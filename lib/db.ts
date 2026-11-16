import fs from 'fs';
import path from 'path';
import { 
  StudentUser, 
  Subject, 
  Resource, 
  Schedule, 
  Announcement, 
  Department, 
  AcademicYear, 
  SemesterNumber, 
  SectionNumber, 
  ResourceType, 
  DayOfWeek, 
  SessionType 
} from '@/types/database';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_SUBJECTS, 
  INITIAL_RESOURCES, 
  INITIAL_SCHEDULES, 
  INITIAL_ANNOUNCEMENTS 
} from '@/lib/mockData';

interface DatabaseSchema {
  departments: Department[];
  students: StudentUser[];
  subjects: Subject[];
  resources: Resource[];
  schedules: Schedule[];
  announcements: Announcement[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory and initial file exist
function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      departments: INITIAL_DEPARTMENTS,
      students: [
        {
          id: 'student-demo-1',
          name: 'محمد أحمد إبراهيم',
          student_code: '20241001',
          phone: '01012345678',
          department_id: 'dept-surveying',
          department_name: 'شعبة المساحة العامة',
          academic_year: 'الفرقة الأولى',
          semester_number: 1,
          section_number: 'سكشن 1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'student-demo-2',
          name: 'علي حسن علي',
          student_code: '20242002',
          phone: '01123456789',
          department_id: 'dept-surveying',
          department_name: 'شعبة المساحة العامة',
          academic_year: 'الفرقة الثانية',
          semester_number: 3,
          section_number: 'سكشن 2',
          created_at: new Date().toISOString(),
        }
      ],
      subjects: INITIAL_SUBJECTS,
      resources: INITIAL_RESOURCES,
      schedules: INITIAL_SCHEDULES,
      announcements: INITIAL_ANNOUNCEMENTS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    // Auto-migrate if any keys are missing
    let modified = false;
    if (!parsed.departments) { parsed.departments = INITIAL_DEPARTMENTS; modified = true; }
    if (!parsed.students) { parsed.students = []; modified = true; }
    if (!parsed.subjects || parsed.subjects.length < 32) { parsed.subjects = INITIAL_SUBJECTS; modified = true; }
    if (!parsed.resources) { parsed.resources = INITIAL_RESOURCES; modified = true; }
    if (!parsed.schedules) { parsed.schedules = INITIAL_SCHEDULES; modified = true; }
    if (!parsed.announcements) { parsed.announcements = INITIAL_ANNOUNCEMENTS; modified = true; }

    if (modified) {
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (e) {
    console.error('Error reading db.json, re-initializing', e);
    const fallback: DatabaseSchema = {
      departments: INITIAL_DEPARTMENTS,
      students: [],
      subjects: INITIAL_SUBJECTS,
      resources: INITIAL_RESOURCES,
      schedules: INITIAL_SCHEDULES,
      announcements: INITIAL_ANNOUNCEMENTS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

// Write to database file atomically
function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json:', e);
  }
}

// ====================================================================
// STUDENTS CRUD & AUTHENTICATION
// ====================================================================

export function dbGetStudents(): StudentUser[] {
  const db = initDb();
  return db.students || [];
}

export function dbFindStudent(query: { id?: string; code?: string; name?: string }): StudentUser | null {
  const students = dbGetStudents();
  if (query.id) {
    const found = students.find((s) => s.id === query.id);
    if (found) return found;
  }
  if (query.code) {
    const found = students.find((s) => s.student_code === query.code);
    if (found) return found;
  }
  if (query.name) {
    const cleanQuery = query.name.trim().toLowerCase();
    const found = students.find((s) => s.name.trim().toLowerCase() === cleanQuery);
    if (found) return found;
  }
  return null;
}

export function dbCreateOrUpdateStudent(student: Omit<StudentUser, 'id' | 'created_at'> & { id?: string }): StudentUser {
  const db = initDb();
  const existingIdx = db.students.findIndex(
    (s) => (student.id && s.id === student.id) || 
           (student.student_code && s.student_code === student.student_code) ||
           (s.name.trim().toLowerCase() === student.name.trim().toLowerCase())
  );

  const finalRecord: StudentUser = {
    ...student,
    id: existingIdx >= 0 ? db.students[existingIdx].id : (student.id || `student-${Date.now()}`),
    created_at: existingIdx >= 0 ? db.students[existingIdx].created_at : new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    db.students[existingIdx] = finalRecord;
  } else {
    db.students.unshift(finalRecord);
  }

  writeDb(db);
  return finalRecord;
}

// ====================================================================
// SUBJECTS (32 Subjects Across 4 Semesters)
// ====================================================================

export function dbGetSubjects(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  semesterNumber?: SemesterNumber;
}): Subject[] {
  const db = initDb();
  let list = db.subjects || [];

  if (params?.departmentId) {
    list = list.filter((s) => s.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    list = list.filter((s) => s.academic_year === params.academicYear);
  }
  if (params?.semesterNumber) {
    list = list.filter((s) => s.semester_number === params.semesterNumber);
  }

  return list;
}

// ====================================================================
// RESOURCES (Lectures, Sheets, Practical Notes, Question Banks)
// ====================================================================

export function dbGetResources(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  semesterNumber?: SemesterNumber;
  type?: ResourceType | 'الكل';
  subjectId?: string;
  search?: string;
  reviewStatus?: 'approved' | 'pending_review' | 'rejected' | 'all';
}): Resource[] {
  const db = initDb();
  let list = db.resources || [];
  const subjects = db.subjects || [];
  const departments = db.departments || [];

  // Attach joins
  list = list.map((r) => ({
    ...r,
    subject: subjects.find((s) => s.id === r.subject_id),
    department: departments.find((d) => d.id === r.department_id),
  }));

  if (params?.departmentId) {
    list = list.filter((r) => r.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    list = list.filter((r) => r.academic_year === params.academicYear);
  }
  if (params?.semesterNumber) {
    list = list.filter((r) => r.semester_number === params.semesterNumber || (r.subject && r.subject.semester_number === params.semesterNumber));
  }
  if (params?.type && params.type !== 'الكل') {
    list = list.filter((r) => r.type === params.type);
  }
  if (params?.subjectId && params.subjectId !== 'all') {
    list = list.filter((r) => r.subject_id === params.subjectId);
  }
  if (params?.reviewStatus && params.reviewStatus !== 'all') {
    if (params.reviewStatus === 'approved') {
      list = list.filter((r) => !r.review_status || r.review_status === 'approved');
    } else {
      list = list.filter((r) => r.review_status === params.reviewStatus);
    }
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.toLowerCase().trim();
    list = list.filter((r) => 
      r.title.toLowerCase().includes(q) || 
      r.summary.toLowerCase().includes(q) ||
      (r.subject?.name_ar && r.subject.name_ar.toLowerCase().includes(q))
    );
  }

  return list;
}

export function dbCreateResource(item: Omit<Resource, 'id' | 'views_count' | 'created_at'>): Resource {
  const db = initDb();
  let semNumber = item.semester_number;
  if (!semNumber && item.subject_id) {
    const subj = db.subjects?.find((s) => s.id === item.subject_id);
    if (subj?.semester_number) semNumber = subj.semester_number;
  }
  if (!semNumber) {
    semNumber = item.academic_year === 'الفرقة الثانية' ? 3 : 1;
  }

  const newRecord: Resource = {
    ...item,
    semester_number: semNumber,
    review_status: item.review_status || 'approved',
    id: `res-${Date.now()}`,
    views_count: 0,
    created_at: new Date().toISOString(),
  };

  db.resources.unshift(newRecord);
  writeDb(db);
  return newRecord;
}

export function dbUpdateResource(id: string, updates: Partial<Resource>): Resource | null {
  const db = initDb();
  const idx = db.resources.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  db.resources[idx] = {
    ...db.resources[idx],
    ...updates,
  };
  writeDb(db);
  return db.resources[idx];
}

export function dbDeleteResource(id: string): boolean {
  const db = initDb();
  const initLen = db.resources.length;
  db.resources = db.resources.filter((r) => r.id !== id);
  if (db.resources.length !== initLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ====================================================================
// SCHEDULES
// ====================================================================

export function dbGetSchedules(params?: {
  departmentId?: string;
  academicYear?: AcademicYear;
  dayOfWeek?: DayOfWeek;
  sectionNumber?: SectionNumber;
}): Schedule[] {
  const db = initDb();
  let list = db.schedules || [];
  const subjects = db.subjects || [];

  list = list.map((sch) => ({
    ...sch,
    subject: subjects.find((s) => s.id === sch.subject_id),
  }));

  if (params?.departmentId) {
    list = list.filter((s) => s.department_id === params.departmentId);
  }
  if (params?.academicYear) {
    list = list.filter((s) => s.academic_year === params.academicYear);
  }
  if (params?.dayOfWeek) {
    list = list.filter((s) => s.day_of_week === params.dayOfWeek);
  }
  if (params?.sectionNumber && params.sectionNumber !== 'عام') {
    list = list.filter((s) => s.section_number === params.sectionNumber || s.section_number === 'عام');
  }

  return list;
}

export function dbCreateSchedule(item: Omit<Schedule, 'id' | 'created_at'>): Schedule {
  const db = initDb();
  const newRecord: Schedule = {
    ...item,
    id: `sch-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  db.schedules.unshift(newRecord);
  writeDb(db);
  return newRecord;
}

export function dbDeleteSchedule(id: string): boolean {
  const db = initDb();
  const initLen = db.schedules.length;
  db.schedules = db.schedules.filter((s) => s.id !== id);
  if (db.schedules.length !== initLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// ====================================================================
// ANNOUNCEMENTS
// ====================================================================

export function dbGetAnnouncements(departmentId?: string): Announcement[] {
  const db = initDb();
  let list = db.announcements || [];
  if (departmentId) {
    list = list.filter((a) => !a.department_id || a.department_id === departmentId);
  }
  return list;
}

export function dbCreateAnnouncement(item: Omit<Announcement, 'id' | 'created_at'>): Announcement {
  const db = initDb();
  const newRecord: Announcement = {
    ...item,
    id: `ann-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  db.announcements.unshift(newRecord);
  writeDb(db);
  return newRecord;
}

// ====================================================================
// DEPARTMENTS
// ====================================================================

export function dbGetDepartments(): Department[] {
  const db = initDb();
  return db.departments || INITIAL_DEPARTMENTS;
}
