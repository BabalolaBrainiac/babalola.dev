import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getFlattenedModule, getProjectTemplate } from '@/features/learning/data/catalog';
import { LearningStatePayload, VirtualFileTemplate } from '@/features/learning/types';
import { getDefaultModuleRoute, getModuleRoute, getProjectRoute } from '@/features/learning/paths';

const emptyState: LearningStatePayload = {
  taskProgress: {},
  notesByModule: {},
  reflectionsByModule: {},
  quizAnswers: {},
  projects: {},
};

export async function getLearningSession() {
  return getServerSession(authOptions);
}

export async function getInitialLearningState(courseSlug: string) {
  const session = await getLearningSession();

  if (!session?.user?.id || !supabase) {
    return emptyState;
  }

  const [progressResult, notesResult, reflectionsResult, answersResult, projectsResult, projectFilesResult] =
    await Promise.all([
      supabase
        .from('learning_user_task_progress')
        .select('task_id,status')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug),
      supabase
        .from('learning_notes')
        .select('module_id,content')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug)
        .eq('note_type', 'notes'),
      supabase
        .from('learning_notes')
        .select('module_id,content')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug)
        .eq('note_type', 'reflection'),
      supabase
        .from('learning_submissions')
        .select('module_id,answer_json')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug)
        .eq('submission_type', 'quiz'),
      supabase
        .from('learning_projects')
        .select('id,slug')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug),
      supabase
        .from('learning_project_files')
        .select('project_id,path,content')
        .eq('user_id', session.user.id)
        .eq('course_slug', courseSlug),
    ]);

  const taskProgress = Object.fromEntries(
    (progressResult.data ?? []).map((row) => [row.task_id as string, row.status as 'completed' | 'not_started']),
  );

  const notesByModule = Object.fromEntries(
    (notesResult.data ?? []).map((row) => [row.module_id as string, row.content as string]),
  );

  const reflectionsByModule = Object.fromEntries(
    (reflectionsResult.data ?? []).map((row) => {
      const text = row.content as string;
      return [row.module_id as string, text ? text.split('\n---\n') : []];
    }),
  );

  const quizAnswers = Object.fromEntries(
    (answersResult.data ?? []).map((row) => {
      const parsed =
        typeof row.answer_json === 'object' && row.answer_json !== null
          ? (row.answer_json as Record<string, string>)
          : {};
      return [row.module_id as string, parsed.answer ?? ''];
    }),
  );

  const projectSlugById = Object.fromEntries(
    (projectsResult.data ?? []).map((project) => [project.id as string, project.slug as string]),
  );

  const projects: Record<string, Record<string, string>> = {};
  for (const row of projectFilesResult.data ?? []) {
    const slug = projectSlugById[row.project_id as string];
    if (!slug) continue;
    projects[slug] = projects[slug] ?? {};
    projects[slug][row.path as string] = row.content as string;
  }

  return {
    taskProgress,
    notesByModule,
    reflectionsByModule,
    quizAnswers,
    projects,
  } satisfies LearningStatePayload;
}

export function getProjectInitialFiles(
  courseSlug: string,
  projectSlug: string,
  persistedFiles?: Record<string, string>,
): VirtualFileTemplate[] {
  const template = getProjectTemplate(courseSlug, projectSlug);
  if (!template) return [];

  return template.files.map((file) => ({
    ...file,
    content: persistedFiles?.[file.path] ?? file.content,
  }));
}

export function getModuleContext(courseSlug: string, weekSlug: string, moduleSlug: string) {
  return getFlattenedModule(courseSlug, weekSlug, moduleSlug);
}

export { getDefaultModuleRoute, getModuleRoute, getProjectRoute };
