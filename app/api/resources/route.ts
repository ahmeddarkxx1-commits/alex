import { NextRequest, NextResponse } from 'next/server';
import { dbGetResources, dbCreateResource, dbDeleteResource } from '@/lib/db';
import { AcademicYear, ResourceType, SemesterNumber } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
    const academicYear = (searchParams.get('academicYear') as AcademicYear) || undefined;
    const semesterParam = searchParams.get('semesterNumber');
    const semesterNumber = semesterParam ? (parseInt(semesterParam, 10) as SemesterNumber) : undefined;
    const type = (searchParams.get('type') as ResourceType | 'الكل') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const search = searchParams.get('search') || undefined;
    const reviewStatus = (searchParams.get('reviewStatus') as any) || undefined;

    const resources = dbGetResources({
      departmentId,
      academicYear,
      semesterNumber,
      type,
      subjectId,
      search,
      reviewStatus,
    });

    return NextResponse.json(resources);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching resources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.type || !body.academic_year) {
      return NextResponse.json({ error: 'العنوان ونوع المورد والفرقة الدراسية حقول مطلوبة' }, { status: 400 });
    }

    const created = dbCreateResource({
      title: body.title,
      summary: body.summary || '',
      content_markdown: body.content_markdown || body.summary || '',
      file_url: body.file_url || body.url || null,
      type: body.type,
      due_date: body.due_date || null,
      week_number: body.week_number ? Number(body.week_number) : undefined,
      subject_id: body.subject_id || '',
      department_id: body.department_id || 'dept-surveying',
      academic_year: body.academic_year,
      semester_number: body.semester_number || 1,
      author_name: body.author_name || 'مندوب الشعبة',
      is_pinned: body.is_pinned ?? false,
      review_status: body.review_status || 'approved',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating resource' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'معرف المورد مطلوب' }, { status: 400 });
    }

    const success = dbDeleteResource(id);
    if (!success) {
      return NextResponse.json({ error: 'المورد غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting resource' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'معرف المورد مطلوب' }, { status: 400 });
    }

    const { dbUpdateResource } = await import('@/lib/db');
    const updated = dbUpdateResource(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'المورد غير موجود' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating resource' }, { status: 500 });
  }
}
