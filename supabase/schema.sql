-- ====================================================================
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

-- Departments
INSERT INTO public.departments (id, slug, name_ar, short_name, description, icon_name)
VALUES
('dept-surveying', 'surveying', 'شعبة المساحة العامة', 'المساحة العامة', 'أعمال الرفع المساحي الميداني، أجهزة الميزان والتوتال ستيشن، نظم المعلومات الجغرافية، والمساحة التصويرية والرقمية وحساب الكميات.', 'Compass'),
('dept-arch-civil', 'architecture-civil', 'شعبة العمارة والإنشاءات المدنية', 'عمارة ومدني', 'الرسم المعماري، تكنولوجيا الخرسانة، ميكانيكا التربة، وحصر الكميات الإنشائية.', 'Building2'),
('dept-electrical', 'electrical-networks', 'شعبة الشبكات والآلات الكهربية', 'كهرباء وقوى', 'شبكات التوزيع ومحطات المحولات، الآلات الكهربية، ولوحات التحكم والتوزيع الصناعية.', 'Zap'),
('dept-electronics', 'electronics-computers', 'شعبة الأجهزة الإلكترونية والحاسبات', 'إلكترونيات وحاسبات', 'الدوائر الإلكترونية، المتحكمات الدقيقة، شبكات الاتصالات، وصيانة الحاسب الآلي.', 'Cpu'),
('dept-refrigeration', 'refrigeration-ac', 'شعبة التبريد وتكييف الهواء', 'تبريد وتكييف', 'دورات التبريد، حساب الأحمال الحرارية، ونظم التكييف المركزي والمستودعات المبردة.', 'Snowflake'),
('dept-mechanics', 'mechanical-production', 'شعبة التشغيل والتشكيل وتكنولوجيا الإنتاج', 'تشغيل وميكانيكا', 'ماكينات الخراطة والتفريز، تشكيل المعادن، تكنولوجيا القياسات، وأساسيات التحكم CNC.', 'Wrench'),
('dept-automotive', 'automotive', 'شعبة ميكانيكا وكهرباء السيارات', 'سيارات ومحركات', 'محركات الاحتراق الداخلي بنزين وديزل، نظم الحقن الإلكتروني، وأجهزة الفحص OBD.', 'Car')
ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, description = EXCLUDED.description;

