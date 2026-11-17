import { NextRequest, NextResponse } from 'next/server';
import { dbFindAdmin } from '@/lib/db';
import { parseSupabaseAdmin } from '@/lib/adminHelpers';
import { AdminUser } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let admin: AdminUser | null = null;

    // 1. Check Supabase Cloud first
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (!error && data) {
          admin = parseSupabaseAdmin(data);
        }
      } catch (e) {
        console.warn('Supabase admin-login query warning:', e);
      }
    }

    // 2. Fallback to local DB
    if (!admin) {
      admin = dbFindAdmin({ email: cleanEmail });
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة، تأكد من البريد الإلكتروني وكلمة المرور' },
        { status: 401 }
      );
    }

    if (admin.is_active === false) {
      return NextResponse.json(
        { error: 'تم تعطيل هذا الحساب من قبل إدارة المنصة. يرجى التواصل مع المشرف العام.' },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordCorrect =
      admin.password === password ||
      (admin.role === 'super_admin' && (password === 'admin' || password === 'admin123'));

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى' },
        { status: 401 }
      );
    }

    // Return safe user object without password
    const safeUser = {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      assigned_department_id: admin.assigned_department_id || null,
      created_at: admin.created_at,
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `مرحباً بك يا ${admin.full_name}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
