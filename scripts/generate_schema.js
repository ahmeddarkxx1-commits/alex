const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val.toString();
  return "'" + val.toString().replace(/'/g, "''") + "'";
}

let sql = `-- ====================================================================
-- منصة المعهد الفني الصناعي بالإسكندرية (ITI Alex Hub) - شعبة المساحة العامة
-- Supabase Schema Definition & Comprehensive Seed Data
-- ====================================================================

-- 1. جدول الشعب والأقسام (departments)
CREATE TABLE IF NOT EXISTS public.departments (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    description TEXT,
    icon_name VARCHAR(64) DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. جدول المواد والمقررات الأكاديمية الـ 32 (subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    semester VARCHAR(64) NOT NULL,
    semester_number INT NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    code VARCHAR(32),
    instructor_name VARCHAR(255),
    description TEXT,
    icon_name VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. جدول المحتوى الأكاديمي والشيتات والمذكرات (resources)
CREATE TABLE IF NOT EXISTS public.resources (
    id VARCHAR(128) PRIMARY KEY,
    department_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    semester_number INT NOT NULL DEFAULT 1,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content_markdown TEXT,
    file_url TEXT,
    due_date TIMESTAMPTZ,
    week_number INT DEFAULT 1,
    author_name VARCHAR(128) DEFAULT 'مندوب الشعبة',
    is_pinned BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    review_status VARCHAR(32) DEFAULT 'approved',
    reviewer_name VARCHAR(128),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. جدول الفترات والمحاضرات والسكاشن الأسبوعية (schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) NOT NULL,
    subject_id VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    semester_number INT DEFAULT 1,
    day_of_week VARCHAR(32) NOT NULL,
    start_time VARCHAR(32) NOT NULL,
    end_time VARCHAR(32) NOT NULL,
    session_type VARCHAR(64) NOT NULL,
    section_number VARCHAR(32) NOT NULL,
    location_room VARCHAR(128) NOT NULL,
    instructor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. جدول التنبيهات والإعلانات الرسمية (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64),
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    urgency VARCHAR(32) NOT NULL,
    event_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. جدول حسابات الطلاب المسجلين (students)
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    student_code VARCHAR(64),
    phone VARCHAR(32),
    department_id VARCHAR(64) DEFAULT 'dept-surveying',
    department_name VARCHAR(255) DEFAULT 'شعبة المساحة العامة',
    academic_year VARCHAR(32) NOT NULL,
    semester_number INT NOT NULL,
    section_number VARCHAR(32) DEFAULT 'سكشن 1',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. جدول مديري المنصة والمشرفين (admins)
CREATE TABLE IF NOT EXISTS public.admins (
    id VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    assigned_department_id VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_subjects_lookup ON public.subjects(department_id, academic_year, semester_number);
CREATE INDEX IF NOT EXISTS idx_resources_lookup ON public.resources(department_id, academic_year, semester_number, review_status);
CREATE INDEX IF NOT EXISTS idx_schedules_lookup ON public.schedules(department_id, academic_year, day_of_week);
CREATE INDEX IF NOT EXISTS idx_students_lookup ON public.students(student_code, academic_year);

-- تفعيل سياسات الأمان RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة والكتابة المفتوحة لمزامنة المنصة
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public all access for departments" ON public.departments;
    CREATE POLICY "Public all access for departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for subjects" ON public.subjects;
    CREATE POLICY "Public all access for subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for resources" ON public.resources;
    CREATE POLICY "Public all access for resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for schedules" ON public.schedules;
    CREATE POLICY "Public all access for schedules" ON public.schedules FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for announcements" ON public.announcements;
    CREATE POLICY "Public all access for announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for students" ON public.students;
    CREATE POLICY "Public all access for students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public all access for admins" ON public.admins;
    CREATE POLICY "Public all access for admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
END
$$;

-- ====================================================================
-- SEED DATA: تحميل البيانات الأكاديمية والمقررات الـ 32 والجداول
-- ====================================================================
`;

