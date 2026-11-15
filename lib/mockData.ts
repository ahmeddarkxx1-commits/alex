import { Department, Subject, Resource, Schedule, Announcement, AdminUser } from '@/types/database';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-surveying',
    slug: 'surveying',
    name_ar: 'شعبة المساحة العامة والخرائط',
    short_name: 'مساحة عامة',
    description: 'أعمال الرفع المساحي الميداني، أجهزة التوتال ستيشن والميزان، نظم المعلومات الجغرافية GIS، والخرائط الطبوغرافية وحصر الكميات.',
    icon_name: 'Compass',
  },
  {
    id: 'dept-arch-civil',
    slug: 'architecture-civil',
    name_ar: 'شعبة العمارة والإنشاءات المدنية',
    short_name: 'عمارة وإنشاءات',
    description: 'الرسم الهندسي المعماري، تكنولوجيا الخرسانة، ميكانيكا التربة والأساسات، وحساب تكاليف المشاريع الإنشائية.',
    icon_name: 'Building2',
  },
  {
    id: 'dept-electrical',
    slug: 'electrical-networks',
    name_ar: 'شعبة الشبكات والآلات الكهربية',
    short_name: 'كهرباء وقوى',
    description: 'محطات التوليد وشبكات النقل والتوزيع، الآلات والمحركات الكهربية، المحولات، ولوحات التحكم والتوزيع الصناعية.',
    icon_name: 'Zap',
  },
  {
    id: 'dept-electronics',
    slug: 'electronics-computers',
    name_ar: 'شعبة الأجهزة الإلكترونية والحاسبات',
    short_name: 'إلكترونيات وحاسبات',
    description: 'الدوائر الإلكترونية التناظرية والرقمية، المتحكمات الدقيقة Microcontrollers، صيانة الحاسب وشبكات الاتصالات ونظم المراقبة.',
    icon_name: 'Cpu',
  },
  {
    id: 'dept-refrigeration',
    slug: 'refrigeration-ac',
    name_ar: 'شعبة تكنولوجيا التبريد وتكييف الهواء',
    short_name: 'تبريد وتكييف',
    description: 'دورات التبريد الإنضغاطية، حساب الأحمال الحرارية للتكييف المركزي، نظم التثليج الصناعي وصيانة وحدات التكييف المنزلي والتجاري.',
    icon_name: 'Snowflake',
  },
  {
    id: 'dept-mechanics',
    slug: 'mechanical-production',
    name_ar: 'شعبة التشغيل والتشكيل وتكنولوجيا الإنتاج',
    short_name: 'تشغيل وميكانيكا',
    description: 'ماكينات الخراطة والتفريز والتجليخ، تشكيل المعادن واللحام، تكنولوجيا القياسات والمعايرة، وأساسيات التحكم الرقمي CNC.',
    icon_name: 'Wrench',
  },
  {
    id: 'dept-automotive',
    slug: 'automotive',
    name_ar: 'شعبة تكنولوجيا ميكانيكا وكهرباء السيارات',
    short_name: 'سيارات ومحركات',
    description: 'محركات الاحتراق الداخلي بنزين وديزل، نظم حقن الوقود الإلكتروني EFI، أنظمة الفرامل والتعليق والتوجيه، وأجهزة الفحص والتشخيص OBD.',
    icon_name: 'Car',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // شعبة المساحة - الفرقة الأولى
  {
    id: 'subj-surv-101',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'الأجهزة المساحية والميزانيات',
    code: 'SURV-101',
    instructor_name: 'د. إبراهيم عبد العزيز',
  },
  {
    id: 'subj-surv-102',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'المساحة الطبوغرافية والبوصلة',
    code: 'SURV-102',
    instructor_name: 'م. حسام الدين توفيق',
  },
  {
    id: 'subj-surv-103',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'الرسم المساحي وإسقاط الخرائط',
    code: 'SURV-103',
    instructor_name: 'م. سارة محمود',
  },
  {
    id: 'subj-surv-104',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الثاني',
    name_ar: 'حساب المثلثات الكروية وتطبيقاتها',
    code: 'MATH-102',
    instructor_name: 'د. عادل القاضي',
  },

  // شعبة المساحة - الفرقة الثانية
  {
    id: 'subj-surv-201',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الترم الأول',
    name_ar: 'المساحة الجيوديسية ونظام GPS',
    code: 'SURV-201',
    instructor_name: 'د. مدحت الشناوي',
  },
  {
    id: 'subj-surv-202',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الترم الأول',
    name_ar: 'حصر الكميات والمستخلصات وتطبيقات الطرق',
    code: 'SURV-202',
    instructor_name: 'م. أحمد الشريف',
  },
  {
    id: 'subj-surv-203',
    department_id: 'dept-surveying',
    academic_year: 'الفرقة الثانية',
    semester: 'الترم الأول',
    name_ar: 'ميكانيكا التربة وهندسة الري والمطارات',
    code: 'CIV-205',
    instructor_name: 'د. طارق السعيد',
  },

  // عمارة وإنشاءات
  {
    id: 'subj-arch-101',
    department_id: 'dept-arch-civil',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'رسم وتصميم معماري تنفيذي',
    code: 'ARCH-101',
    instructor_name: 'د. شريف الدسوقي',
  },
  {
    id: 'subj-civ-101',
    department_id: 'dept-arch-civil',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'خواص واختبار مواد البناء والخرسانة',
    code: 'CIV-101',
    instructor_name: 'د. علاء منصور',
  },

  // كهرباء
  {
    id: 'subj-elec-101',
    department_id: 'dept-electrical',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'الدوائر الكهربية والتيار المتردد AC',
    code: 'ELEC-101',
    instructor_name: 'د. حازم البرنس',
  },

  // إلكترونيات وحاسبات
  {
    id: 'subj-comp-101',
    department_id: 'dept-electronics',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'الدوائر المنطقية الرقمية Digital Circuits',
    code: 'COMP-101',
    instructor_name: 'د. رامي صقر',
  },

  // تبريد وتكييف
  {
    id: 'subj-thermo-101',
    department_id: 'dept-refrigeration',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'الديناميكا الحرارية وانتقال الحرارة',
    code: 'THERMO-101',
    instructor_name: 'د. محمد رضوان',
  },

  // ميكانيكا
  {
    id: 'subj-mech-101',
    department_id: 'dept-mechanics',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'تكنولوجيا تشغيل المعادن والخراطة',
    code: 'MECH-101',
    instructor_name: 'م. هيثم مرسي',
  },

  // سيارات
  {
    id: 'subj-auto-101',
    department_id: 'dept-automotive',
    academic_year: 'الفرقة الأولى',
    semester: 'الترم الأول',
    name_ar: 'محركات الاحتراق الداخلي وتزييتها',
    code: 'AUTO-101',
    instructor_name: 'م. أشرف بسيوني',
  },
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-surv-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-101',
    academic_year: 'الفرقة الأولى',
    type: 'تلخيص محاضرة',
    title: 'شرح أخطاء جهاز الميزان (Level) واختبار الوتدين Two-Peg Test وضبط خط التسديد',
    summary: 'ملخص شامل للمحاضرة الثالثة مع خطوات اختبار الوتدين العملية وقوانين تصحيح خطأ التحديب الأرضي والانكسار الجوي.',
    content_markdown: `### أخطاء جهاز الميزان الشائعة وكيفية تلافيها:

1. **الخطأ الآلي (Instrumental Error):**
   - عدم توازي محور خط النظر (Line of Collimation) مع المحور البصري لفقاعة التسوية.
   - عدم رأسية القامة أو تآكل كعب القامة المعدني.

2. **طريقة اختبار الوتدين الميداني (Two-Peg Test):**
   - يتم تثبيت وتدين $A$ و $B$ على مسافة $50$ إلى $60$ متراً في أرض مستوية.
   - **المرحلة 1:** يتم تنصيب الميزان في المنتصف تماماً بين $A$ و $B$.
     - قراءة القامة عند $A$ هي $a_1$ وعند $B$ هي $b_1$.
     - فرق المنسوب الحقيقي بين النقطتين:
       $$\\Delta h = a_1 - b_1$$
       *(لأن بُعد المسافة متساوٍ، فإن أي خطأ في ميل خط التسديد يُلغي نفسه تلقائياً)*.
   - **المرحلة 2:** يتم نقل الجهاز بالقرب من الوتد $A$ (على بُعد $2$ إلى $5$ أمتار).
     - نقرأ القامة عند $A$ لتكون $a_2$.
     - القراءة المفترضة الصحيحة عند $B$ يجب أن تكون:
       $$b_{2\\text{ (صحيحة)}} = a_2 - \\Delta h$$
     - إذا كانت القراءة الفعلية $b_2$ تختلف عن $b_{2\\text{ (صحيحة)}}$، يتم تحريك مسمار ضبط حامل الشعرات الشعرة الوسطى حتى تطابق القراءة الصحيحة.

3. **قوانين تصحيح التحديب والانكسار الجوي:**
   $$C_{cr} = 0.0675 \\times D^2$$
   *حيث $D$ هي المسافة بالكيلومتر والناتج $C_{cr}$ بالمتر يُطرح دائماً من قراءة القامة.*`,
    file_url: 'https://example.com/iti-notes/surveying-level-test.pdf',
    due_date: null,
    week_number: 3,
    author_name: 'م. محمود جمال (مندوب مساحة)',
    is_pinned: true,
    views_count: 420,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-2',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-101',
    academic_year: 'الفرقة الأولى',
    type: 'شيت وتكليف',
    title: 'شيت (2) تسوية طولية وحساب مناسيب النقاط بجدول ارتفاع الجهاز والارتفاع والانخفاض',
    summary: 'مطلوب تفريغ 14 قراءة قامة لمشروع خط مياه وإجراء التحقيق الحسابي الثلاثي ورسم القطاع الطولي.',
    content_markdown: `### متطلبات تسليم شيت (2):

- **بيانات القراءات الحقلية للميزانية:**
  - النقطة 1 (روبير منسوبه 12.450 م): قراءة مؤخرة 1.820 م.
  - النقاط التالية (متوسطات): 2.150 ، 1.940 ، 2.680 ، 1.450 م.
  - نقطة الدوران 1 (نقطة ربط): مقدمة 0.850 م ، ومؤخرة لنفس النقطة 2.300 م.
  - باقي النقاط ومقدمة الختام: 1.120 م.

#### المطلوب تنفيذه:
1. تفريغ القراءات في جدول **ارتفاع الجهاز (Height of Instrument Method)** وحساب مناسيب جميع النقاط.
2. تفريغ نفس القراءات في جدول **الارتفاع والانخفاض (Rise & Fall Method)** للمقارنة.
3. كتابة معادلة التحقيق الحسابي والتأكد من صحتها:
   $$\\sum \\text{Backsight} - \\sum \\text{Foresight} = \\text{Last RL} - \\text{First RL}$$
4. رسم بروفايل القطاع الطولي في كراسة الرسم المليمتري بمقياس رسم أفقي 1:1000 ورأسي 1:100.

> **تنبيه:** التسليم باليد بالمعمل في الموعد المحدد ولا يُقبل أي تأخير.`,
    file_url: 'https://example.com/iti-notes/sheet2-leveling.pdf',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(), // remaining 2 days
    week_number: 4,
    author_name: 'مكتب شيتات المعهد',
    is_pinned: true,
    views_count: 612,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-3',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-201',
    academic_year: 'الفرقة الثانية',
    type: 'مذكرة سكشن عملي',
    title: 'دليل التشغيل الميداني لأجهزة التوتال ستيشن Sokkia CX & Leica TS06',
    summary: 'دليل عملي مفصل للخطوات الميدانية: التسامت، ضبط الفقاعة الإلكترونية، الاحتلال، والتوجيه والرفع الطبوغرافي.',
    content_markdown: `### خطوات العمل على التوتال ستيشن:

1. **التسامت الميداني (Centering):**
   - تثبيت حامل الأرجل المعدني بحيث تكون أرجل الحامل متساوية والقاعدة أفقية بالعين المجردة.
   - فتح مسمار تثبيت الجهاز، وتشغيل شعاع الليزر السفلي (Laser Plummet) ليتطابق مع مسمار الوتد الأرضي.
2. **ضبط الأفقية الدقيقة:**
   - ضبط الفقاعة الدائرية بإطالة أو تقصير أرجل الحامل.
   - ضبط الفقاعة الأنبوبية/الإلكترونية باستخدام المسامير الثلاثية لقاعدة الجهاز (مسامير التسوية).
3. **الربط الموقعي (Station Setup):**
   - الدخول لقائمة **Programs -> Station Setup**.
   - اختيار الربط بمعلومية نقطة خلفية **Backsight Coordinates / Azimuth**.
   - إدخال إحداثيات المحطة المحتلة $X, Y, Z$ وقياس ارتفاع الجهاز بشريط القياس بدقة.
4. **توجيه العاكس (Prism):**
   - رصد سنتر المنشور وتصفير زاوية الانحراف أو تسجيل قراءة التحقق.
5. **الرفع الميداني والتسجيل:**
   - التبديل إلى شاشة **Survey / Meas + Rec** لرصد النقط وتخزين الأكواد المساحية.`,
    file_url: 'https://example.com/iti-notes/total-station-guide.pdf',
    due_date: null,
    week_number: 2,
    author_name: 'م. عمر سامي',
    is_pinned: false,
    views_count: 350,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'res-surv-4',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-202',
    academic_year: 'الفرقة الثانية',
    type: 'بنك أسئلة وامتحانات',
    title: 'بنك أسئلة ونماذج امتحانات الميدتيرم لمادة حصر الكميات والمستخلصات وتطبيقات الطرق',
    summary: 'نماذج امتحانات محلولة بالخطوات لحساب مكعبات الحفر والردم بطريقة متوسط المساحات وقاعدة الموشور الدقيق.',
    content_markdown: `### نماذج أسئلة متوقعة في امتحان أعمال الحفر والردم:

#### المسألة الأولى:
طريق ترابي مطلوب تسويته بطول $180$ متراً، قُسم إلى $3$ مسافات متساوية كل منها $60$ متراً.
كانت مساحات القطاعات العرضية عند المحطات كالآتي:
- المحطة $0+00$: مساحة حفر $A_0 = 42 \\text{ m}^2$
- المحطة $0+60$: مساحة حفر $A_1 = 35 \\text{ m}^2$
- المحطة $0+120$: مساحة حفر $A_2 = 28 \\text{ m}^2$
- المحطة $0+180$: مساحة حفر $A_3 = 18 \\text{ m}^2$

**المطلوب:**
1. حساب إجمالي حجم الحفر بطريقة **متوسط المساحات (Average End Area)**:
   $$V = \\frac{L}{2} \\times (A_0 + 2A_1 + 2A_2 + A_3)$$
2. حساب الحجم باستخدام **قاعدة سمبسون (Prismoidal Rule)** ومقارنة الدقة بين الطريقتين.

#### المسألة الثانية:
شرح بنود مستخلص المقاول العام للأعمال المساحية وطريقة اعتماد الشيتات المساحية المعتمدة من الاستشاري.`,
    file_url: 'https://example.com/iti-notes/survey-midterm-bank.pdf',
    due_date: null,
    week_number: 6,
    author_name: 'لجنة المراجعة الطلابية',
    is_pinned: false,
    views_count: 532,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'res-arch-1',
    department_id: 'dept-arch-civil',
    subject_id: 'subj-civ-101',
    academic_year: 'الفرقة الأولى',
    type: 'شيت وتكليف',
    title: 'شيت واختبارات معمل الخرسانة (اختبار الهبوط Slump Test ومقاومة الضغط)',
    summary: 'تقرير معملي لتحديد قوام الخرسانة الطازجة وحساب إجهاد الكسر لمكعبات الخرسانة بعمر 7 و 28 يوماً.',
    content_markdown: `### خطوات إعداد التقرير المعملي:
1. تسجيل أبعاد مخروط الهبوط القياسي (ارتفاع 30 سم، قطر سفلي 20 سم، قطر علوي 10 سم).
2. ملء المخروط على 3 طبقات ودمك كل طبقة 25 ضربة بقضيب الدمك القياسي.
3. قياس مقدار الهبوط (Slump) بالسنتيمتر وتصنيف القوام (جاف، لدن، رخو، منهار).
4. تجهيز جدول كسر مكعبات $15 \\times 15 \\times 15$ سم وحساب الإجهاد:
   $$f_c = \\frac{\\text{الحمل الأقصى (kN)} \\times 1000}{\\text{مساحة المقطع } (22500 \\text{ mm}^2)}$$`,
    file_url: 'https://example.com/iti-notes/civil-concrete-sheet.pdf',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    week_number: 5,
    author_name: 'مندوب عمارة ومدني',
    is_pinned: false,
    views_count: 215,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const INITIAL_SCHEDULES: Schedule[] = [
  // السبت - مساحة الفرقة الأولى
  {
    id: 'sch-1',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-101',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'السبت',
    start_time: '09:00',
    end_time: '11:00',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 2 - المبنى الرئيسي',
    instructor_name: 'د. إبراهيم عبد العزيز',
  },
  {
    id: 'sch-2',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-101',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'السبت',
    start_time: '11:15',
    end_time: '13:15',
    session_type: 'سكشن عملي',
    section_number: 'سكشن 1',
    location_room: 'أرض الرفع المساحي الميداني',
    instructor_name: 'م. حسام الدين توفيق',
  },
  {
    id: 'sch-3',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-103',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'السبت',
    start_time: '11:15',
    end_time: '13:15',
    session_type: 'ورشة',
    section_number: 'سكشن 2',
    location_room: 'صالة الرسم المساحي 3',
    instructor_name: 'م. سارة محمود',
  },

  // الأحد - مساحة الفرقة الأولى
  {
    id: 'sch-4',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-102',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'الأحد',
    start_time: '09:00',
    end_time: '10:30',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 1',
    instructor_name: 'م. حسام الدين توفيق',
  },
  {
    id: 'sch-5',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-102',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'الأحد',
    start_time: '10:45',
    end_time: '12:45',
    session_type: 'معمل',
    section_number: 'سكشن 3',
    location_room: 'معمل أجهزة المساحة الدقيقة',
    instructor_name: 'م. أحمد الشريف',
  },

  // الاثنين - مساحة الفرقة الأولى
  {
    id: 'sch-6',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-103',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'الاثنين',
    start_time: '08:30',
    end_time: '11:00',
    session_type: 'ورشة',
    section_number: 'عام',
    location_room: 'صالة الرسم المساحي 1',
    instructor_name: 'م. سارة محمود',
  },

  // الثلاثاء - مساحة الفرقة الأولى
  {
    id: 'sch-7',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-101',
    academic_year: 'الفرقة الأولى',
    day_of_week: 'الثلاثاء',
    start_time: '10:00',
    end_time: '12:30',
    session_type: 'سكشن عملي',
    section_number: 'سكشن 4',
    location_room: 'أرض الرفع المساحي الميداني',
    instructor_name: 'م. عمر سامي',
  },

  // السبت - مساحة الفرقة الثانية
  {
    id: 'sch-8',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-201',
    academic_year: 'الفرقة الثانية',
    day_of_week: 'السبت',
    start_time: '08:30',
    end_time: '10:30',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 3 - قاعة المؤتمرات',
    instructor_name: 'د. مدحت الشناوي',
  },
  {
    id: 'sch-9',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-201',
    academic_year: 'الفرقة الثانية',
    day_of_week: 'السبت',
    start_time: '10:45',
    end_time: '13:00',
    session_type: 'سكشن عملي',
    section_number: 'سكشن 1',
    location_room: 'موقع الرصد الجيوديسي الخارجي',
    instructor_name: 'م. عمر سامي',
  },

  // الأحد - مساحة الفرقة الثانية
  {
    id: 'sch-10',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-202',
    academic_year: 'الفرقة الثانية',
    day_of_week: 'الأحد',
    start_time: '09:00',
    end_time: '11:00',
    session_type: 'محاضرة نظري',
    section_number: 'عام',
    location_room: 'مدرج 2',
    instructor_name: 'م. أحمد الشريف',
  },
  {
    id: 'sch-11',
    department_id: 'dept-surveying',
    subject_id: 'subj-surv-203',
    academic_year: 'الفرقة الثانية',
    day_of_week: 'الثلاثاء',
    start_time: '11:00',
    end_time: '13:00',
    session_type: 'معمل',
    section_number: 'سكشن 2',
    location_room: 'معمل ميكانيكا التربة والهيدروليكا',
    instructor_name: 'د. طارق السعيد',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    department_id: 'dept-surveying',
    title: 'تنبيه عاجل: تسليم شيت 2 ميزانيات معملية وتوقيع دفاتر الحقل',
    details: 'تنبيه لطلاب الفرقة الأولى شعبة مساحة: آخر موعد لتسليم شيت الميزانيات وتوقيع دفاتر الحقل العملي يوم الأحد القادم بمكتب د. إبراهيم. لن يتم قبول شيتات بعد هذا الموعد.',
    category: 'تسليم شيت',
    urgency: 'عاجل جداً',
    event_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ann-2',
    department_id: 'dept-surveying',
    title: 'موعد امتحان عملي منتصف الفصل لأجهزة الميزان والتوتال ستيشن',
    details: 'يبدأ الاختبار الميداني العملي لقياس سرعة ودقة ضبط الأفقية والتوجيه ورصد القامة يوم السبت القادم لكل سكشن في موعده الرسمي.',
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
