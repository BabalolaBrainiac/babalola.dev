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

  const { courseSlug, moduleId, labId, path, content } = await request.json();

  if (!courseSlug || !moduleId || !labId || !path) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase!
    .from('lab_code_saves')
    .upsert(
      {
        user_id: session.user.id,
        course_slug: courseSlug,
        module_id: moduleId,
        lab_id: labId,
        path,
        content,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,course_slug,module_id,lab_id,path' },
    );

  if (error) {
    console.error('Save code error:', error);
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
  const labId = searchParams.get('labId');

  if (!courseSlug || !moduleId || !labId) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await supabase!
    .from('lab_code_saves')
    .select('path, content')
    .eq('user_id', session.user.id)
    .eq('course_slug', courseSlug)
    .eq('module_id', moduleId)
    .eq('lab_id', labId);

  if (error) {
    console.error('Get code error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ files: data || [] });
}
