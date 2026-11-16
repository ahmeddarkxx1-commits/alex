import { Department, Subject, Resource, Schedule, Announcement, AdminUser } from '@/types/database';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-surveying',
    slug: 'surveying',
    name_ar: 'شعبة المساحة العامة',
    short_name: 'المساحة العامة',
    description: 'أعمال الرفع المساحي الميداني، أجهزة الميزان والتوتال ستيشن، نظم المعلومات الجغرافية، والمساحة التصويرية والرقمية وحساب الكميات.',
    icon_name: 'Compass',
  },
  {
    id: 'dept-arch-civil',
    slug: 'architecture-civil',
    name_ar: 'شعبة العمارة والإنشاءات المدنية',
    short_name: 'عمارة ومدني',
    description: 'الرسم المعماري، تكنولوجيا الخرسانة، ميكانيكا التربة، وحصر الكميات الإنشائية.',
    icon_name: 'Building2',
  },
  {
    id: 'dept-electrical',
    slug: 'electrical-networks',
    name_ar: 'شعبة الشبكات والآلات الكهربية',
    short_name: 'كهرباء وقوى',
    description: 'شبكات التوزيع ومحطات المحولات، الآلات الكهربية، ولوحات التحكم والتوزيع الصناعية.',
    icon_name: 'Zap',
  },
  {
    id: 'dept-electronics',
    slug: 'electronics-computers',
    name_ar: 'شعبة الأجهزة الإلكترونية والحاسبات',
    short_name: 'إلكترونيات وحاسبات',
    description: 'الدوائر الإلكترونية، المتحكمات الدقيقة، شبكات الاتصالات، وصيانة الحاسب الآلي.',
    icon_name: 'Cpu',
  },
  {
    id: 'dept-refrigeration',
    slug: 'refrigeration-ac',
    name_ar: 'شعبة التبريد وتكييف الهواء',
    short_name: 'تبريد وتكييف',
    description: 'دورات التبريد، حساب الأحمال الحرارية، ونظم التكييف المركزي والمستودعات المبردة.',
    icon_name: 'Snowflake',
  },
  {
    id: 'dept-mechanics',
    slug: 'mechanical-production',
    name_ar: 'شعبة التشغيل والتشكيل وتكنولوجيا الإنتاج',
    short_name: 'تشغيل وميكانيكا',
    description: 'ماكينات الخراطة والتفريز، تشكيل المعادن، تكنولوجيا القياسات، وأساسيات التحكم CNC.',
    icon_name: 'Wrench',
  },
  {
    id: 'dept-automotive',
    slug: 'automotive',
    name_ar: 'شعبة ميكانيكا وكهرباء السيارات',
    short_name: 'سيارات ومحركات',
    description: 'محركات الاحتراق الداخلي بنزين وديزل، نظم الحقن الإلكتروني، وأجهزة الفحص OBD.',
    icon_name: 'Car',
  },
];

