import { notFound } from 'next/navigation';

import CourseHome from '@/features/learning/components/CourseHome';
import { getCourseBySlug } from '@/features/learning/data/catalog';

interface CoursePageProps {
  params: {
    courseSlug: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const course = getCourseBySlug(params.courseSlug);

  if (!course) {
    notFound();
  }

  return <CourseHome course={course} />;
}
