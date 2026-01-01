-- LifeCompass Database Schema
-- Supports: User profiles, multi-year reflections, multiple periods per year, mode upgrading

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'cosmic' CHECK (theme IN ('cosmic', 'calm', 'minimal', 'sunset')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reflections (supports multiple per year with different periods)
CREATE TABLE reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  period TEXT NOT NULL DEFAULT 'year_end' CHECK (period IN ('q1', 'mid_year', 'year_end')),
  period_label TEXT,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'ok', 'deep')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  upgraded_from UUID REFERENCES reflections(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses (individual question answers)
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reflection_id UUID NOT NULL REFERENCES reflections(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reflection_id, question_id)
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Indexes for performance
CREATE INDEX idx_reflections_user_id ON reflections(user_id);
CREATE INDEX idx_reflections_year ON reflections(year);
CREATE INDEX idx_reflections_user_year ON reflections(user_id, year);
CREATE INDEX idx_responses_reflection_id ON responses(reflection_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own reflections"
  ON reflections FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own responses"
  ON responses FOR ALL
  USING (reflection_id IN (SELECT id FROM reflections WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own achievements"
  ON achievements FOR ALL
  USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