// ====================================================================
// المقررات الدراسية الرسمية لشعبة المساحة العامة (32 مادة عبر 4 فصول دراسية)
// ====================================================================
export const INITIAL_SUBJECTS: Subject[] = [
  // ------------------------------------------------------------------
  // الفصل الدراسي الأول (الفرقة الأولى) - 8 مواد
  // ------------------------------------------------------------------
  {
    id: 'subj-sem1-1',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'أجهزة مساحية',
    code: 'SURV-101',
    instructor_name: 'د. إبراهيم عبد العزيز',
    description: 'أجهزة الميزان بأنواعه، الثيودوليت، البوصلة المساحية، أشرطة القياس، واختبارات وضبط خط التسديد.',
    icon_name: 'Crosshair',
  },
  {
    id: 'subj-sem1-2',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'تطبيقات مساحه مستويه',
    code: 'SURV-102',
    instructor_name: 'م. حسام الدين توفيق',
    description: 'التمارين الحقلية العملية على الرفع بالشريط وإقامة وإسقاط الأعمدة والميزانيات الطولية والشبكية في أرض المعهد.',
    icon_name: 'MapPin',
  },
  {
    id: 'subj-sem1-3',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'رسم فني',
    code: 'ENG-101',
    instructor_name: 'م. سارة محمود',
    description: 'أدوات الرسم الهندسي، العمليات الهندسية، الإسقاط العمودي، رسم المساقط الثلاثة والقطاعات الهندسية.',
    icon_name: 'PenTool',
  },
  {
    id: 'subj-sem1-4',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'مساحه مستويه',
    code: 'SURV-103',
    instructor_name: 'د. محمد أبو العز',
    description: 'النظريات والقوانين الرياضية للمساحة المستوية، تصحيحات قياس الأطوال (الحرارة، الشد، الترهيم)، ومبادئ الميزانية.',
    icon_name: 'Ruler',
  },
  {
    id: 'subj-sem1-5',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'رياضيات',
    code: 'MATH-101',
    instructor_name: 'د. عادل القاضي',
    description: 'حساب المثلثات المستوية والكروية، المتجهات، الدوال والتفاضل والتكامل وتطبيقاتها في حساب المسافات والمساحات.',
    icon_name: 'Binary',
  },
  {
    id: 'subj-sem1-6',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'تكنولوجيا المعلومات',
    code: 'IT-101',
    instructor_name: 'م. أحمد شكري',
    description: 'أساسيات الحاسب الآلي ونظم التشغيل، معالجة الجداول الحسابية Excel لمعادلات المساحة، وحفظ وتنسيق البيانات.',
    icon_name: 'Monitor',
  },
  {
    id: 'subj-sem1-7',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'لغة انجليزية',
    code: 'ENG-102',
    instructor_name: 'د. ريهام عبد الحميد',
    description: 'المصطلحات الهندسية والمساحية الأساسية وقواعد اللغة الإنجليزية للتعامل مع كتالوجات الأجهزة ومواصفات المشاريع.',
    icon_name: 'Languages',
  },
  {
    id: 'subj-sem1-8',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الأول',
    semester_number: 1,
    name_ar: 'السلامة المهنية',
    code: 'SAFE-101',
    instructor_name: 'م. أيمن الغرباوي',
    description: 'إجراءات الصحة والسلامة المهنية في المواقع الإنشائية وأثناء أعمال الرصد الميداني في الطرق ومواقع العمل.',
    icon_name: 'ShieldAlert',
  },

  // ------------------------------------------------------------------
  // الفصل الدراسي الثاني (الفرقة الأولى) - 8 مواد
  // ------------------------------------------------------------------
  {
    id: 'subj-sem2-1',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'مساحة جيوديسية',
    code: 'SURV-104',
    instructor_name: 'د. مدحت الشناوي',
    description: 'شكل الأرض والمراجع الجيوديسية (Ellipsoid & Geoid)، انحناء الأرض وتأثيره، وشبكات المثلثات ورصد الأقمار الصناعية GPS.',
    icon_name: 'Globe2',
  },
  {
    id: 'subj-sem2-2',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'تطبيقات مساحة جيوديسية',
    code: 'SURV-105',
    instructor_name: 'م. عمر سامي',
    description: 'تطبيقات حقلية باستخدام مستقبلات GPS / GNSS الثابتة والمتحركة (RTK) وربط المحطات بالشبكة الوطنية.',
    icon_name: 'Navigation',
  },
  {
    id: 'subj-sem2-3',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'تك معلومات متقدمة',
    code: 'IT-102',
    instructor_name: 'م. يوسف النجار',
    description: 'إدارة قواعد البيانات المكانية وتطوير شيتات حسابية برمجية لأتمتة تفريغ القياسات الميدانية وحساب المناسيب.',
    icon_name: 'Database',
  },
  {
    id: 'subj-sem2-4',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'كميات ومواصفات',
    code: 'CIV-101',
    instructor_name: 'م. أحمد الشريف',
    description: 'حصر كميات الحفر والردم لمشاريع الطرق وقنوات الري، إعداد جداول الحصر والمستخلصات الشهرية لمقاولي التنفيذ.',
    icon_name: 'Calculator',
  },
  {
    id: 'subj-sem2-5',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'قوانين وتشريعات تخصصية',
    code: 'LAW-101',
    instructor_name: 'د. مجدي كمال',
    description: 'قوانين نزع الملكية للمنفعة العامة، السجل العيني، لوائح نقابة التطبيقيين والمسؤولية القانونية للمساح المعتمد.',
    icon_name: 'Scale',
  },
  {
    id: 'subj-sem2-6',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'نظرية الأخطاء',
    code: 'SURV-106',
    instructor_name: 'د. طارق السعيد',
    description: 'أنواع الأخطاء (نظامية، عفوية، جسيمة)، الانحراف المعياري، حساب خطأ القفل الزاوي وتوزيع الأخطاء بطريقة المربعات الصغرى.',
    icon_name: 'Percent',
  },
  {
    id: 'subj-sem2-7',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'رسم تخصصي',
    code: 'ENG-103',
    instructor_name: 'م. سارة محمود',
    description: 'رسم اللوحات الطبوغرافية اليدوية وتوقيع مضلعات الترافرس ومقاييس الرسم المساحية واستخدام الرموز والاصطلاحات المعتمدة.',
    icon_name: 'Layers',
  },
  {
    id: 'subj-sem2-8',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الفصل الدراسي الثاني',
    semester_number: 2,
    name_ar: 'تصنيف تربة ومحاصيل',
    code: 'AGRI-101',
    instructor_name: 'د. مصطفى العوضي',
    description: 'دراسة أنواع التربة وتأثيرها على استقرار الأجهزة والمباني، وشبكات الري والصرف الزراعي وعلاقتها بالمشاريع المساحية.',
    icon_name: 'Wheat',
  },

  // ------------------------------------------------------------------
  // الفصل الدراسي الثالث (الفرقة الثانية) - 8 مواد
  // ------------------------------------------------------------------
  {
    id: 'subj-sem3-1',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'مساحة انفاق',
    code: 'SURV-201',
    instructor_name: 'د. خالد عبد السميع',
    description: 'أعمال التوجيه المساحي الدقيق للأنفاق ومترو الأنفاق، أجهزة الليزر، نقل الإحداثيات من السطح إلى قاع البئر والمسح تحت الأرض.',
    icon_name: 'Spline',
  },
  {
    id: 'subj-sem3-2',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'مقدمة رسم بالحاسب',
    code: 'CAD-201',
    instructor_name: 'م. هاني بدير',
    description: 'التدريب على برنامج AutoCAD واستيراد وتصدير نقاط الرفع المساحي وإدارة الطبقات (Layers) وإخراج مخططات الكاد.',
    icon_name: 'Laptop',
  },
  {
    id: 'subj-sem3-3',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'مساحة تصويرية',
    code: 'SURV-202',
    instructor_name: 'د. شريف حامد',
    description: 'أسس التصوير الجوي الرأسي، حساب مقياس رسم الصور الجوية، التداخل الطولي والجانبي، وتحديد إزاحة التضاريس والارتفاعات.',
    icon_name: 'Camera',
  },
  {
    id: 'subj-sem3-4',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'تطبيقات مساحة تصويرية',
    code: 'SURV-203',
    instructor_name: 'م. ندى الجبالي',
    description: 'استخدام أجهزة الإبصار المجسم (Stereoscope) وتعيين الإحداثيات ثلاثية الأبعاد ونقاط التحكم الأرضي (GCPs).',
    icon_name: 'Glasses',
  },
  {
    id: 'subj-sem3-5',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'اسقاط خرائط',
    code: 'SURV-204',
    instructor_name: 'د. علاء المنشاوي',
    description: 'نظرية تحويل سطح الأرض المنحني إلى خريطة مسطحة، نظام الإسقاط المصري ETM، النظام العالمي UTM، وحساب معاملات التشوه.',
    icon_name: 'Grid',
  },
  {
    id: 'subj-sem3-6',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'مساحة طبوغرافية',
    code: 'SURV-205',
    instructor_name: 'د. إبراهيم عبد العزيز',
    description: 'خطوط الكنتور وخواصها، تعيين الفترات الكنتورية، رسم القطاعات الطولية والعرضية، وتحديد مجاري السيول وخطوط تقسيم المياه.',
    icon_name: 'Mountain',
  },
  {
    id: 'subj-sem3-7',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'تطبيقات مساحة طبوغرافية',
    code: 'SURV-206',
    instructor_name: 'م. حسام الدين توفيق',
    description: 'تنفيذ ميزانية شبكية بميزان القامة والتوتال ستيشن ورسم اللوحة الكنتورية الميدانية بمقياس رسم تفصيلي.',
    icon_name: 'Compass',
  },
  {
    id: 'subj-sem3-8',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الثالث',
    semester_number: 3,
    name_ar: 'خرائط جيوليجية',
    code: 'GEOL-201',
    instructor_name: 'د. ماهر قنديل',
    description: 'قراءة الخرائط الجيولوجية، تراكيب الطبقات الصخرية، الفوالق والطيات وتأثير التراكيب الجيولوجية على التخطيط المساحي.',
    icon_name: 'Boxes',
  },

  // ------------------------------------------------------------------
  // الفصل الدراسي الرابع (الفرقة الثانية) - 8 مواد
  // ------------------------------------------------------------------
  {
    id: 'subj-sem4-1',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'نظم معلومات',
    code: 'GIS-201',
    instructor_name: 'د. رامي عزب',
    description: 'نظم المعلومات الجغرافية GIS، برنامج ArcGIS Pro، إنشاء الطبقات وتعيين المراجع الجغرافية والتحليلات المكانية المتقدمة.',
    icon_name: 'Map',
  },
  {
    id: 'subj-sem4-2',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'المساحة التصويرية الرقمية',
    code: 'SURV-207',
    instructor_name: 'د. شريف حامد',
    description: 'معالجة صور طائرات الدرون (Drones / UAVs)، برامج Agisoft Metashape، توليد سحب النقاط ثلاثية الأبعاد ونماذج الارتفاع الرقمية DEM.',
    icon_name: 'Scan',
  },
  {
    id: 'subj-sem4-3',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'تطبيقات الرسم المساحى بالحاسب الالى',
    code: 'CAD-202',
    instructor_name: 'م. هاني بدير',
    description: 'تطبيقات متقدمة ببرنامج Autodesk Civil 3D لتصميم مسارات الطرق، القطاعات العرضية وحساب كميات الحفر والردم تلقائياً.',
    icon_name: 'LayoutTemplate',
  },
  {
    id: 'subj-sem4-4',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'حساب مساحى',
    code: 'SURV-208',
    instructor_name: 'د. طارق السعيد',
    description: 'حساب إحداثيات مضلعات الترافرس المغلقة والموصلة، تصحيح الأرصاد الزاوية والخطية، والتقاطع الأمامي والخلفي (Resection).',
    icon_name: 'Sigma',
  },
  {
    id: 'subj-sem4-5',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'كتابة التقارير الفنية',
    code: 'COMM-201',
    instructor_name: 'د. ريهام عبد الحميد',
    description: 'أصول كتابة التقارير المساحية الميدانية، محاضر استلام وتسليم النقاط المساحية، وصياغة المذكرات الفنية للاستشاري والمقاول.',
    icon_name: 'FileCheck2',
  },
  {
    id: 'subj-sem4-6',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'كارتوجرافى',
    code: 'SURV-209',
    instructor_name: 'د. علاء المنشاوي',
    description: 'علم وتصميم الخرائط الكارتوجرافية، إخراج اللوحات بمقاييس قياسية، وتصميم الرموز، العناوين، هوامش الخرائط ومفتاح الرسم.',
    icon_name: 'Palette',
  },
  {
    id: 'subj-sem4-7',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'لغة انجليزية تخصصية',
    code: 'ENG-201',
    instructor_name: 'د. مروة الشاذلي',
    description: 'الترجمة المتخصصة لمصطلحات الأجهزة الرقمية الحديثة، برمجيات المساحة، وكتابة المراسلات الرسمية باللغة الإنجليزية.',
    icon_name: 'BookOpen',
  },
  {
    id: 'subj-sem4-8',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الفصل الدراسي الرابع',
    semester_number: 4,
    name_ar: 'مشروع وثقافة العمل الحر',
    code: 'PROJ-201',
    instructor_name: 'لجنة مشاريع التخرج',
    description: 'مشروع التخرج العملي المتكامل لمسح منطقة حقيقية بالإسكندرية، مع مهارات تأسيس مكتب مساحي خاص والتسويق للأعمال المساحية.',
    icon_name: 'Trophy',
  },
];

