-- Allow learner role in blog_users (if role column has a CHECK constraint)
ALTER TABLE public.blog_users
  DROP CONSTRAINT IF EXISTS blog_users_role_check;

ALTER TABLE public.blog_users
  ADD CONSTRAINT blog_users_role_check
  CHECK (role IN ('admin', 'contributor', 'learner'));

-- Ensure all learning tables reference blog_users correctly
-- (already done in v2 migration — this is a no-op safety check)
ALTER TABLE public.learning_notes
  DROP CONSTRAINT IF EXISTS learning_notes_user_id_fkey;

ALTER TABLE public.learning_notes
  ADD CONSTRAINT learning_notes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.blog_users(id) ON DELETE CASCADE;
