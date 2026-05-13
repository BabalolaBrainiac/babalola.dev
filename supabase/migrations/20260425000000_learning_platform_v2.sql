CREATE TABLE IF NOT EXISTS public.learning_user_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    task_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, task_id)
);

CREATE TABLE IF NOT EXISTS public.learning_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    module_id TEXT NOT NULL,
    note_type TEXT NOT NULL CHECK (note_type IN ('notes', 'reflection')),
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_id, note_type)
);

CREATE TABLE IF NOT EXISTS public.learning_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    module_id TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('quiz', 'lab', 'essay', 'checkpoint')),
    answer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'saved',
    score NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_id, submission_type)
);

CREATE TABLE IF NOT EXISTS public.learning_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    language TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, slug)
);

CREATE TABLE IF NOT EXISTS public.learning_project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.learning_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    path TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, path)
);

ALTER TABLE public.learning_user_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning task progress" ON public.learning_user_task_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning task progress" ON public.learning_user_task_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning task progress" ON public.learning_user_task_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning notes" ON public.learning_notes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning notes" ON public.learning_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning notes" ON public.learning_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning submissions" ON public.learning_submissions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning submissions" ON public.learning_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning submissions" ON public.learning_submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning projects" ON public.learning_projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning projects" ON public.learning_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning projects" ON public.learning_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning project files" ON public.learning_project_files
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning project files" ON public.learning_project_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning project files" ON public.learning_project_files
    FOR UPDATE USING (auth.uid() = user_id);
