import { NextRequest, NextResponse } from 'next/server';
import { dbGetAdmins, dbFindAdmin, dbCreateOrUpdateAdmin, dbDeleteAdmin } from '@/lib/db';
import { parseSupabaseAdmin, serializeAdminDept } from '@/lib/adminHelpers';
import { AdminUser } from '@/types/database';

export async function GET() {
  try {
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    const map = new Map<string, AdminUser>();

    // 1. Load local base admins
    const localAdmins = dbGetAdmins();
    for (const a of localAdmins) {
      map.set(a.id, a);
    }

    // 2. Fetch from Supabase Cloud
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: true });
        if (!error && data && data.length > 0) {
          for (const row of data) {
            const parsed = parseSupabaseAdmin(row);
            const existing = map.get(parsed.id);
            map.set(parsed.id, {
              ...existing,
              ...parsed,
              password: parsed.password || existing?.password,
            });
          }
        }
      } catch (e) {
        console.warn('Supabase admins GET error:', e);
      }
    }

    const merged = Array.from(map.values());
    // Mask password in response for safety
    const safeAdmins = merged.map(({ password, ...rest }) => ({
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

    // Check if email exists in Supabase or local
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('admins').select('id').eq('email', cleanEmail).maybeSingle();
        if (data) {
          return NextResponse.json(
            { error: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر' },
            { status: 409 }
          );
        }
      } catch (e) {
        // fallback
      }
    }

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

    try {
      dbCreateOrUpdateAdmin(newAdmin);
    } catch {
      // ignore local write error on read-only serverless
    }

    // Sync to Supabase admins table
    if (isSupabaseConfigured) {
      try {
        const serializedDept = serializeAdminDept(newAdmin);
        await (supabase.from('admins') as any).upsert({
          id: newAdmin.id,
          email: newAdmin.email,
          full_name: newAdmin.full_name,
          role: newAdmin.role,
          assigned_department_id: serializedDept,
        });
      } catch (syncErr) {
        console.warn('Supabase admins sync warning:', syncErr);
      }
    }

    const { password: _, ...safeSaved } = newAdmin;
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

    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    let currentAdmin: AdminUser | null = dbFindAdmin({ id });

    if (!currentAdmin && isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('admins').select('*').eq('id', id).maybeSingle();
        if (data) currentAdmin = parseSupabaseAdmin(data);
      } catch (e) {
        // ignore
      }
    }

    if (!currentAdmin) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const updated: AdminUser = {
      ...currentAdmin,
      role: role !== undefined ? role : currentAdmin.role,
      is_active: is_active !== undefined ? is_active : currentAdmin.is_active,
      full_name: full_name !== undefined ? full_name : currentAdmin.full_name,
      password: password !== undefined ? password : currentAdmin.password,
      assigned_department_id:
        assigned_department_id !== undefined ? assigned_department_id : currentAdmin.assigned_department_id,
    };

    try {
      dbCreateOrUpdateAdmin(updated);
    } catch {
      // ignore
    }

    // Sync to Supabase
    if (isSupabaseConfigured) {
      try {
        const serializedDept = serializeAdminDept(updated);
        await (supabase.from('admins') as any).upsert({
          id: updated.id,
          email: updated.email,
          full_name: updated.full_name,
          role: updated.role,
          assigned_department_id: serializedDept,
        });
      } catch (syncErr) {
        console.warn('Supabase admins sync warning:', syncErr);
      }
    }

    const { password: _, ...safeSaved } = updated;
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

    try {
      dbDeleteAdmin(id);
    } catch {
      // ignore
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