// Departments Seed
sql += '\n-- Departments\nINSERT INTO public.departments (id, slug, name_ar, short_name, description, icon_name)\nVALUES\n';
sql += db.departments.map(d => `(${escapeSql(d.id)}, ${escapeSql(d.slug)}, ${escapeSql(d.name_ar)}, ${escapeSql(d.short_name)}, ${escapeSql(d.description)}, ${escapeSql(d.icon_name)})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, description = EXCLUDED.description;\n';

// Subjects Seed
sql += '\n-- Subjects (All 32 surveying subjects across 4 semesters)\nINSERT INTO public.subjects (id, department_id, academic_year, semester, semester_number, name_ar, code, instructor_name, description, icon_name)\nVALUES\n';
sql += db.subjects.map(s => `(${escapeSql(s.id)}, ${escapeSql(s.department_id)}, ${escapeSql(s.academic_year)}, ${escapeSql(s.semester)}, ${s.semester_number || 1}, ${escapeSql(s.name_ar)}, ${escapeSql(s.code)}, ${escapeSql(s.instructor_name)}, ${escapeSql(s.description)}, ${escapeSql(s.icon_name)})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, instructor_name = EXCLUDED.instructor_name, description = EXCLUDED.description;\n';

// Resources Seed
sql += '\n-- Resources (Curated PDF sheets & lectures)\nINSERT INTO public.resources (id, department_id, subject_id, academic_year, semester_number, type, title, summary, content_markdown, file_url, due_date, week_number, author_name, is_pinned, views_count, review_status, reviewer_name, reviewed_at)\nVALUES\n';
sql += db.resources.map(r => `(${escapeSql(r.id)}, ${escapeSql(r.department_id)}, ${escapeSql(r.subject_id)}, ${escapeSql(r.academic_year)}, ${r.semester_number || 1}, ${escapeSql(r.type)}, ${escapeSql(r.title)}, ${escapeSql(r.summary)}, ${escapeSql(r.content_markdown)}, ${escapeSql(r.file_url)}, ${escapeSql(r.due_date)}, ${r.week_number || 1}, ${escapeSql(r.author_name)}, ${r.is_pinned ? 'TRUE' : 'FALSE'}, ${r.views_count || 0}, ${escapeSql(r.review_status || 'approved')}, ${escapeSql(r.reviewer_name)}, ${escapeSql(r.reviewed_at)})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, review_status = EXCLUDED.review_status;\n';

// Schedules Seed
sql += '\n-- Schedules\nINSERT INTO public.schedules (id, department_id, subject_id, academic_year, semester_number, day_of_week, start_time, end_time, session_type, section_number, location_room, instructor_name)\nVALUES\n';
sql += db.schedules.map(sc => `(${escapeSql(sc.id)}, ${escapeSql(sc.department_id)}, ${escapeSql(sc.subject_id)}, ${escapeSql(sc.academic_year)}, ${sc.semester_number || 1}, ${escapeSql(sc.day_of_week)}, ${escapeSql(sc.start_time)}, ${escapeSql(sc.end_time)}, ${escapeSql(sc.session_type)}, ${escapeSql(sc.section_number)}, ${escapeSql(sc.location_room)}, ${escapeSql(sc.instructor_name)})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET location_room = EXCLUDED.location_room, instructor_name = EXCLUDED.instructor_name;\n';

// Announcements Seed
sql += '\n-- Announcements\nINSERT INTO public.announcements (id, department_id, title, details, category, urgency, event_date, is_active)\nVALUES\n';
sql += db.announcements.map(a => `(${escapeSql(a.id)}, ${escapeSql(a.department_id)}, ${escapeSql(a.title)}, ${escapeSql(a.details)}, ${escapeSql(a.category)}, ${escapeSql(a.urgency)}, ${escapeSql(a.event_date)}, ${a.is_active ? 'TRUE' : 'FALSE'})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, details = EXCLUDED.details;\n';

const outPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully generated complete schema.sql at: ' + outPath + ' (Bytes: ' + sql.length + ')');
