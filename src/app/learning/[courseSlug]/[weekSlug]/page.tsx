import { notFound } from 'next/navigation';

import WeekOverview from '@/features/learning/components/WeekOverview';
import { getCourseBySlug, getWeekBySlug } from '@/features/learning/data/catalog';

interface WeekPageProps {
  params: {
    courseSlug: string;
    weekSlug: string;
  };
}

export default function WeekPage({ params }: WeekPageProps) {
  const course = getCourseBySlug(params.courseSlug);
  const week = getWeekBySlug(params.courseSlug, params.weekSlug);

  if (!course || !week) {
    notFound();
  }

  return <WeekOverview course={course} week={week} />;
}
