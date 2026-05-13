import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { LearningStatePayload } from '@/features/learning/types';
import { getCourseBySlug } from '@/features/learning/data/catalog';

interface SaveBody {
  courseSlug: string;
  state: LearningStatePayload;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = (await request.json()) as SaveBody;

    if (!body?.courseSlug || !body?.state) {
      return NextResponse.json({ error: 'courseSlug and state are required' }, { status: 400 });
    }

    if (!getCourseBySlug(body.courseSlug)) {
      return NextResponse.json({ error: 'Unknown course' }, { status: 404 });
    }

    if (!session?.user?.id || !supabase) {
      return NextResponse.json({ saved: false, mode: 'local' });
    }

    const userId = session.user.id;
    const { courseSlug, state } = body;

    const taskRows = Object.entries(state.taskProgress).map(([taskId, status]) => ({
      user_id: userId,
      course_slug: courseSlug,
      task_id: taskId,
      status,
    }));

    const noteRows = Object.entries(state.notesByModule)
      .filter(([, content]) => content.trim().length > 0)
      .map(([moduleId, content]) => ({
        user_id: userId,
        course_slug: courseSlug,
        module_id: moduleId,
        note_type: 'notes',
        content,
      }));

    const reflectionRows = Object.entries(state.reflectionsByModule)
      .filter(([, items]) => items.some((item) => item?.trim()))
      .map(([moduleId, items]) => ({
        user_id: userId,
        course_slug: courseSlug,
        module_id: moduleId,
        note_type: 'reflection',
        content: items.join('\n---\n'),
      }));

    const quizRows = Object.entries(state.quizAnswers)
      .filter(([, answer]) => answer.trim().length > 0)
      .map(([moduleId, answer]) => ({
        user_id: userId,
        course_slug: courseSlug,
        module_id: moduleId,
        submission_type: 'quiz',
        answer_json: { answer },
        status: 'saved',
      }));

    if (taskRows.length > 0) {
      const { error } = await supabase.from('learning_user_task_progress').upsert(taskRows, {
        onConflict: 'user_id,course_slug,task_id',
      });
      if (error) throw error;
    }

    const notesPayload = [...noteRows, ...reflectionRows];
    if (notesPayload.length > 0) {
      const { error } = await supabase.from('learning_notes').upsert(notesPayload, {
        onConflict: 'user_id,course_slug,module_id,note_type',
      });
      if (error) throw error;
    }

    if (quizRows.length > 0) {
      const { error } = await supabase.from('learning_submissions').upsert(quizRows, {
        onConflict: 'user_id,course_slug,module_id,submission_type',
      });
      if (error) throw error;
    }

    const projectEntries = Object.entries(state.projects);
    if (projectEntries.length > 0) {
      const projectRows = projectEntries.map(([slug, files]) => ({
        user_id: userId,
        course_slug: courseSlug,
        slug,
        title: slug,
        language: slug.includes('rust') ? 'rust' : 'python',
      }));

      const { data: projectsData, error: projectError } = await supabase
        .from('learning_projects')
        .upsert(projectRows, {
          onConflict: 'user_id,course_slug,slug',
        })
        .select('id,slug');

      if (projectError) throw projectError;

      const projectIdBySlug = Object.fromEntries(
        (projectsData ?? []).map((project) => [project.slug as string, project.id as string]),
      );

      const fileRows = projectEntries.flatMap(([slug, files]) =>
        Object.entries(files).map(([path, content]) => ({
          project_id: projectIdBySlug[slug],
          user_id: userId,
          course_slug: courseSlug,
          path,
          content,
        })),
      );

      if (fileRows.length > 0) {
        const { error } = await supabase.from('learning_project_files').upsert(fileRows, {
          onConflict: 'project_id,path',
        });
        if (error) throw error;
      }
    }

    return NextResponse.json({ saved: true, mode: 'remote' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save learning state' },
      { status: 500 },
    );
  }
}
