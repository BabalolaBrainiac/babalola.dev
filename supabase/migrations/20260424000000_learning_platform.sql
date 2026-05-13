-- Create learning_progress table
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Create learning_code_saves table
CREATE TABLE IF NOT EXISTS public.learning_code_saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    code_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Enable RLS
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_code_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_progress
CREATE POLICY "Users can view own progress" ON public.learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for learning_code_saves
CREATE POLICY "Users can view own code saves" ON public.learning_code_saves
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code saves" ON public.learning_code_saves
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own code saves" ON public.learning_code_saves
    FOR UPDATE USING (auth.uid() = user_id);