-- Subjects (All 32 surveying subjects across 4 semesters)
INSERT INTO public.subjects (id, department_id, academic_year, semester, semester_number, name_ar, code, instructor_name, description, icon_name)
VALUES
('subj-sem1-1', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'أجهزة مساحية', 'SURV-101', 'د. إبراهيم عبد العزيز', 'أجهزة الميزان بأنواعه، الثيودوليت، البوصلة المساحية، أشرطة القياس، واختبارات وضبط خط التسديد.', 'Crosshair'),
('subj-sem1-2', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'تطبيقات مساحه مستويه', 'SURV-102', 'م. حسام الدين توفيق', 'التمارين الحقلية العملية على الرفع بالشريط وإقامة وإسقاط الأعمدة والميزانيات الطولية والشبكية في أرض المعهد.', 'MapPin'),
('subj-sem1-3', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'رسم فني', 'ENG-101', 'م. سارة محمود', 'أدوات الرسم الهندسي، العمليات الهندسية، الإسقاط العمودي، رسم المساقط الثلاثة والقطاعات الهندسية.', 'PenTool'),
('subj-sem1-4', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'مساحه مستويه', 'SURV-103', 'د. محمد أبو العز', 'النظريات والقوانين الرياضية للمساحة المستوية، تصحيحات قياس الأطوال (الحرارة، الشد، الترهيم)، ومبادئ الميزانية.', 'Ruler'),
('subj-sem1-5', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'رياضيات', 'MATH-101', 'د. عادل القاضي', 'حساب المثلثات المستوية والكروية، المتجهات، الدوال والتفاضل والتكامل وتطبيقاتها في حساب المسافات والمساحات.', 'Binary'),
('subj-sem1-6', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'تكنولوجيا المعلومات', 'IT-101', 'م. أحمد شكري', 'أساسيات الحاسب الآلي ونظم التشغيل، معالجة الجداول الحسابية Excel لمعادلات المساحة، وحفظ وتنسيق البيانات.', 'Monitor'),
('subj-sem1-7', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'لغة انجليزية', 'ENG-102', 'د. ريهام عبد الحميد', 'المصطلحات الهندسية والمساحية الأساسية وقواعد اللغة الإنجليزية للتعامل مع كتالوجات الأجهزة ومواصفات المشاريع.', 'Languages'),
('subj-sem1-8', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الأول', 1, 'السلامة المهنية', 'SAFE-101', 'م. أيمن الغرباوي', 'إجراءات الصحة والسلامة المهنية في المواقع الإنشائية وأثناء أعمال الرصد الميداني في الطرق ومواقع العمل.', 'ShieldAlert'),
('subj-sem2-1', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'مساحة جيوديسية', 'SURV-104', 'د. مدحت الشناوي', 'شكل الأرض والمراجع الجيوديسية (Ellipsoid & Geoid)، انحناء الأرض وتأثيره، وشبكات المثلثات ورصد الأقمار الصناعية GPS.', 'Globe2'),
('subj-sem2-2', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'تطبيقات مساحة جيوديسية', 'SURV-105', 'م. عمر سامي', 'تطبيقات حقلية باستخدام مستقبلات GPS / GNSS الثابتة والمتحركة (RTK) وربط المحطات بالشبكة الوطنية.', 'Navigation'),
('subj-sem2-3', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'تك معلومات متقدمة', 'IT-102', 'م. يوسف النجار', 'إدارة قواعد البيانات المكانية وتطوير شيتات حسابية برمجية لأتمتة تفريغ القياسات الميدانية وحساب المناسيب.', 'Database'),
('subj-sem2-4', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'كميات ومواصفات', 'CIV-101', 'م. أحمد الشريف', 'حصر كميات الحفر والردم لمشاريع الطرق وقنوات الري، إعداد جداول الحصر والمستخلصات الشهرية لمقاولي التنفيذ.', 'Calculator'),
('subj-sem2-5', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'قوانين وتشريعات تخصصية', 'LAW-101', 'د. مجدي كمال', 'قوانين نزع الملكية للمنفعة العامة، السجل العيني، لوائح نقابة التطبيقيين والمسؤولية القانونية للمساح المعتمد.', 'Scale'),
('subj-sem2-6', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'نظرية الأخطاء', 'SURV-106', 'د. طارق السعيد', 'أنواع الأخطاء (نظامية، عفوية، جسيمة)، الانحراف المعياري، حساب خطأ القفل الزاوي وتوزيع الأخطاء بطريقة المربعات الصغرى.', 'Percent'),
('subj-sem2-7', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'رسم تخصصي', 'ENG-103', 'م. سارة محمود', 'رسم اللوحات الطبوغرافية اليدوية وتوقيع مضلعات الترافرس ومقاييس الرسم المساحية واستخدام الرموز والاصطلاحات المعتمدة.', 'Layers'),
('subj-sem2-8', 'dept-surveying', 'الفرقة الأولى', 'الفصل الدراسي الثاني', 2, 'تصنيف تربة ومحاصيل', 'AGRI-101', 'د. مصطفى العوضي', 'دراسة أنواع التربة وتأثيرها على استقرار الأجهزة والمباني، وشبكات الري والصرف الزراعي وعلاقتها بالمشاريع المساحية.', 'Wheat'),
('subj-sem3-1', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'مساحة انفاق', 'SURV-201', 'د. خالد عبد السميع', 'أعمال التوجيه المساحي الدقيق للأنفاق ومترو الأنفاق، أجهزة الليزر، نقل الإحداثيات من السطح إلى قاع البئر والمسح تحت الأرض.', 'Spline'),
('subj-sem3-2', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'مقدمة رسم بالحاسب', 'CAD-201', 'م. هاني بدير', 'التدريب على برنامج AutoCAD واستيراد وتصدير نقاط الرفع المساحي وإدارة الطبقات (Layers) وإخراج مخططات الكاد.', 'Laptop'),
('subj-sem3-3', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'مساحة تصويرية', 'SURV-202', 'د. شريف حامد', 'أسس التصوير الجوي الرأسي، حساب مقياس رسم الصور الجوية، التداخل الطولي والجانبي، وتحديد إزاحة التضاريس والارتفاعات.', 'Camera'),
('subj-sem3-4', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'تطبيقات مساحة تصويرية', 'SURV-203', 'م. ندى الجبالي', 'استخدام أجهزة الإبصار المجسم (Stereoscope) وتعيين الإحداثيات ثلاثية الأبعاد ونقاط التحكم الأرضي (GCPs).', 'Glasses'),
('subj-sem3-5', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'اسقاط خرائط', 'SURV-204', 'د. علاء المنشاوي', 'نظرية تحويل سطح الأرض المنحني إلى خريطة مسطحة، نظام الإسقاط المصري ETM، النظام العالمي UTM، وحساب معاملات التشوه.', 'Grid'),
('subj-sem3-6', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'مساحة طبوغرافية', 'SURV-205', 'د. إبراهيم عبد العزيز', 'خطوط الكنتور وخواصها، تعيين الفترات الكنتورية، رسم القطاعات الطولية والعرضية، وتحديد مجاري السيول وخطوط تقسيم المياه.', 'Mountain'),
('subj-sem3-7', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'تطبيقات مساحة طبوغرافية', 'SURV-206', 'م. حسام الدين توفيق', 'تنفيذ ميزانية شبكية بميزان القامة والتوتال ستيشن ورسم اللوحة الكنتورية الميدانية بمقياس رسم تفصيلي.', 'Compass'),
('subj-sem3-8', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الثالث', 3, 'خرائط جيوليجية', 'GEOL-201', 'د. ماهر قنديل', 'قراءة الخرائط الجيولوجية، تراكيب الطبقات الصخرية، الفوالق والطيات وتأثير التراكيب الجيولوجية على التخطيط المساحي.', 'Boxes'),
('subj-sem4-1', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'نظم معلومات', 'GIS-201', 'د. رامي عزب', 'نظم المعلومات الجغرافية GIS، برنامج ArcGIS Pro، إنشاء الطبقات وتعيين المراجع الجغرافية والتحليلات المكانية المتقدمة.', 'Map'),
('subj-sem4-2', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'المساحة التصويرية الرقمية', 'SURV-207', 'د. شريف حامد', 'معالجة صور طائرات الدرون (Drones / UAVs)، برامج Agisoft Metashape، توليد سحب النقاط ثلاثية الأبعاد ونماذج الارتفاع الرقمية DEM.', 'Scan'),
('subj-sem4-3', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'تطبيقات الرسم المساحى بالحاسب الالى', 'CAD-202', 'م. هاني بدير', 'تطبيقات متقدمة ببرنامج Autodesk Civil 3D لتصميم مسارات الطرق، القطاعات العرضية وحساب كميات الحفر والردم تلقائياً.', 'LayoutTemplate'),
('subj-sem4-4', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'حساب مساحى', 'SURV-208', 'د. طارق السعيد', 'حساب إحداثيات مضلعات الترافرس المغلقة والموصلة، تصحيح الأرصاد الزاوية والخطية، والتقاطع الأمامي والخلفي (Resection).', 'Sigma'),
('subj-sem4-5', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'كتابة التقارير الفنية', 'COMM-201', 'د. ريهام عبد الحميد', 'أصول كتابة التقارير المساحية الميدانية، محاضر استلام وتسليم النقاط المساحية، وصياغة المذكرات الفنية للاستشاري والمقاول.', 'FileCheck2'),
('subj-sem4-6', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'كارتوجرافى', 'SURV-209', 'د. علاء المنشاوي', 'علم وتصميم الخرائط الكارتوجرافية، إخراج اللوحات بمقاييس قياسية، وتصميم الرموز، العناوين، هوامش الخرائط ومفتاح الرسم.', 'Palette'),
('subj-sem4-7', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'لغة انجليزية تخصصية', 'ENG-201', 'د. مروة الشاذلي', 'الترجمة المتخصصة لمصطلحات الأجهزة الرقمية الحديثة، برمجيات المساحة، وكتابة المراسلات الرسمية باللغة الإنجليزية.', 'BookOpen'),
('subj-sem4-8', 'dept-surveying', 'الفرقة الثانية', 'الفصل الدراسي الرابع', 4, 'مشروع وثقافة العمل الحر', 'PROJ-201', 'لجنة مشاريع التخرج', 'مشروع التخرج العملي المتكامل لمسح منطقة حقيقية بالإسكندرية، مع مهارات تأسيس مكتب مساحي خاص والتسويق للأعمال المساحية.', 'Trophy')
ON CONFLICT (id) DO UPDATE SET name_ar = EXCLUDED.name_ar, instructor_name = EXCLUDED.instructor_name, description = EXCLUDED.description;

-- Resources (Curated PDF sheets & lectures)
INSERT INTO public.resources (id, department_id, subject_id, academic_year, semester_number, type, title, summary, content_markdown, file_url, due_date, week_number, author_name, is_pinned, views_count, review_status, reviewer_name, reviewed_at)
VALUES
('res-surv-101-1', 'dept-surveying', 'subj-sem1-1', 'الفرقة الأولى', 1, 'تلخيص محاضرة', 'شرح أخطاء جهاز الميزان (Level) واختبار الوتدين Two-Peg Test وضبط خط التسديد', 'ملخص شامل لضبط الفقاعة الدائرية والأنبوبية، وخطوات اختبار الوتدين الميداني بالمسائل والقوانين.', '### أخطاء جهاز الميزان وكيفية تلافيها:

1. **الخطأ الآلي (Instrumental Error):**
   - عدم توازي خط النظر (Line of Collimation) مع المحور البصري لفقاعة التسوية.
   - تآكل كعب القامة المعدني أو عدم رأسية القامة أثناء الرصد.

2. **خطوات اختبار الوتدين (Two-Peg Test):**
   - تثبيت وتدين $A$ و $B$ على مسافة $50$ إلى $60$ متراً.
   - **الخطوة الأولى:** تنصيب الميزان في المنتصف تماماً بين $A$ و $B$.
     - قراءة القامة عند $A$ هي $a_1$ وعند $B$ هي $b_1$.
     - فرق المنسوب الحقيقي:
       $$\Delta h = a_1 - b_1$$
   - **الخطوة الثانية:** نقل الجهاز بالقرب من الوتد $A$ على بُعد مترين.
     - نقرأ عند $A$ لتكون $a_2$.
     - القراءة الصحيحة المفترضة عند $B$:
       $$b_{2\text{ (صحيحة)}} = a_2 - \Delta h$$
     - إذا كانت القراءة الفعلية تختلف، يتم تحريك مسمار حامل الشعرات لتصحيح الشعرة الوسطى.

3. **قانون تصحيح التحديب والانكسار معاً:**
   $$C_{cr} = 0.0675 \times D^2$$
   *(حيث $D$ بالكيلومتر و $C_{cr}$ بالمتر يُطرح دائماً من قراءة القامة).*', 'https://example.com/iti-notes/surveying-level-test.pdf', NULL, 3, 'م. حسام الدين (مندوب مساحة)', TRUE, 520, 'approved', NULL, NULL),
('res-surv-101-2', 'dept-surveying', 'subj-sem1-1', 'الفرقة الأولى', 1, 'شيت وتكليف', 'شيت (1) تفريغ جدول ميزانية وحساب المناسيب بطريقة ارتفاع الجهاز وطريقة الارتفاع والانخفاض', 'مطلوب تفريغ 14 قراءة قامة وإجراء التحقيق الحسابي الثلاثي ورسم القطاع الطولي لمسار خط مياه.', '### بيانات شيت (1) لمادة أجهزة مساحية ومساحة مستوية:

- **القراءات الحقلية المعطاة:**
  - النقطة 1 (روبير منسوبه 12.450 م): مؤخرة 1.820 م.
  - متوسطات: 2.150 ، 1.940 ، 2.680 ، 1.450 م.
  - نقطة دوران: مقدمة 0.850 م ، ومؤخرة 2.300 م.
  - مقدمة ختامية: 1.120 م.

#### المطلوب تنفيذه:
1. تفريغ القراءات بجدول **ارتفاع الجهاز (HI Method)**.
2. تفريغ نفس القراءات بجدول **الارتفاع والانخفاض (Rise & Fall Method)**.
3. كتابة معادلة التحقيق الحسابي والتأكد من صحتها:
   $$\sum \text{Backsight} - \sum \text{Foresight} = \text{Last RL} - \text{First RL}$$
4. تسليم الكراسة باليد في معمل المساحة.', 'https://example.com/iti-notes/sheet1-leveling.pdf', '2026-11-18T20:13:34.075Z', 4, 'مكتب تدريب المساحة', TRUE, 730, 'approved', NULL, NULL),
('res-surv-103-1', 'dept-surveying', 'subj-sem1-4', 'الفرقة الأولى', 1, 'تلخيص محاضرة', 'قوانين تصحيحات قياس الأطوال بالشريط الصلب (الحرارة، الشد، الترهيم، والانحدار)', 'جميع القوانين الرياضية مع أمثلة محلولة لتصحيح الأطوال المقاسة بالشريط الصلب في الموقع.', '### قوانين تصحيح الأطوال بالشريط:

1. **تصحيح درجة الحرارة (Temperature Correction):**
   $$C_t = L \times \alpha \times (T_m - T_0)$$
   - حيث $\alpha = 0.0000115 / ^\circ\text{C}$ معامل التمدد الحراري للصلب.
2. **تصحيح قوة الشد (Pull Correction):**
   $$C_p = \frac{(P_m - P_0) \times L}{A \times E}$$
3. **تصحيح الترهيم (Sag Correction):**
   $$C_s = \frac{W^2 \times L}{24 \times P_m^2}$$
   *(دائماً بالسالب لأن الشريط يتدلى لأسفل).*
4. **تصحيح ميل الأرض (Slope Correction):**
   $$C_g = \frac{h^2}{2L}$$', NULL, NULL, 5, 'د. محمد أبو العز', FALSE, 410, 'approved', NULL, NULL),
('res-surv-101-3', 'dept-surveying', 'subj-sem1-3', 'الفرقة الأولى', 1, 'مذكرة سكشن عملي', 'لوحة العمليات الهندسية ورسم المساقط الثلاثة والقطاعات - مادة رسم فني', 'شرح طريقة تنصيف الزوايا والخطوط، رسم الأشكال السداسية والبيضوية، واستنتاج المسقط الثالث.', '### خطوات رسم لوحة العمليات الهندسية:
1. تجهيز لوحة الرسم الورقية وتثبيتها بالمسطرة T ومثلث 30/60 ومثلث 45.
2. رسم الإطار وجدول البيانات (Title Block) وفق المواصفات القياسية.
3. تنصيف خط مستقيم ورسم المماس للدوائر.
4. استنتاج المسقط الجانبي بمعلومية المسقط الرأسي والأفقي.', 'https://example.com/iti-notes/technical-drawing-guide.pdf', NULL, 2, 'م. سارة محمود', FALSE, 380, 'approved', NULL, NULL),
('res-surv-201-1', 'dept-surveying', 'subj-sem2-1', 'الفرقة الأولى', 2, 'تلخيص محاضرة', 'السطوح المرجعية للأرض (الجيود، الإلبسويد، والتوبوجرافي) في المساحة الجيوديسية', 'مفاهيم المساحة الجيوديسية والمراجع العالمية WGS84 والمرجع المصري القديم هلمرت 1906.', '### مقارنة السطوح المرجعية للأرض:
- **سطح الأرض الطبيعي (Topographic Surface):** سطح حقيقي شديد التعرج لا يصلح للحسابات الرياضية.
- **سطح الجيود (Geoid):** سطح متساوي الجهد التثاقلي يتطابق مع متوسط منسوب سطح البحر (MSL) وتكون خطوط التثاقل عمودية عليه.
- **سطح الإلبسويد (Ellipsoid):** شكل هندسي رياضي ناتج عن دوران قطع ناقص حول محوره الأصغر يُستخدم كمرجع للإحداثيات $(X, Y, Z)$ وخطوط الطول ودوائر العرض.', NULL, NULL, 2, 'د. مدحت الشناوي', TRUE, 490, 'approved', NULL, NULL),
('res-surv-204-1', 'dept-surveying', 'subj-sem2-4', 'الفرقة الأولى', 2, 'شيت وتكليف', 'شيت حصر كميات الحفر والردم لمشروع طريق بطريقة متوسط المساحات وقاعدة سمبسون', 'مسائل حصر مكعبات التربة للطرق والقطاعات العرضية المختلطة وجداول المستخلصات.', '### مطلوب تسليم شيت كميات ومواصفات:
حساب مكعبات الحفر والردم لطريق بطول 240 متراً مقسم لمحطات كل 40 متراً:
$$V = \frac{L}{2} \times (A_1 + 2A_2 + \dots + A_n)$$
تسليم الحسابات في جدول حصر رسمي مختوم.', 'https://example.com/iti-notes/earthwork-sheet.pdf', '2026-11-20T20:13:34.075Z', 6, 'م. أحمد الشريف', FALSE, 510, 'approved', NULL, NULL),
('res-surv-301-1', 'dept-surveying', 'subj-sem3-1', 'الفرقة الثانية', 3, 'مذكرة سكشن عملي', 'طرق التوجيه المساحي ونقل الإحداثيات في مساحة الأنفاق تحت الأرض', 'شرح نقل اتجاه الشمال المغناطيسي ونقاط التحكم من السطح إلى قاع بئر الحفر باستخدام الوايرات الثقيلة وأجهزة الجيروسكوب.', '### مراحل المسح في الأنفاق:
1. شبكة التحكم السطحية الخارجية ورصد محطات الدخول والخروج.
2. نقل الإحداثيات للعمق الرأسي (Plumbing Method) باستخدام أسلاك البيانو مع ثقالات مغمورة في الزيت لتخميد الحركة.
3. التوجيه بالليزر الموجه (Laser Alignment) لتوجيه ماكينة حفر الأنفاق TBM.', 'https://example.com/iti-notes/tunnel-surveying.pdf', NULL, 3, 'د. خالد عبد السميع', TRUE, 630, 'approved', NULL, NULL),
('res-surv-401-1', 'dept-surveying', 'subj-sem4-1', 'الفرقة الثانية', 4, 'بنك أسئلة وامتحانات', 'بنك أسئلة ونماذج امتحانات نظم المعلومات الجغرافية GIS و ArcGIS Pro', 'نماذج أسئلة المقارنة بين البيانات الاتجاهية Vector والشبكية Raster، الإرجاع الجغرافي Georeferencing، والتحليلات المكانية.', '### أهم أسئلة امتحانات نظم معلومات جغرافية:
1. قارن بين بنية البيانات Vector وبنية Raster مع ذكر مزايا وعيوب كل نوع.
2. اشرح خطوات الإرجاع الجغرافي لخريطة ورقية مسحوبة بواسطة الإسكانر.
3. ما هي استعلامات Spatial Queries والتقاطعات المكانية (Buffer, Clip, Intersect)؟', 'https://example.com/iti-notes/gis-exams-bank.pdf', NULL, 5, 'لجنة المراجعة الطلابية', TRUE, 890, 'approved', NULL, NULL),
('res-surv-404-1', 'dept-surveying', 'subj-sem4-4', 'الفرقة الثانية', 4, 'تلخيص محاضرة', 'حساب مضلعات الترافرس المغلق (Closed Traverse) والتحقيق الزاوي والخطوط الكروكية', 'خطوات حساب الانحرافات الأفقية والتحقيق الزاوي وتوزيع خطأ القفل على الإحداثيات الشرقية والشمالية.', '### خطوات حل الترافرس المغلق:
1. التحقيق الزاوي لمجموع الزوايا الداخلية:
   $$\sum \theta = (n - 2) \times 180^\circ$$
2. حساب خطأ القفل الزاوي وتوزيعه بالتساوي على الزوايا.
3. حساب الانحراف الدائري لكل ضلع:
   $$\alpha_{AB} = \alpha_{previous} \pm 180^\circ + \theta$$
4. حساب مركبات الأضلاع:
   $$\Delta X = L \times \sin(\alpha), \quad \Delta Y = L \times \cos(\alpha)$$
5. تصحيح المركبات بطريقة Bowditch وحساب إحداثيات النقاط النهائية.', 'https://example.com/iti-notes/traverse-calculations.pdf', NULL, 4, 'د. طارق السعيد', FALSE, 570, 'approved', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, review_status = EXCLUDED.review_status;

-- Schedules
INSERT INTO public.schedules (id, department_id, subject_id, academic_year, semester_number, day_of_week, start_time, end_time, session_type, section_number, location_room, instructor_name)
VALUES
('sch-s1-1', 'dept-surveying', 'subj-sem1-1', 'الفرقة الأولى', 1, 'السبت', '08:30', '10:30', 'محاضرة نظري', 'عام', 'مدرج 2 - المبنى الهندسي', 'د. إبراهيم عبد العزيز'),
('sch-s1-2', 'dept-surveying', 'subj-sem1-2', 'الفرقة الأولى', 1, 'السبت', '10:45', '13:00', 'سكشن عملي', 'سكشن 1', 'أرض الرفع المساحي الميداني', 'م. حسام الدين توفيق'),
('sch-s1-3', 'dept-surveying', 'subj-sem1-3', 'الفرقة الأولى', 1, 'الأحد', '09:00', '11:30', 'ورشة', 'عام', 'صالة الرسم الهندسي 3', 'م. سارة محمود'),
('sch-s1-4', 'dept-surveying', 'subj-sem1-4', 'الفرقة الأولى', 1, 'الاثنين', '09:00', '11:00', 'محاضرة نظري', 'عام', 'مدرج 1', 'د. محمد أبو العز'),
('sch-s1-5', 'dept-surveying', 'subj-sem1-6', 'الفرقة الأولى', 1, 'الثلاثاء', '10:00', '12:00', 'معمل', 'سكشن 2', 'معمل الحاسب الآلي 2', 'م. أحمد شكري'),
('sch-s3-1', 'dept-surveying', 'subj-sem3-1', 'الفرقة الثانية', 3, 'السبت', '08:30', '10:30', 'محاضرة نظري', 'عام', 'مدرج 3 - قاعة المؤتمرات', 'د. خالد عبد السميع'),
('sch-s3-2', 'dept-surveying', 'subj-sem3-2', 'الفرقة الثانية', 3, 'الأحد', '10:00', '12:30', 'معمل', 'سكشن 1', 'معمل الأوتوكاد ونظم المعلومات', 'م. هاني بدير')
ON CONFLICT (id) DO UPDATE SET location_room = EXCLUDED.location_room, instructor_name = EXCLUDED.instructor_name;

-- Announcements
INSERT INTO public.announcements (id, department_id, title, details, category, urgency, event_date, is_active)
VALUES
('ann-1', 'dept-surveying', 'تنبيه عاجل: تسليم شيت 1 أجهزة مساحية وتوقيع دفاتر الحقل العملي', 'لطلاب الفرقة الأولى: آخر موعد لتسليم شيت (1) ميزانيات معملية وتوقيع دفاتر الحقل العملي يوم الأحد القادم بمكتب د. إبراهيم. لن يتم قبول شيتات بعد هذا الموعد.', 'تسليم شيت', 'عاجل جداً', '2026-11-18T20:13:34.075Z', TRUE),
('ann-2', 'dept-surveying', 'موعد الامتحان العملي الميداني لأجهزة الميزان والثيودوليت', 'يبدأ الاختبار الميداني الشفوي والعملي لقياس السرعة والدقة في ضبط أفقية الأجهزة وقراءة القامة ابتداءً من السبت القادم بأرض الرفع المساحي.', 'امتحان عملي', 'هام', '2026-11-22T20:13:34.075Z', TRUE),
('ann-3', NULL, 'تنبيه شئون الطلاب: استلام كارنيهات المعهد وإيصالات الكتب الدراسية', 'تهيب إدارة المعهد الفني الصناعي بالإسكندرية بجميع طلاب الفرق الأولى والثانية سرعة استلام الكارنيهات من صالة الشئون ومراجعة أرقام الجلوس.', 'تنبيه إداري', 'عادي', '2026-11-26T20:13:34.075Z', TRUE)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, details = EXCLUDED.details;