// ====================================================================
// المذكرات والشيتات ونماذج الامتحانات لشعبة المساحة العامة
// ====================================================================
export const INITIAL_RESOURCES: Resource[] = [
  // Semester 1
  {
    id: 'res-surv-101-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-1',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    type: 'تلخيص محاضرة',
    title: 'شرح أخطاء جهاز الميزان (Level) واختبار الوتدين Two-Peg Test وضبط خط التسديد',
    summary: 'ملخص شامل لضبط الفقاعة الدائرية والأنبوبية، وخطوات اختبار الوتدين الميداني بالمسائل والقوانين.',
    content_markdown: `### أخطاء جهاز الميزان وكيفية تلافيها:

1. **الخطأ الآلي (Instrumental Error):**
   - عدم توازي خط النظر (Line of Collimation) مع المحور البصري لفقاعة التسوية.
   - تآكل كعب القامة المعدني أو عدم رأسية القامة أثناء الرصد.

2. **خطوات اختبار الوتدين (Two-Peg Test):**
   - تثبيت وتدين $A$ و $B$ على مسافة $50$ إلى $60$ متراً.
   - **الخطوة الأولى:** تنصيب الميزان في المنتصف تماماً بين $A$ و $B$.
     - قراءة القامة عند $A$ هي $a_1$ وعند $B$ هي $b_1$.
     - فرق المنسوب الحقيقي:
       $$\\Delta h = a_1 - b_1$$
   - **الخطوة الثانية:** نقل الجهاز بالقرب من الوتد $A$ على بُعد مترين.
     - نقرأ عند $A$ لتكون $a_2$.
     - القراءة الصحيحة المفترضة عند $B$:
       $$b_{2\\text{ (صحيحة)}} = a_2 - \\Delta h$$
     - إذا كانت القراءة الفعلية تختلف، يتم تحريك مسمار حامل الشعرات لتصحيح الشعرة الوسطى.

3. **قانون تصحيح التحديب والانكسار معاً:**
   $$C_{cr} = 0.0675 \\times D^2$$
   *(حيث $D$ بالكيلومتر و $C_{cr}$ بالمتر يُطرح دائماً من قراءة القامة).*`,
    file_url: 'https://example.com/iti-notes/surveying-level-test.pdf',
    due_date: null,
    week_number: 3,
    author_name: 'م. حسام الدين (مندوب مساحة)',
    is_pinned: true,
    views_count: 520,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-101-2',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-1',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    type: 'شيت وتكليف',
    title: 'شيت (1) تفريغ جدول ميزانية وحساب المناسيب بطريقة ارتفاع الجهاز وطريقة الارتفاع والانخفاض',
    summary: 'مطلوب تفريغ 14 قراءة قامة وإجراء التحقيق الحسابي الثلاثي ورسم القطاع الطولي لمسار خط مياه.',
    content_markdown: `### بيانات شيت (1) لمادة أجهزة مساحية ومساحة مستوية:

- **القراءات الحقلية المعطاة:**
  - النقطة 1 (روبير منسوبه 12.450 م): مؤخرة 1.820 م.
  - متوسطات: 2.150 ، 1.940 ، 2.680 ، 1.450 م.
  - نقطة دوران: مقدمة 0.850 م ، ومؤخرة 2.300 م.
  - مقدمة ختامية: 1.120 م.

#### المطلوب تنفيذه:
1. تفريغ القراءات بجدول **ارتفاع الجهاز (HI Method)**.
2. تفريغ نفس القراءات بجدول **الارتفاع والانخفاض (Rise & Fall Method)**.
3. كتابة معادلة التحقيق الحسابي والتأكد من صحتها:
   $$\\sum \\text{Backsight} - \\sum \\text{Foresight} = \\text{Last RL} - \\text{First RL}$$
4. تسليم الكراسة باليد في معمل المساحة.`,
    file_url: 'https://example.com/iti-notes/sheet1-leveling.pdf',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    week_number: 4,
    author_name: 'مكتب تدريب المساحة',
    is_pinned: true,
    views_count: 730,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-103-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-4',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    type: 'تلخيص محاضرة',
    title: 'قوانين تصحيحات قياس الأطوال بالشريط الصلب (الحرارة، الشد، الترهيم، والانحدار)',
    summary: 'جميع القوانين الرياضية مع أمثلة محلولة لتصحيح الأطوال المقاسة بالشريط الصلب في الموقع.',
    content_markdown: `### قوانين تصحيح الأطوال بالشريط:

1. **تصحيح درجة الحرارة (Temperature Correction):**
   $$C_t = L \\times \\alpha \\times (T_m - T_0)$$
   - حيث $\\alpha = 0.0000115 / ^\\circ\\text{C}$ معامل التمدد الحراري للصلب.
2. **تصحيح قوة الشد (Pull Correction):**
   $$C_p = \\frac{(P_m - P_0) \\times L}{A \\times E}$$
3. **تصحيح الترهيم (Sag Correction):**
   $$C_s = \\frac{W^2 \\times L}{24 \\times P_m^2}$$
   *(دائماً بالسالب لأن الشريط يتدلى لأسفل).*
4. **تصحيح ميل الأرض (Slope Correction):**
   $$C_g = \\frac{h^2}{2L}$$`,
    file_url: null,
    due_date: null,
    week_number: 5,
    author_name: 'د. محمد أبو العز',
    is_pinned: false,
    views_count: 410,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-101-3',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-3',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    type: 'مذكرة سكشن عملي',
    title: 'لوحة العمليات الهندسية ورسم المساقط الثلاثة والقطاعات - مادة رسم فني',
    summary: 'شرح طريقة تنصيف الزوايا والخطوط، رسم الأشكال السداسية والبيضوية، واستنتاج المسقط الثالث.',
    content_markdown: `### خطوات رسم لوحة العمليات الهندسية:
1. تجهيز لوحة الرسم الورقية وتثبيتها بالمسطرة T ومثلث 30/60 ومثلث 45.
2. رسم الإطار وجدول البيانات (Title Block) وفق المواصفات القياسية.
3. تنصيف خط مستقيم ورسم المماس للدوائر.
4. استنتاج المسقط الجانبي بمعلومية المسقط الرأسي والأفقي.`,
    file_url: 'https://example.com/iti-notes/technical-drawing-guide.pdf',
    due_date: null,
    week_number: 2,
    author_name: 'م. سارة محمود',
    is_pinned: false,
    views_count: 380,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },

  // Semester 2
  {
    id: 'res-surv-201-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem2-1',
    academic_year: 'الفرقة الأولى',
    semester_number: 2,
    type: 'تلخيص محاضرة',
    title: 'السطوح المرجعية للأرض (الجيود، الإلبسويد، والتوبوجرافي) في المساحة الجيوديسية',
    summary: 'مفاهيم المساحة الجيوديسية والمراجع العالمية WGS84 والمرجع المصري القديم هلمرت 1906.',
    content_markdown: `### مقارنة السطوح المرجعية للأرض:
- **سطح الأرض الطبيعي (Topographic Surface):** سطح حقيقي شديد التعرج لا يصلح للحسابات الرياضية.
- **سطح الجيود (Geoid):** سطح متساوي الجهد التثاقلي يتطابق مع متوسط منسوب سطح البحر (MSL) وتكون خطوط التثاقل عمودية عليه.
- **سطح الإلبسويد (Ellipsoid):** شكل هندسي رياضي ناتج عن دوران قطع ناقص حول محوره الأصغر يُستخدم كمرجع للإحداثيات $(X, Y, Z)$ وخطوط الطول ودوائر العرض.`,
    file_url: null,
    due_date: null,
    week_number: 2,
    author_name: 'د. مدحت الشناوي',
    is_pinned: true,
    views_count: 490,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-204-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem2-4',
    academic_year: 'الفرقة الأولى',
    semester_number: 2,
    type: 'شيت وتكليف',
    title: 'شيت حصر كميات الحفر والردم لمشروع طريق بطريقة متوسط المساحات وقاعدة سمبسون',
    summary: 'مسائل حصر مكعبات التربة للطرق والقطاعات العرضية المختلطة وجداول المستخلصات.',
    content_markdown: `### مطلوب تسليم شيت كميات ومواصفات:
حساب مكعبات الحفر والردم لطريق بطول 240 متراً مقسم لمحطات كل 40 متراً:
$$V = \\frac{L}{2} \\times (A_1 + 2A_2 + \\dots + A_n)$$
تسليم الحسابات في جدول حصر رسمي مختوم.`,
    file_url: 'https://example.com/iti-notes/earthwork-sheet.pdf',
    due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
    week_number: 6,
    author_name: 'م. أحمد الشريف',
    is_pinned: false,
    views_count: 510,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },

  // Semester 3
  {
    id: 'res-surv-301-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem3-1',
    academic_year: 'الفرقة الثانية',
    semester_number: 3,
    type: 'مذكرة سكشن عملي',
    title: 'طرق التوجيه المساحي ونقل الإحداثيات في مساحة الأنفاق تحت الأرض',
    summary: 'شرح نقل اتجاه الشمال المغناطيسي ونقاط التحكم من السطح إلى قاع بئر الحفر باستخدام الوايرات الثقيلة وأجهزة الجيروسكوب.',
    content_markdown: `### مراحل المسح في الأنفاق:
1. شبكة التحكم السطحية الخارجية ورصد محطات الدخول والخروج.
2. نقل الإحداثيات للعمق الرأسي (Plumbing Method) باستخدام أسلاك البيانو مع ثقالات مغمورة في الزيت لتخميد الحركة.
3. التوجيه بالليزر الموجه (Laser Alignment) لتوجيه ماكينة حفر الأنفاق TBM.`,
    file_url: 'https://example.com/iti-notes/tunnel-surveying.pdf',
    due_date: null,
    week_number: 3,
    author_name: 'د. خالد عبد السميع',
    is_pinned: true,
    views_count: 630,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },

  // Semester 4
  {
    id: 'res-surv-401-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem4-1',
    academic_year: 'الفرقة الثانية',
    semester_number: 4,
    type: 'بنك أسئلة وامتحانات',
    title: 'بنك أسئلة ونماذج امتحانات نظم المعلومات الجغرافية GIS و ArcGIS Pro',
    summary: 'نماذج أسئلة المقارنة بين البيانات الاتجاهية Vector والشبكية Raster، الإرجاع الجغرافي Georeferencing، والتحليلات المكانية.',
    content_markdown: `### أهم أسئلة امتحانات نظم معلومات جغرافية:
1. قارن بين بنية البيانات Vector وبنية Raster مع ذكر مزايا وعيوب كل نوع.
2. اشرح خطوات الإرجاع الجغرافي لخريطة ورقية مسحوبة بواسطة الإسكانر.
3. ما هي استعلامات Spatial Queries والتقاطعات المكانية (Buffer, Clip, Intersect)؟`,
    file_url: 'https://example.com/iti-notes/gis-exams-bank.pdf',
    due_date: null,
    week_number: 5,
    author_name: 'لجنة المراجعة الطلابية',
    is_pinned: true,
    views_count: 890,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-404-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem4-4',
    academic_year: 'الفرقة الثانية',
    semester_number: 4,
    type: 'تلخيص محاضرة',
    title: 'حساب مضلعات الترافرس المغلق (Closed Traverse) والتحقيق الزاوي والخطوط الكروكية',
    summary: 'خطوات حساب الانحرافات الأفقية والتحقيق الزاوي وتوزيع خطأ القفل على الإحداثيات الشرقية والشمالية.',
    content_markdown: `### خطوات حل الترافرس المغلق:
1. التحقيق الزاوي لمجموع الزوايا الداخلية:
   $$\\sum \\theta = (n - 2) \\times 180^\\circ$$
2. حساب خطأ القفل الزاوي وتوزيعه بالتساوي على الزوايا.
3. حساب الانحراف الدائري لكل ضلع:
   $$\\alpha_{AB} = \\alpha_{previous} \\pm 180^\\circ + \\theta$$
4. حساب مركبات الأضلاع:
   $$\\Delta X = L \\times \\sin(\\alpha), \\quad \\Delta Y = L \\times \\cos(\\alpha)$$
5. تصحيح المركبات بطريقة Bowditch وحساب إحداثيات النقاط النهائية.`,
    file_url: 'https://example.com/iti-notes/traverse-calculations.pdf',
    due_date: null,
    week_number: 4,
    author_name: 'د. طارق السعيد',
    is_pinned: false,
    views_count: 570,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

// ====================================================================
// جداول المحاضرات والسكاشن لشعبة المساحة العامة
// ====================================================================
export const INITIAL_SCHEDULES: Schedule[] = [
  // الفصل الدراسي الأول (سنة 1)
  {
    id: 'sch-s1-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-1',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    day_of_week: 'السبت',
    start_time: '08:30',
    end_time: '10:30',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 2 - المبنى الهندسي',
    instructor_name: 'د. إبراهيم عبد العزيز',
  },
  {
    id: 'sch-s1-2',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-2',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    day_of_week: 'السبت',
    start_time: '10:45',
    end_time: '13:00',
    session_type: 'سكشن عملي',
    section_number: 'سكشن 1',
    location_room: 'أرض الرفع المساحي الميداني',
    instructor_name: 'م. حسام الدين توفيق',
  },
  {
    id: 'sch-s1-3',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-3',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    day_of_week: 'الأحد',
    start_time: '09:00',
    end_time: '11:30',
    session_type: 'ورشة',
    section_number: 'عام',
    location_room: 'صالة الرسم الهندسي 3',
    instructor_name: 'م. سارة محمود',
  },
  {
    id: 'sch-s1-4',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-4',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    day_of_week: 'الاثنين',
    start_time: '09:00',
    end_time: '11:00',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 1',
    instructor_name: 'د. محمد أبو العز',
  },
  {
    id: 'sch-s1-5',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem1-6',
    academic_year: 'الفرقة الأولى',
    semester_number: 1,
    day_of_week: 'الثلاثاء',
    start_time: '10:00',
    end_time: '12:00',
    session_type: 'معمل',
    section_number: 'سكشن 2',
    location_room: 'معمل الحاسب الآلي 2',
    instructor_name: 'م. أحمد شكري',
  },

  // الفصل الدراسي الثالث (سنة 2)
  {
    id: 'sch-s3-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem3-1',
    academic_year: 'الفرقة الثانية',
    semester_number: 3,
    day_of_week: 'السبت',
    start_time: '08:30',
    end_time: '10:30',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 3 - قاعة المؤتمرات',
    instructor_name: 'د. خالد عبد السميع',
  },
  {
    id: 'sch-s3-2',
    department_id: 'dept-surveying',
    subject_id: 'subj-sem3-2',
    academic_year: 'الفرقة الثانية',
    semester_number: 3,
    day_of_week: 'الأحد',
    start_time: '10:00',
    end_time: '12:30',
    session_type: 'معمل',
    section_number: 'سكشن 1',
    location_room: 'معمل الأوتوكاد ونظم المعلومات',
    instructor_name: 'م. هاني بدير',
  },
];

// ====================================================================
// التنبيهات ومواعيد التسليم
// ====================================================================
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    department_id: 'dept-surveying',
    title: 'تنبيه عاجل: تسليم شيت 1 أجهزة مساحية وتوقيع دفاتر الحقل العملي',
    details: 'لطلاب الفرقة الأولى: آخر موعد لتسليم شيت (1) ميزانيات معملية وتوقيع دفاتر الحقل العملي يوم الأحد القادم بمكتب د. إبراهيم. لن يتم قبول شيتات بعد هذا الموعد.',
    category: 'تسليم شيت',
    urgency: 'عاجل جداً',
    event_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ann-2',
    department_id: 'dept-surveying',
    title: 'موعد الامتحان العملي الميداني لأجهزة الميزان والثيودوليت',
    details: 'يبدأ الاختبار الميداني الشفوي والعملي لقياس السرعة والدقة في ضبط أفقية الأجهزة وقراءة القامة ابتداءً من السبت القادم بأرض الرفع المساحي.',
    category: 'امتحان عملي',
    urgency: 'هام',
    event_date: new Date(Date.now() + 6 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'ann-3',
    department_id: null,
    title: 'تنبيه شئون الطلاب: استلام كارنيهات المعهد وإيصالات الكتب الدراسية',
    details: 'تهيب إدارة المعهد الفني الصناعي بالإسكندرية بجميع طلاب الفرق الأولى والثانية سرعة استلام الكارنيهات من صالة الشئون ومراجعة أرقام الجلوس.',
    category: 'تنبيه إداري',
    urgency: 'عادي',
    event_date: new Date(Date.now() + 10 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export const MOCK_ADMIN_USER: AdminUser = {
  id: 'admin-super-iti',
  email: 'admin@iti-alex.edu.eg',
  full_name: 'المهندس المشرف (سوبر أدمن)',
  role: 'super_admin',
  assigned_department_id: null,
  created_at: new Date().toISOString(),
};
