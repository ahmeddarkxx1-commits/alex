import { NextRequest, NextResponse } from 'next/server';
import { dbGetSubjects, dbUpdateSubject } from '@/lib/db';
import { AcademicYear, SemesterNumber } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
    const academicYear = (searchParams.get('academicYear') as AcademicYear) || undefined;
    const semesterParam = searchParams.get('semesterNumber');
    const semesterNumber = semesterParam ? (parseInt(semesterParam, 10) as SemesterNumber) : undefined;

    // 1. Fetch from Supabase Cloud first
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('subjects').select('*');
        if (departmentId) q = q.eq('department_id', departmentId);
        if (academicYear) q = q.eq('academic_year', academicYear);
        if (semesterNumber) q = q.eq('semester_number', semesterNumber);

        const { data, error } = await q.order('semester_number', { ascending: true });
        if (!error && data && data.length > 0) {
          return NextResponse.json(data);
        }
        if (error) {
          console.warn('Supabase subjects GET error:', error);
        }
      } catch (supErr) {
        console.warn('Supabase subjects GET exception, falling back:', supErr);
      }
    }

    // 2. Fallback to local database
    const subjects = dbGetSubjects({
      departmentId,
      academicYear,
      semesterNumber,
    });

    return NextResponse.json(subjects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching subjects' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, instructor_name, description, name_ar } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (instructor_name !== undefined) updates.instructor_name = String(instructor_name).trim();
    if (description !== undefined) updates.description = String(description).trim();
    if (name_ar !== undefined) updates.name_ar = String(name_ar).trim();

    let updatedRecord: any = null;

    // 1. Direct update to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await (supabase.from('subjects') as any)
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedRecord = data;
        } else if (error) {
          console.warn('Supabase updateSubject error:', error);
        }
      } catch (supErr) {
        console.warn('Supabase updateSubject exception:', supErr);
      }
    }

    // 2. Update local db if possible (might be read-only on serverless)
    try {
      const local = dbUpdateSubject(id, updates);
      if (!updatedRecord && local) {
        updatedRecord = local;
      }
    } catch (localErr) {
      console.warn('Local dbUpdateSubject error (expected on read-only serverless):', localErr);
    }

    if (!updatedRecord) {
      updatedRecord = { id, ...updates };
    }

    return NextResponse.json(updatedRecord);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating subject' }, { status: 500 });
  }
}
