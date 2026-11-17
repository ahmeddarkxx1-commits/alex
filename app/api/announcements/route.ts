import { NextRequest, NextResponse } from 'next/server';
import { dbGetAnnouncements, dbCreateAnnouncement, dbDeleteAnnouncement } from '@/lib/db';
import { AnnouncementCategory, UrgencyLevel } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;

    // 1. Fetch from Supabase Cloud first
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        let q = supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (departmentId) {
          q = q.or(`department_id.eq.${departmentId},department_id.is.null`);
        }

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          return NextResponse.json(data);
        }
      } catch (e) {
        console.warn('Supabase announcements GET error, falling back:', e);
      }
    }

    // 2. Fallback to local DB
    const announcements = dbGetAnnouncements(departmentId);
    return NextResponse.json(announcements);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error fetching announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !(body.details || body.body)) {
      return NextResponse.json({ error: 'العنوان وتفاصيل الإشعار مطلوبة' }, { status: 400 });
    }

    let created: any = null;
    try {
      created = dbCreateAnnouncement({
        title: body.title,
        details: body.details || body.body || '',
        category: (body.category as AnnouncementCategory) || 'تنبيه_هام',
        urgency: (body.urgency as UrgencyLevel) || (body.is_urgent ? 'عاجل' : 'عادي'),
        event_date: body.event_date || null,
        is_active: body.is_active ?? true,
        department_id: body.department_id || 'dept-surveying',
      });
    } catch {
      created = {
        id: `ann-${Date.now()}`,
        title: body.title,
        details: body.details || body.body || '',
        category: (body.category as AnnouncementCategory) || 'تنبيه_هام',
        urgency: (body.urgency as UrgencyLevel) || (body.is_urgent ? 'عاجل' : 'عادي'),
        event_date: body.event_date || null,
        is_active: body.is_active ?? true,
        department_id: body.department_id || 'dept-surveying',
        created_at: new Date().toISOString(),
      };
    }

    // Sync to Supabase Cloud
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await (supabase.from('announcements') as any).upsert(created);
      } catch (syncErr) {
        console.warn('Supabase announcement sync error:', syncErr);
      }
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating announcement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف التنبيه مطلوب للحذف' }, { status: 400 });
    }

    // 1. Delete from Supabase if configured
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase announcement delete warning:', err);
      }
    }

    // 2. Delete from local database
    const success = dbDeleteAnnouncement(id);
    return NextResponse.json({ success, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting announcement' }, { status: 500 });
  }
}
