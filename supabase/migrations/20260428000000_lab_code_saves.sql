-- Dedicated table for per-user lab code saves.
-- Simpler than the existing learning_projects schema: no UUID FK chain needed.
CREATE TABLE IF NOT EXISTS public.lab_code_saves (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        TEXT    NOT NULL REFERENCES public.blog_users(id) ON DELETE CASCADE,
    course_slug    TEXT    NOT NULL,
    module_id      TEXT    NOT NULL,
    lab_id         TEXT    NOT NULL,
    path           TEXT    NOT NULL,
    content        TEXT    NOT NULL DEFAULT '',
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_slug, module_id, lab_id, path)
);

ALTER TABLE public.lab_code_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lab code saves" ON public.lab_code_saves
    FOR SELECT USING (user_id = (SELECT id FROM public.blog_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' LIMIT 1));
CREATE POLICY "Users can insert own lab code saves" ON public.lab_code_saves
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM public.blog_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' LIMIT 1));
CREATE POLICY "Users can update own lab code saves" ON public.lab_code_saves
    FOR UPDATE USING (user_id = (SELECT id FROM public.blog_users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' LIMIT 1));
