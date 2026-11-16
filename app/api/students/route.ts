import { NextRequest, NextResponse } from 'next/server';
import { dbGetStudents, dbCreateOrUpdateStudent, dbFindStudent } from '@/lib/db';
import { StudentUser } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || undefined;
    const name = searchParams.get('name') || undefined;
    const id = searchParams.get('id') || undefined;

    if (code || name || id) {
      const found = dbFindStudent({ code, name, id });
      if (!found) {
        return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 });
      }
      return NextResponse.json(found);
    }

    const students = dbGetStudents();
    return NextResponse.json(students);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.academic_year || !body.semester_number) {
      return NextResponse.json({ error: 'الاسم والسنة الدراسية والفصل الدراسي حقول مطلوبة' }, { status: 400 });
    }

    const student: Omit<StudentUser, 'id' | 'created_at'> & { id?: string } = {
      id: body.id,
      name: body.name.trim(),
      student_code: body.student_code ? body.student_code.trim() : undefined,
      phone: body.phone ? body.phone.trim() : undefined,
      department_id: body.department_id || 'dept-surveying',
      department_name: body.department_name || 'شعبة المساحة العامة',
      academic_year: body.academic_year,
      semester_number: Number(body.semester_number) as any,
      section_number: body.section_number || 'سكشن 1',
    };

    const saved = dbCreateOrUpdateStudent(student);

    // Two-way synchronization with Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('students').upsert(saved);
      } catch (syncErr) {
        console.warn('Supabase student sync warning:', syncErr);
      }
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل في حفظ بيانات الطالب' }, { status: 500 });
  }
}
