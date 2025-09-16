-- Create disaster alerts table
CREATE TABLE public.disaster_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  disaster_type TEXT NOT NULL CHECK (disaster_type IN ('flood', 'earthquake', 'cyclone', 'fire', 'landslide', 'tsunami')),
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius_km INTEGER DEFAULT 10, -- Alert radius in kilometers
  alert_source TEXT DEFAULT 'NDMA',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.disaster_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (alerts should be visible to everyone)
CREATE POLICY "Anyone can view active alerts" 
ON public.disaster_alerts 
FOR SELECT 
USING (is_active = true);

-- Create user alert status table to track who has seen/acknowledged alerts
CREATE TABLE public.user_alert_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_id UUID NOT NULL REFERENCES public.disaster_alerts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('safe', 'need_help', 'acknowledged')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, alert_id)
);

-- Enable RLS
ALTER TABLE public.user_alert_status ENABLE ROW LEVEL SECURITY;

-- Create policies for user alert status
CREATE POLICY "Users can view their own alert status" 
ON public.user_alert_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert status" 
ON public.user_alert_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert status" 
ON public.user_alert_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on disaster_alerts
CREATE TRIGGER update_disaster_alerts_updated_at
BEFORE UPDATE ON public.disaster_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample alerts for testing
INSERT INTO public.disaster_alerts (title, description, severity, disaster_type, location_name, latitude, longitude, radius_km, expires_at) VALUES
('Heavy Rainfall Alert', 'Continuous heavy rainfall expected in the region for next 24 hours. Flood-like situation possible.', 'high', 'flood', 'Mumbai Metropolitan Region', 19.0760, 72.8777, 25, now() + interval '24 hours'),
('Earthquake Early Warning', 'Seismic activity detected. Magnitude 4.2 earthquake possible in the next few hours.', 'medium', 'earthquake', 'Delhi NCR', 28.7041, 77.1025, 50, now() + interval '6 hours'),
('Cyclone Warning', 'Cyclone Biparjoy approaching coastal areas. Wind speeds up to 120 kmph expected.', 'critical', 'cyclone', 'Gujarat Coast', 21.1702, 72.8311, 100, now() + interval '48 hours');