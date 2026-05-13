import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { courseSlug, moduleId, noteType, content } = await request.json();

  if (!courseSlug || !moduleId || !noteType) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase!.from('learning_notes').upsert(
    {
      user_id: session.user.id,
      course_slug: courseSlug,
      module_id: moduleId,
      note_type: noteType,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,course_slug,module_id,note_type' }
  );

  if (error) {
    console.error('Save notes error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 500 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get('courseSlug');
  const moduleId = searchParams.get('moduleId');

  if (!courseSlug || !moduleId) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase!
    .from('learning_notes')
    .select('note_type, content')
    .eq('user_id', session.user.id)
    .eq('course_slug', courseSlug)
    .eq('module_id', moduleId);

  if (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const notes = data?.find((n) => n.note_type === 'notes')?.content || '';
  const reflection = data?.find((n) => n.note_type === 'reflection')?.content || '';

  return NextResponse.json({ notes, reflection });
}
