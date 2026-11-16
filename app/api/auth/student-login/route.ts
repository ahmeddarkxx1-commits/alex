import { NextRequest, NextResponse } from 'next/server';
import { dbFindStudent, dbGetStudents } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = (body.query || body.student_code || body.name || '').trim();

    if (!query) {
      return NextResponse.json({ error: 'يرجى إدخال اسم الطالب أو رقم الكود' }, { status: 400 });
    }

    // Try finding by code or name
    let student = dbFindStudent({ code: query });
    if (!student) {
      student = dbFindStudent({ name: query });
    }

    if (!student) {
      // Fuzzy search in students array
      const all = dbGetStudents();
      const clean = query.toLowerCase();
      student = all.find(
        (s) =>
          s.name.toLowerCase().includes(clean) ||
          (s.student_code && s.student_code.toLowerCase().includes(clean)) ||
          (s.phone && s.phone.includes(clean))
      ) || null;
    }

    if (!student) {
      // Check Supabase Cloud Database
      try {
        const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
        if (isSupabaseConfigured) {
          const { data } = await supabase
            .from('students')
            .select('*')
            .or(`student_code.eq.${query},name.ilike.%${query}%,phone.eq.${query}`)
            .limit(1);
          if (data && data.length > 0) {
            student = data[0] as any;
            const { dbCreateOrUpdateStudent } = await import('@/lib/db');
            if (student) dbCreateOrUpdateStudent(student);
          }
        }
      } catch (cloudErr) {
        console.warn('Supabase login fallback warning:', cloudErr);
      }
    }

    if (!student) {
      return NextResponse.json({ error: 'لم يتم العثور على طالب بهذه البيانات. يمكنك التسجيل كطالب جديد.' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في عملية تسجيل الدخول' }, { status: 500 });
  }
}
