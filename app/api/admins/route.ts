import { NextRequest, NextResponse } from 'next/server';
import { dbGetAdmins, dbFindAdmin, dbCreateOrUpdateAdmin, dbDeleteAdmin } from '@/lib/db';
import { AdminUser } from '@/types/database';

export async function GET() {
  try {
    const admins = dbGetAdmins();
    // Mask password in response for safety
    const safeAdmins = admins.map(({ password, ...rest }) => ({
      ...rest,
      has_password: Boolean(password),
    }));
    return NextResponse.json(safeAdmins);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, full_name, password, role, assigned_department_id } = body;

    if (!email || !full_name || !password || !role) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة: الاسم، البريد، كلمة المرور، والصلاحية' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = dbFindAdmin({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر' },
        { status: 409 }
      );
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      full_name: String(full_name).trim(),
      password: String(password).trim(),
      role: role as any,
      assigned_department_id: assigned_department_id || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const saved = dbCreateOrUpdateAdmin(newAdmin);

    // Sync to Supabase admins table
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('admins') as any).upsert({
          id: saved.id,
          email: saved.email,
          full_name: saved.full_name,
          role: saved.role,
          assigned_department_id: saved.assigned_department_id || null,
        });
      } catch (syncErr) {
        console.warn('Supabase admins sync warning:', syncErr);
      }
    }

    const { password: _, ...safeSaved } = saved;
    return NextResponse.json(safeSaved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل في إضافة المشرف' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role, is_active, full_name, password, assigned_department_id } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المستخدم (id) مطلوب' }, { status: 400 });
    }

    const existing = dbFindAdmin({ id });
    if (!existing) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const updated: AdminUser = {
      ...existing,
      role: role !== undefined ? role : existing.role,
      is_active: is_active !== undefined ? is_active : existing.is_active,
      full_name: full_name !== undefined ? full_name : existing.full_name,
      password: password !== undefined ? password : existing.password,
      assigned_department_id:
        assigned_department_id !== undefined ? assigned_department_id : existing.assigned_department_id,
    };

    const saved = dbCreateOrUpdateAdmin(updated);

    // Sync to Supabase
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('admins') as any).upsert({
          id: saved.id,
          email: saved.email,
          full_name: saved.full_name,
          role: saved.role,
          assigned_department_id: saved.assigned_department_id || null,
        });
      } catch (syncErr) {
        console.warn('Supabase admins sync warning:', syncErr);
      }
    }

    const { password: _, ...safeSaved } = saved;
    return NextResponse.json(safeSaved);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل في تحديث بيانات المشرف' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف المستخدم (id) مطلوب' }, { status: 400 });
    }

    if (id === 'admin-super') {
      return NextResponse.json({ error: 'لا يمكن حذف حساب المشرف العام الرئيسي' }, { status: 403 });
    }

    const success = dbDeleteAdmin(id);
    if (!success) {
      return NextResponse.json({ error: 'المستخدم غير موجود أو فشل حذفه' }, { status: 404 });
    }

    // Sync deletion to Supabase
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('admins').delete().eq('id', id);
      } catch (syncErr) {
        console.warn('Supabase admins delete warning:', syncErr);
      }
    }

    return NextResponse.json({ success: true, message: 'تم حذف الحساب بنجاح' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل في حذف المشرف' }, { status: 500 });
  }
}
