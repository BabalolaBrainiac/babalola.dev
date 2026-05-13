export type LearningTaskType =
  | 'reading'
  | 'notes'
  | 'coding'
  | 'reflection'
  | 'quiz'
  | 'project'
  | 'writing';

export type ModuleKind = 'day' | 'weekend' | 'project' | 'assessment';

export type ValidationMode = 'python_output' | 'source_contains' | 'manual';

export interface ReferenceItem {
  title: string;
  author?: string;
  kind: 'paper' | 'book' | 'blog' | 'docs';
  url?: string;
  required?: boolean;
  note?: string;
}

export interface LearningTask {
  id: string;
  label: string;
  type: LearningTaskType;
  required?: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface VirtualFileTemplate {
  path: string;
  language: string;
  content: string;
  readOnly?: boolean;
  solution?: string;
}

export interface ValidationConfig {
  mode: ValidationMode;
  target?: string;
  patterns?: string[];
  successMessage: string;
}

export interface LabDefinition {
  id: string;
  title: string;
  objective: string;
  language: 'python' | 'rust' | 'markdown' | 'text';
  files: VirtualFileTemplate[];
  hints: string[];
  validation: ValidationConfig;
}

export interface LearningModule {
  id: string;
  slug: string;
  kind: ModuleKind;
  title: string;
  durationLabel: string;
  schedule: string[];
  summary: string;
  narrative: string;
  outcomes: string[];
  tasks: LearningTask[];
  quiz?: QuizQuestion[];
  labs?: LabDefinition[];
  reflectionPrompts: string[];
  deliverables: string[];
  references: ReferenceItem[];
}

export interface LearningWeek {
  id: string;
  slug: string;
  title: string;
  theme: string;
  summary: string;
  commitment: string;
  outputs: string[];
  modules: LearningModule[];
}

export interface ProjectTemplate {
  slug: string;
  title: string;
  description: string;
  language: 'python' | 'rust';
  files: VirtualFileTemplate[];
  validation: ValidationConfig;
  downloadName: string;
}

export interface WeeklyBriefing {
  weekOf: string;
  title: string;
  summary: string;
  bullets: string[];
}

export interface LearningCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  focus: string[];
  description: string;
  audience: string[];
  principles: string[];
  weeks: LearningWeek[];
  projects: ProjectTemplate[];
  briefings: WeeklyBriefing[];
}

export interface FlattenedModule {
  course: LearningCourse;
  week: LearningWeek;
  module: LearningModule;
  index: number;
  total: number;
  previous?: {
    weekSlug: string;
    moduleSlug: string;
  };
  next?: {
    weekSlug: string;
    moduleSlug: string;
  };
}

export type TaskStatus = 'not_started' | 'completed';

export interface LearningStatePayload {
  taskProgress: Record<string, TaskStatus>;
  notesByModule: Record<string, string>;
  reflectionsByModule: Record<string, string[]>;
  quizAnswers: Record<string, string>;
  activeProjectSlug?: string;
  projects: Record<string, Record<string, string>>;
}
