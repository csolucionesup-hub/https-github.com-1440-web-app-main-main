-- 1440 App Initial Schema

-- Profiles: User settings and totals
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    sleep_minutes INTEGER DEFAULT 480,
    routine_minutes INTEGER DEFAULT 180,
    stars INTEGER DEFAULT 0,
    medals INTEGER DEFAULT 0,
    trophies INTEGER DEFAULT 0,
    total_minutes_invested INTEGER DEFAULT 0,
    unlocked_ids TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Goals: The high-level north
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    status TEXT DEFAULT 'pending', -- active, paused, pending, completed
    priority TEXT DEFAULT 'medium',
    color TEXT DEFAULT '#06b6d4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Objectives: Measuring progress for a goal
CREATE TABLE IF NOT EXISTS public.objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    goal_id UUID REFERENCES public.goals ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Projects: Grouping related tasks
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    objective_id UUID REFERENCES public.objectives ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks: Actionable items (Action Plan)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    period TEXT DEFAULT 'daily',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activities: Daily execution blocks
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks ON DELETE CASCADE, -- Optional link to tactical tasks
    objective_id UUID REFERENCES public.objectives ON DELETE CASCADE, -- direct link if needed
    title TEXT NOT NULL,
    planned_minutes INTEGER DEFAULT 0,
    executed_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Minutes: Snapshots for analytics
CREATE TABLE IF NOT EXISTS public.daily_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    total_planned INTEGER DEFAULT 0,
    total_executed INTEGER DEFAULT 0,
    sleep_minutes INTEGER DEFAULT 0,
    routine_minutes INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
);

-- Time Logs: Atomic execution units
CREATE TABLE IF NOT EXISTS public.time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities ON DELETE CASCADE NOT NULL,
    minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY SETTINGS --

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_minutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies
CREATE POLICY "Users can only see their own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only see their own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own objectives" ON public.objectives FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own daily snapshots" ON public.daily_minutes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own time logs" ON public.time_logs FOR ALL USING (auth.uid() = user_id);
