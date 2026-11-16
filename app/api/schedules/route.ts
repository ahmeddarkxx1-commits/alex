import { NextRequest, NextResponse } from 'next/server';
import { dbGetSchedules, dbCreateSchedule, dbDeleteSchedule } from '@/lib/db';
import { AcademicYear, DayOfWeek, SectionNumber, SessionType } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
    const academicYear = (searchParams.get('academicYear') as AcademicYear) || undefined;
    const dayOfWeek = (searchParams.get('dayOfWeek') as DayOfWeek) || undefined;
    const sectionNumber = (searchParams.get('sectionNumber') as SectionNumber) || undefined;

    const schedules = dbGetSchedules({
      departmentId,
      academicYear,
      dayOfWeek,
      sectionNumber,
    });

    return NextResponse.json(schedules);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.subject_id || !body.day_of_week || !body.start_time || !body.end_time) {
      return NextResponse.json({ error: 'بيانات المحاضرة / السكشن ناقصة' }, { status: 400 });
    }

    const created = dbCreateSchedule({
      department_id: body.department_id || 'dept-surveying',
      academic_year: body.academic_year || 'الفرقة الأولى',
      semester_number: body.semester_number || 1,
      subject_id: body.subject_id,
      day_of_week: (body.day_of_week as DayOfWeek) || 'السبت',
      start_time: body.start_time,
      end_time: body.end_time,
      location_room: body.location_room || body.location || 'مدرج 1',
      instructor_name: body.instructor_name || body.instructor || 'هيئة التدريس',
      session_type: (body.session_type as SessionType) || 'محاضرة',
      section_number: (body.section_number as SectionNumber) || 'عام',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating schedule' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'معرف الحصة مطلوب' }, { status: 400 });
    }

    const success = dbDeleteSchedule(id);
    if (!success) {
      return NextResponse.json({ error: 'الحصة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting schedule' }, { status: 500 });
  }
}
