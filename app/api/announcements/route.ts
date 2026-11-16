import { NextRequest, NextResponse } from 'next/server';
import { dbGetAnnouncements, dbCreateAnnouncement } from '@/lib/db';
import { AnnouncementCategory, UrgencyLevel } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;
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

    const created = dbCreateAnnouncement({
      title: body.title,
      details: body.details || body.body || '',
      category: (body.category as AnnouncementCategory) || 'تنبيه_هام',
      urgency: (body.urgency as UrgencyLevel) || (body.is_urgent ? 'عاجل' : 'عادي'),
      event_date: body.event_date || null,
      is_active: body.is_active ?? true,
      department_id: body.department_id || 'dept-surveying',
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating announcement' }, { status: 500 });
  }
}
