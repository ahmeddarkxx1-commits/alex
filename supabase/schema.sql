-- ====================================================================
-- منصة المعهد الفني الصناعي بالإسكندرية (ITI Alex Hub)
-- Schema Definition: Database Tables, Indexes, Constraints & RLS Policies
-- ====================================================================

-- 1. تفعيل الامتدادات المطلوبة (UUID Generator)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. جدول الشعب الدراسية (departments)
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    short_name VARCHAR(64) NOT NULL,
    description TEXT,
    icon_name VARCHAR(64) DEFAULT 'BookOpen',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. جدول المواد الدراسية (subjects)
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    academic_year VARCHAR(32) NOT NULL CHECK (academic_year IN ('الفرقة الأولى', 'الفرقة الثانية')),
    semester VARCHAR(32) NOT NULL CHECK (semester IN ('الترم الأول', 'الترم الثاني')),
    name_ar VARCHAR(255) NOT NULL,
    code VARCHAR(32),
    instructor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. جدول الملخصات والشيتات وبنوك الأسئلة (resources)
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(32) NOT NULL CHECK (academic_year IN ('الفرقة الأولى', 'الفرقة الثانية')),
    type VARCHAR(64) NOT NULL CHECK (type IN ('تلخيص محاضرة', 'شيت وتكليف', 'مذكرة سكشن عملي', 'بنك أسئلة وامتحانات')),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content_markdown TEXT,
    file_url TEXT,
    due_date TIMESTAMPTZ,
    week_number INT,
    author_name VARCHAR(128) DEFAULT 'مندوب الشعبة',
    is_pinned BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. جدول المحاضرات والسكاشن والورش (schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    academic_year VARCHAR(32) NOT NULL CHECK (academic_year IN ('الفرقة الأولى', 'الفرقة الثانية')),
    day_of_week VARCHAR(32) NOT NULL CHECK (day_of_week IN ('السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(64) NOT NULL CHECK (session_type IN ('محاضرة نظري', 'سكشن عملي', 'ورشة', 'معمل')),
    section_number VARCHAR(32) NOT NULL CHECK (section_number IN ('عام', 'سكشن 1', 'سكشن 2', 'سكشن 3', 'سكشن 4')),
    location_room VARCHAR(128) NOT NULL,
    instructor_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. جدول المواعيد الهامة والتنبيهات (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL, -- Nullable يعني إعلان عام لكل المعهد
    title VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('تسليم شيت', 'امتحان عملي', 'ميدتيرم', 'تنبيه إداري')),
    urgency VARCHAR(32) NOT NULL CHECK (urgency IN ('عاجل جداً', 'هام', 'عادي')),
    event_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. جدول مديري المنصة ومناديب الشعب (admins)
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('super_admin', 'dept_rep')),
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ====================================================================
-- إنشاء الفهارس لتسريع استعلامات الطلاب وفلاتر البحث
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_subjects_dept_year ON public.subjects(department_id, academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_resources_filter ON public.resources(department_id, academic_year, type, is_pinned);
CREATE INDEX IF NOT EXISTS idx_resources_due ON public.resources(due_date);
CREATE INDEX IF NOT EXISTS idx_schedules_lookup ON public.schedules(department_id, academic_year, day_of_week, section_number);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active, urgency, event_date);

-- ====================================================================
-- سياسات الأمان والحماية (Row Level Security - RLS)
-- ====================================================================

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 1) القراءة متاحة للجميع (Students & Public Access) بدون أي تسجيل دخول
CREATE POLICY "Public read for departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public read for subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public read for resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public read for schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Public read for announcements" ON public.announcements FOR SELECT USING (true);

-- 2) جدول الأدمن: قراءة ملفه الشخصي فقط
CREATE POLICY "Admins can view their own profile or Super Admin sees all" ON public.admins
FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role = 'super_admin')
);

-- 3) سياسات التعديل والإضافة والحذف (Super Admin & Department Representatives)
-- دوال مساعدة للتحقق من الصلاحيات:
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_manage_dept(dept_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admins
        WHERE id = auth.uid() AND (role = 'super_admin' OR assigned_department_id = dept_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سياسات جدول resources (المذكرات والشيتات)
CREATE POLICY "Authorized reps and admins can insert resources" ON public.resources
FOR INSERT WITH CHECK (public.can_manage_dept(department_id));

CREATE POLICY "Authorized reps and admins can update resources" ON public.resources
FOR UPDATE USING (public.can_manage_dept(department_id));

CREATE POLICY "Authorized reps and admins can delete resources" ON public.resources
FOR DELETE USING (public.can_manage_dept(department_id));

-- سياسات جدول schedules (الجداول والسكاشن)
CREATE POLICY "Authorized reps and admins can insert schedules" ON public.schedules
FOR INSERT WITH CHECK (public.can_manage_dept(department_id));

CREATE POLICY "Authorized reps and admins can update schedules" ON public.schedules
FOR UPDATE USING (public.can_manage_dept(department_id));

CREATE POLICY "Authorized reps and admins can delete schedules" ON public.schedules
FOR DELETE USING (public.can_manage_dept(department_id));

-- سياسات جدول announcements (التنبيهات)
CREATE POLICY "Authorized reps and admins can insert announcements" ON public.announcements
FOR INSERT WITH CHECK (
    department_id IS NULL AND public.is_super_admin() OR
    department_id IS NOT NULL AND public.can_manage_dept(department_id)
);

CREATE POLICY "Authorized reps and admins can update announcements" ON public.announcements
FOR UPDATE USING (
    department_id IS NULL AND public.is_super_admin() OR
    department_id IS NOT NULL AND public.can_manage_dept(department_id)
);

CREATE POLICY "Authorized reps and admins can delete announcements" ON public.announcements
FOR DELETE USING (
    department_id IS NULL AND public.is_super_admin() OR
    department_id IS NOT NULL AND public.can_manage_dept(department_id)
);

-- سياسات الشعب والمواد (خاصة بالسوبر أدمن فقط)
CREATE POLICY "Super admin can manage departments" ON public.departments
FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super admin can manage subjects" ON public.subjects
FOR ALL USING (public.is_super_admin());

