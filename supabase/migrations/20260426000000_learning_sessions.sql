CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    device_label TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, ip_address, user_agent)
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning sessions" ON public.learning_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" ON public.learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning sessions" ON public.learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS learning_sessions_user_course_idx
    ON public.learning_sessions (user_id, course_slug);
