-- Create tables for disaster risk insights and emergency check-in system

-- Historical disaster data for risk analysis
CREATE TABLE public.disaster_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disaster_type TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'high', 'severe')),
  affected_population INTEGER,
  economic_damage NUMERIC,
  event_date DATE NOT NULL,
  duration_days INTEGER,
  region TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk insights and recommendations
CREATE TABLE public.risk_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  disaster_type TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  priority_modules TEXT[] NOT NULL DEFAULT '{}',
  recommendations TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Emergency check-in status
CREATE TABLE public.emergency_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('safe', 'need_help', 'unknown')),
  message TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leaderboard system
CREATE TABLE public.user_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  completion_time INTEGER, -- in seconds
  attempts INTEGER NOT NULL DEFAULT 1,
  school_name TEXT,
  class_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User certifications and badges
CREATE TABLE public.user_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certification_type TEXT NOT NULL, -- 'bronze', 'silver', 'gold'
  module_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  percentage NUMERIC NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.disaster_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disaster_events (public read access)
CREATE POLICY "Anyone can view disaster events"
ON public.disaster_events
FOR SELECT
USING (true);

-- RLS Policies for risk_insights (public read access)
CREATE POLICY "Anyone can view risk insights"
ON public.risk_insights
FOR SELECT
USING (true);

-- RLS Policies for emergency_checkins
CREATE POLICY "Users can view their own checkins"
ON public.emergency_checkins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
ON public.emergency_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
ON public.emergency_checkins
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_scores
CREATE POLICY "Users can view their own scores"
ON public.user_scores
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
ON public.user_scores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
ON public.user_scores
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_certifications
CREATE POLICY "Users can view their own certifications"
ON public.user_certifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certifications"
ON public.user_certifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_risk_insights_updated_at
BEFORE UPDATE ON public.risk_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_checkins_updated_at
BEFORE UPDATE ON public.emergency_checkins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_scores_updated_at
BEFORE UPDATE ON public.user_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample disaster data
INSERT INTO public.disaster_events (disaster_type, location_name, latitude, longitude, severity, affected_population, economic_damage, event_date, duration_days, region, description) VALUES
('flood', 'Kerala', 10.8505, 76.2711, 'severe', 5400000, 20000000000, '2018-08-15', 15, 'South India', 'Devastating floods that affected 54 lakh people across Kerala'),
('cyclone', 'Odisha', 20.9517, 85.0985, 'severe', 3000000, 15000000000, '2019-05-03', 7, 'East India', 'Cyclone Fani caused massive destruction in Odisha'),
('earthquake', 'Gujarat', 23.0225, 72.5714, 'severe', 200000, 5000000000, '2001-01-26', 1, 'West India', 'Devastating earthquake in Bhuj, Gujarat'),
('flood', 'Assam', 26.2006, 92.9376, 'high', 2000000, 8000000000, '2020-07-15', 10, 'Northeast India', 'Annual monsoon floods affecting millions'),
('drought', 'Maharashtra', 19.7515, 75.7139, 'high', 4000000, 12000000000, '2019-06-01', 180, 'West India', 'Severe drought affecting agricultural regions'),
('landslide', 'Uttarakhand', 30.0668, 79.0193, 'moderate', 50000, 500000000, '2021-02-07', 3, 'North India', 'Landslides in mountainous regions'),
('heatwave', 'Rajasthan', 27.0238, 74.2179, 'high', 1500000, 2000000000, '2022-05-15', 21, 'North India', 'Extreme heat conditions affecting public health'),
('cyclone', 'Tamil Nadu', 11.1271, 78.6569, 'moderate', 800000, 3000000000, '2020-11-25', 5, 'South India', 'Cyclone Nivar impact on coastal regions');

-- Insert sample risk insights
INSERT INTO public.risk_insights (region, disaster_type, risk_level, priority_modules, recommendations, confidence_score) VALUES
('South India', 'flood', 'high', ARRAY['floods', 'evacuation'], 'Focus on flood preparedness, early warning systems, and evacuation procedures. Monsoon season requires heightened vigilance.', 0.85),
('East India', 'cyclone', 'critical', ARRAY['cyclones', 'coastal_safety'], 'Cyclone preparedness is critical. Learn about wind safety, storm surge protection, and emergency shelters.', 0.92),
('West India', 'earthquake', 'moderate', ARRAY['earthquakes', 'building_safety'], 'Earthquake preparedness important due to seismic activity. Focus on structural safety and drop-cover-hold techniques.', 0.78),
('Northeast India', 'flood', 'high', ARRAY['floods', 'landslides'], 'Annual flooding risks require comprehensive preparation. Include landslide awareness for hilly areas.', 0.88),
('North India', 'heatwave', 'high', ARRAY['heatwave', 'health_safety'], 'Extreme heat events increasing. Learn heat illness prevention and community cooling strategies.', 0.82);

-- Insert sample user certifications
INSERT INTO public.user_certifications (user_id, certification_type, module_id, score, percentage, earned_at) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'gold', 'floods', 95, 95.0, '2024-01-15 10:30:00'),
('123e4567-e89b-12d3-a456-426614174000', 'silver', 'earthquakes', 82, 82.0, '2024-01-10 14:20:00'),
('123e4567-e89b-12d3-a456-426614174000', 'bronze', 'cyclones', 75, 75.0, '2024-01-05 16:45:00');