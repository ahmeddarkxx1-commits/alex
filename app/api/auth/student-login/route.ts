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
      return NextResponse.json({ error: 'لم يتم العثور على طالب بهذه البيانات. يمكنك التسجيل كطالب جديد.' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'خطأ في عملية تسجيل الدخول' }, { status: 500 });
  }
}
