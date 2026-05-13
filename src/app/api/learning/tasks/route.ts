import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 500 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { courseSlug, taskId, status } = await request.json();

  if (!courseSlug || !taskId || !status) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase!.from('learning_user_task_progress').upsert(
    {
      user_id: session.user.id,
      course_slug: courseSlug,
      task_id: taskId,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_slug,task_id' }
  );

  if (error) {
    console.error('Save task error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get('courseSlug');

  if (!courseSlug) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase!
    .from('learning_user_task_progress')
    .select('task_id, status')
    .eq('user_id', session.user.id)
    .eq('course_slug', courseSlug);

  if (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data || [] });
}
