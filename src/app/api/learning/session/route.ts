import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getCourseBySlug } from '@/features/learning/data/catalog';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !supabase) {
      return NextResponse.json({ ok: false, mode: 'unauthenticated' });
    }

    const body = await request.json();
    const courseSlug = body?.courseSlug as string | undefined;
    const deviceLabel = (body?.deviceLabel as string | undefined) ?? 'Unknown device';

    if (!courseSlug || !getCourseBySlug(courseSlug)) {
      return NextResponse.json({ ok: false, error: 'invalid course' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp ?? 'unknown');
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    await supabase.from('learning_sessions').upsert(
      {
        user_id: session.user.id,
        course_slug: courseSlug,
        ip_address: ip,
        user_agent: userAgent,
        device_label: deviceLabel,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_slug,ip_address,user_agent' },
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !supabase) {
      return NextResponse.json({ sessions: [] });
    }

    const url = new URL(request.url);
    const courseSlug = url.searchParams.get('courseSlug');
    if (!courseSlug) return NextResponse.json({ sessions: [] });

    const { data } = await supabase
      .from('learning_sessions')
      .select('id,device_label,last_active_at,created_at')
      .eq('user_id', session.user.id)
      .eq('course_slug', courseSlug)
      .order('last_active_at', { ascending: false })
      .limit(8);

    return NextResponse.json({ sessions: data ?? [] });
  } catch {
    return NextResponse.json({ sessions: [] });
  }
}
