import { notFound } from 'next/navigation';

import LearningWorkspaceClient from '@/features/learning/components/LearningWorkspaceClient';
import { getCourseBySlug } from '@/features/learning/data/catalog';
import { getInitialLearningState, getProjectInitialFiles } from '@/features/learning/server';
import { getProjectTemplate } from '@/features/learning/data/catalog';

interface ProjectPageProps {
  params: {
    courseSlug: string;
    projectSlug: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const course = getCourseBySlug(params.courseSlug);
  const projectTemplate = getProjectTemplate(params.courseSlug, params.projectSlug);

  if (!course || !projectTemplate) {
    notFound();
  }

  const initialState = await getInitialLearningState(params.courseSlug);
  const hydratedProject = getProjectInitialFiles(
    params.courseSlug,
    params.projectSlug,
    initialState.projects[params.projectSlug],
  );

  return (
    <LearningWorkspaceClient
      course={course}
      projectTemplate={{ ...projectTemplate, files: hydratedProject }}
      initialState={initialState}
    />
  );
}
