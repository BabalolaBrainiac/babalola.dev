-- Fix UUID/TEXT mismatch: blog_users.id is TEXT, not UUID.
-- All learning tables must use user_id TEXT to match.

-- Drop in dependency order (files → projects → others)
DROP TABLE IF EXISTS public.learning_project_files CASCADE;
DROP TABLE IF EXISTS public.learning_projects CASCADE;
DROP TABLE IF EXISTS public.learning_submissions CASCADE;
DROP TABLE IF EXISTS public.learning_notes CASCADE;
DROP TABLE IF EXISTS public.learning_user_task_progress CASCADE;
DROP TABLE IF EXISTS public.learning_sessions CASCADE;

-- Recreate with user_id TEXT

CREATE TABLE public.learning_user_task_progress (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    task_id     TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('not_started', 'completed')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, task_id)
);

CREATE TABLE public.learning_notes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    module_id   TEXT NOT NULL,
    note_type   TEXT NOT NULL CHECK (note_type IN ('notes', 'reflection')),
    content     TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_id, note_type)
);

CREATE TABLE public.learning_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT NOT NULL REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug   TEXT NOT NULL,
    ip_address    TEXT,
    user_agent    TEXT,
    device_label  TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, ip_address, user_agent)
);

CREATE TABLE public.learning_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug     TEXT NOT NULL,
    module_id       TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('quiz', 'lab', 'essay', 'checkpoint')),
    answer_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
    status          TEXT NOT NULL DEFAULT 'saved',
    score           NUMERIC,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_id, submission_type)
);

-- Enable RLS (service role bypasses it; kept for future direct-client use)
ALTER TABLE public.learning_user_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_notes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_submissions         ENABLE ROW LEVEL SECURITY;

CREATE INDEX learning_sessions_user_course_idx ON public.learning_sessions (user_id, course_slug);
