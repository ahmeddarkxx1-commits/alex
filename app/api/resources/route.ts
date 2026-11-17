import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

    // 1. Fetch from Supabase Cloud first
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        let q = supabase.from('resources').select('*');
        if (departmentId) q = q.eq('department_id', departmentId);
        if (academicYear) q = q.eq('academic_year', academicYear);
        if (semesterNumber) q = q.eq('semester_number', semesterNumber);
        if (type && type !== 'الكل') q = q.eq('type', type);
        if (subjectId && subjectId !== 'all') q = q.eq('subject_id', subjectId);
        if (reviewStatus && reviewStatus !== 'all') q = q.eq('review_status', reviewStatus);
        if (search) q = q.ilike('title', `%${search}%`);

        const { data, error } = await q
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

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
          const enriched = data.map((r: any) => ({
            ...r,
            subject: allSubjs.find((s) => s.id === r.subject_id),
            department: allDepts.find((d) => d.id === r.department_id),
          }));
          return NextResponse.json(enriched);
        }
      } catch (e) {
        console.warn('Supabase resources GET error, falling back:', e);
      }
    }

    // 2. Fallback to local DB
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

    // Sync with Supabase Cloud
    try {
      const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
      if (isSupabaseConfigured) {
        await (supabase.from('resources') as any).upsert({
          id: created.id,
          department_id: created.department_id,
          subject_id: created.subject_id,
          academic_year: created.academic_year,
          semester_number: created.semester_number,
          type: created.type,
          title: created.title,
          summary: created.summary,
          content_markdown: created.content_markdown,
          file_url: created.file_url,
          due_date: created.due_date,
          week_number: created.week_number,
          author_name: created.author_name,
          is_pinned: created.is_pinned,
          views_count: created.views_count,
          review_status: created.review_status,
          reviewer_name: created.reviewer_name,
          reviewed_at: created.reviewed_at,
          created_at: created.created_at,
        });
      }
    } catch (syncErr) {
      console.warn('Supabase resource insert sync warning:', syncErr);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating resource' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const explicitFileUrl = searchParams.get('fileUrl');
    if (!id) {
      return NextResponse.json({ error: 'معرف المورد مطلوب' }, { status: 400 });
    }

    const targetFileUrls: Set<string> = new Set();
    if (explicitFileUrl) targetFileUrls.add(explicitFileUrl);

    // 1. Fetch resource from Supabase Cloud to find all linked file URLs
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        const { data } = await (supabase.from('resources') as any).select('*').eq('id', id).maybeSingle();
        if (data?.file_url) {
          targetFileUrls.add(data.file_url);
        }
      } catch (e) {
        console.warn('Supabase fetch before delete error:', e);
      }
    }

    // Also check local db.json
    try {
      const local = dbGetResources().find((r) => r.id === id);
      if (local?.file_url) {
        targetFileUrls.add(local.file_url);
      }
      dbDeleteResource(id);
    } catch (localErr) {
      console.warn('Local db delete error:', localErr);
    }

    // 2. Permanently delete from Supabase Cloud
    if (isSupabaseConfigured) {
      try {
        // Delete the main resource record
        await supabase.from('resources').delete().eq('id', id);

        // Delete any staged file records or duplicate records matching any of the file URLs
        for (const fUrl of Array.from(targetFileUrls)) {
          const filename = path.basename(fUrl);
          await (supabase.from('resources') as any)
            .delete()
            .or(`file_url.ilike.%${filename}%,summary.ilike.%${filename}%`);
        }
      } catch (syncErr) {
        console.warn('Supabase resource delete sync error:', syncErr);
      }

      // Delete from Supabase Storage bucket if configured
      try {
        for (const fUrl of Array.from(targetFileUrls)) {
          const filename = path.basename(fUrl);
          await supabase.storage.from('resources').remove([filename]);
        }
      } catch (storageErr) {
        // ignore
      }
    }

    // 3. Physically delete file from server storage (/tmp and public/uploads)
    for (const fUrl of Array.from(targetFileUrls)) {
      try {
        const filename = path.basename(fUrl);
        const tmpPath = path.join('/tmp', 'uploads', filename);
        const localPath = path.join(process.cwd(), 'public', 'uploads', filename);

        if (fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
          console.log(`Physically removed from /tmp/uploads: ${filename}`);
        }
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
          console.log(`Physically removed from public/uploads: ${filename}`);
        }
      } catch (unlinkErr) {
        console.warn('Error physically deleting file from disk:', unlinkErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف المحتوى والملفات المرفقة به نهائياً من قاعدة البيانات والسيرفر.',
      deleted_id: id,
      deleted_files: Array.from(targetFileUrls),
    });
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

    // Sync update with Supabase Cloud
    try {
      const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
      if (isSupabaseConfigured) {
        await (supabase.from('resources') as any).update(body).eq('id', body.id);
      }
    } catch (syncErr) {
      console.warn('Supabase resource update sync warning:', syncErr);
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating resource' }, { status: 500 });
  }
}
