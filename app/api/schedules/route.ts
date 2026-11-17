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

    // 1. Fetch from Supabase Cloud first
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('schedules').select('*');
        if (departmentId) q = q.eq('department_id', departmentId);
        if (academicYear) q = q.eq('academic_year', academicYear);
        if (dayOfWeek) q = q.eq('day_of_week', dayOfWeek);
        if (sectionNumber && sectionNumber !== 'عام') {
          q = q.or(`section_number.eq.${sectionNumber},section_number.eq.عام`);
        }

        const { data, error } = await q.order('start_time', { ascending: true });
        if (!error && data && data.length > 0) {
          let allSubjs: any[] = [];
          try {
            const { data: subData } = await supabase.from('subjects').select('*');
            if (subData && subData.length > 0) allSubjs = subData;
          } catch {}
          if (allSubjs.length === 0) {
            const { dbGetSubjects } = await import('@/lib/db');
            allSubjs = dbGetSubjects();
          }

          const { dbGetDepartments } = await import('@/lib/db');
          const allDepts = dbGetDepartments();
          const enriched = data.map((s: any) => {
            const sub = allSubjs.find((subj) => subj.id === s.subject_id);
            const inst = (s.instructor_name || sub?.instructor_name || '').trim();
            const isMock = inst.includes('إبراهيم') || inst.includes('هيئة');
            return {
              ...s,
              subject: sub,
              instructor_name: isMock ? '' : inst,
              department: allDepts.find((d) => d.id === s.department_id),
            };
          });
          return NextResponse.json(enriched);
        }
      } catch (e) {
        console.warn('Supabase schedules GET error, falling back:', e);
      }
    }

    // 2. Fallback to local DB
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

    let created: any = null;
    try {
      created = dbCreateSchedule({
        department_id: body.department_id || 'dept-surveying',
        academic_year: body.academic_year || 'الفرقة الأولى',
        semester_number: body.semester_number || 1,
        subject_id: body.subject_id,
        day_of_week: (body.day_of_week as DayOfWeek) || 'السبت',
        start_time: body.start_time,
        end_time: body.end_time,
        location_room: body.location_room || body.location || 'مدرج 1',
        instructor_name: body.instructor_name || body.instructor || '',
        session_type: (body.session_type as SessionType) || 'محاضرة',
        section_number: (body.section_number as SectionNumber) || 'عام',
      });
    } catch {
      created = {
        id: `sch-${Date.now()}`,
        department_id: body.department_id || 'dept-surveying',
        academic_year: body.academic_year || 'الفرقة الأولى',
        semester_number: body.semester_number || 1,
        subject_id: body.subject_id,
        day_of_week: (body.day_of_week as DayOfWeek) || 'السبت',
        start_time: body.start_time,
        end_time: body.end_time,
        location_room: body.location_room || body.location || 'مدرج 1',
        instructor_name: body.instructor_name || body.instructor || '',
        session_type: (body.session_type as SessionType) || 'محاضرة',
        section_number: (body.section_number as SectionNumber) || 'عام',
        created_at: new Date().toISOString(),
      };
    }

    // Sync to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('schedules') as any).upsert(created);
      } catch (syncErr) {
        console.warn('Supabase schedule sync error:', syncErr);
      }
    }

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

    try {
      dbDeleteSchedule(id);
    } catch {
      // ignore
    }

    // Sync deletion to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('schedules').delete().eq('id', id);
      } catch (syncErr) {
        console.warn('Supabase schedule delete error:', syncErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting schedule' }, { status: 500 });
  }
}
