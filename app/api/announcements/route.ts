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
          // Deduplicate items with identical title + details
          const seen = new Set<string>();
          const deduped: any[] = [];
          for (const item of (data as any[])) {
            const key = `${(item.title || '').trim()}__${(item.details || item.body || '').trim()}`;
            if (!seen.has(item.id) && !seen.has(key)) {
              seen.add(item.id);
              seen.add(key);
              deduped.push(item);
            }
          }
          return NextResponse.json(deduped);
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

    const targetId = body.id || `ann-${Date.now()}`;
    const cleanTitle = body.title.trim();
    const cleanDetails = (body.details || body.body || '').trim();

    // Check Supabase Cloud first for duplicate prevention
    const { isSupabaseConfigured, supabase } = await import('@/lib/supabase');
    if (isSupabaseConfigured) {
      try {
        const { data: existingSupabase } = await supabase
          .from('announcements')
          .select('*')
          .eq('title', cleanTitle)
          .limit(1);

        if (existingSupabase && existingSupabase.length > 0) {
          return NextResponse.json(existingSupabase[0], { status: 200 });
        }
      } catch (err) {
        console.warn('Supabase check existing warning:', err);
      }
    }

    let created: any = null;
    try {
      created = dbCreateAnnouncement({
        id: targetId,
        title: cleanTitle,
        details: cleanDetails,
        category: (body.category as AnnouncementCategory) || 'تنبيه_هام',
        urgency: (body.urgency as UrgencyLevel) || (body.is_urgent ? 'عاجل' : 'عادي'),
        event_date: body.event_date || null,
        is_active: body.is_active ?? true,
        department_id: body.department_id || 'dept-surveying',
      });
    } catch {
      created = {
        id: targetId,
        title: cleanTitle,
        details: cleanDetails,
        category: (body.category as AnnouncementCategory) || 'تنبيه_هام',
        urgency: (body.urgency as UrgencyLevel) || (body.is_urgent ? 'عاجل' : 'عادي'),
        event_date: body.event_date || null,
        is_active: body.is_active ?? true,
        department_id: body.department_id || 'dept-surveying',
        created_at: new Date().toISOString(),
      };
    }

    // Sync to Supabase Cloud
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
