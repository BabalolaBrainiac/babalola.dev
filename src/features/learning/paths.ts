import { getCourseBySlug } from '@/features/learning/data/catalog';

export function getDefaultModuleRoute(courseSlug: string) {
  const course = getCourseBySlug(courseSlug);
  const firstWeek = course?.weeks[0];
  const firstModule = firstWeek?.modules[0];

  if (!course || !firstWeek || !firstModule) {
    return '/learning';
  }

  return `/learning/${course.slug}/${firstWeek.slug}/${firstModule.slug}`;
}

export function getModuleRoute(courseSlug: string, weekSlug: string, moduleSlug: string) {
  return `/learning/${courseSlug}/${weekSlug}/${moduleSlug}`;
}

export function getProjectRoute(courseSlug: string, projectSlug: string) {
  return `/learning/${courseSlug}/projects/${projectSlug}`;
}
