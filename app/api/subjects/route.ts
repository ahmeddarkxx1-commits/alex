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

    const updated = dbUpdateSubject(id, {
      ...(instructor_name !== undefined ? { instructor_name: String(instructor_name).trim() } : {}),
      ...(description !== undefined ? { description: String(description).trim() } : {}),
      ...(name_ar !== undefined ? { name_ar: String(name_ar).trim() } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating subject' }, { status: 500 });
  }
}
