import { notFound } from 'next/navigation';

import LearningWorkspaceClient from '@/features/learning/components/LearningWorkspaceClient';
import { getCourseBySlug } from '@/features/learning/data/catalog';
import { getInitialLearningState, getModuleContext } from '@/features/learning/server';

interface ModulePageProps {
  params: {
    courseSlug: string;
    weekSlug: string;
    moduleSlug: string;
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const course = getCourseBySlug(params.courseSlug);
  const moduleContext = getModuleContext(params.courseSlug, params.weekSlug, params.moduleSlug);

  if (!course || !moduleContext) {
    notFound();
  }

  const initialState = await getInitialLearningState(params.courseSlug);

  return (
    <LearningWorkspaceClient
      key={`${params.weekSlug}:${params.moduleSlug}`}
      course={course}
      moduleContext={moduleContext}
      initialState={initialState}
    />
  );
}
