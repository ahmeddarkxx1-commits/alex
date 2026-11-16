import { NextRequest, NextResponse } from 'next/server';
import { dbGetSubjects } from '@/lib/db';
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
