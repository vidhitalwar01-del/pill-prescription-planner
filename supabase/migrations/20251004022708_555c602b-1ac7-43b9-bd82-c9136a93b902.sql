-- Create user_settings table for theme, guardian email, and coins
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT DEFAULT 'dark',
  guardian_email TEXT,
  med_coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create wellness_goals table
CREATE TABLE public.wellness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  coin_reward INTEGER DEFAULT 10,
  goal_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default wellness goals
INSERT INTO public.wellness_goals (title, description, icon, coin_reward, goal_type) VALUES
  ('Hydration Hero', 'Drink 8 glasses of water today', '💧', 10, 'hydration'),
  ('Breath & Relax', 'Take 5 minutes for deep breathing', '🌬️', 10, 'breathing'),
  ('Step Counter', 'Walk 3,000 steps today', '🚶', 15, 'steps'),
  ('Mindful Moment', 'Practice 10 minutes of meditation', '🧘', 15, 'meditation'),
  ('Healthy Eating', 'Eat 3 servings of fruits/vegetables', '🥗', 10, 'nutrition');

-- Enable RLS for wellness_goals (public read)
ALTER TABLE public.wellness_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wellness goals" 
ON public.wellness_goals 
FOR SELECT 
USING (true);

-- Create user_wellness_completions table
CREATE TABLE public.user_wellness_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.wellness_goals(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_id, completed_date)
);

-- Enable RLS
ALTER TABLE public.user_wellness_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own completions" 
ON public.user_wellness_completions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions" 
ON public.user_wellness_completions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at on user_settings
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();