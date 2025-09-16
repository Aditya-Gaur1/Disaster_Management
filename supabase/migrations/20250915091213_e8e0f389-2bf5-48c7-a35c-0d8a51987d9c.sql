-- Create table for simulation scenarios
CREATE TABLE public.simulation_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  disaster_type TEXT NOT NULL,
  scenario_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user simulation progress
CREATE TABLE public.user_simulation_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_id UUID NOT NULL REFERENCES public.simulation_scenarios(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL,
  choices_made JSONB NOT NULL DEFAULT '[]',
  completed BOOLEAN NOT NULL DEFAULT false,
  score INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_simulation_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for simulation_scenarios (public read)
CREATE POLICY "Anyone can view scenarios" 
ON public.simulation_scenarios 
FOR SELECT 
USING (true);

-- Create policies for user_simulation_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_simulation_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_simulation_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_simulation_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_simulation_scenarios_updated_at
BEFORE UPDATE ON public.simulation_scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_simulation_progress_updated_at
BEFORE UPDATE ON public.user_simulation_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample earthquake scenario
INSERT INTO public.simulation_scenarios (title, description, disaster_type, scenario_data)
VALUES (
  'Urban Earthquake Response',
  'Navigate through a 6.5 magnitude earthquake in an urban setting and make critical survival decisions.',
  'earthquake',
  '{
    "startStep": "initial_shake",
    "steps": {
      "initial_shake": {
        "title": "The Ground Starts Shaking",
        "description": "You''re in a busy office building on the 5th floor when suddenly the ground begins to shake violently. Papers are falling, and colleagues are panicking.",
        "image": "earthquake-office.jpg",
        "choices": [
          {
            "id": "drop_cover_hold",
            "text": "Drop, Cover, and Hold On under your desk",
            "nextStep": "under_desk",
            "points": 10,
            "feedback": "Excellent! This is the correct response during an earthquake."
          },
          {
            "id": "run_outside",
            "text": "Run outside immediately",
            "nextStep": "running_outside",
            "points": -5,
            "feedback": "Dangerous! Running during shaking increases injury risk."
          },
          {
            "id": "stand_doorway",
            "text": "Stand in a doorway",
            "nextStep": "doorway_choice",
            "points": 2,
            "feedback": "Outdated advice. Modern doorways aren''t necessarily safer."
          }
        ]
      },
      "under_desk": {
        "title": "Taking Cover",
        "description": "You''ve taken cover under your desk. The shaking continues for about 60 seconds, then stops. You can hear car alarms and people shouting outside.",
        "choices": [
          {
            "id": "stay_put",
            "text": "Stay under the desk for a few more minutes",
            "nextStep": "aftershock_safe",
            "points": 8,
            "feedback": "Smart! Aftershocks are common after major earthquakes."
          },
          {
            "id": "check_others",
            "text": "Immediately get up to help injured colleagues",
            "nextStep": "help_others",
            "points": 5,
            "feedback": "Helpful, but ensure your own safety first."
          }
        ]
      },
      "running_outside": {
        "title": "Dangerous Choice",
        "description": "As you run toward the stairwell, you trip over fallen debris and twist your ankle. The shaking has stopped, but you''re now injured.",
        "choices": [
          {
            "id": "call_help",
            "text": "Call for help from colleagues",
            "nextStep": "rescued",
            "points": 3,
            "feedback": "Good thinking to seek help when injured."
          },
          {
            "id": "crawl_out",
            "text": "Try to crawl outside on your own",
            "nextStep": "further_injury",
            "points": -3,
            "feedback": "This could worsen your injury. Better to wait for help."
          }
        ]
      },
      "aftershock_safe": {
        "title": "Aftershock Preparedness",
        "description": "After waiting safely, you emerge to find the office in disarray but structurally sound. You need to evacuate the building.",
        "choices": [
          {
            "id": "use_stairs",
            "text": "Use the emergency stairs",
            "nextStep": "safe_evacuation",
            "points": 10,
            "feedback": "Perfect! Never use elevators after an earthquake."
          },
          {
            "id": "use_elevator",
            "text": "Take the elevator - it seems to be working",
            "nextStep": "elevator_trap",
            "points": -10,
            "feedback": "Very dangerous! Elevators can fail after earthquakes."
          }
        ]
      },
      "safe_evacuation": {
        "title": "Successfully Evacuated",
        "description": "You''ve safely evacuated the building using the stairs. Outside, emergency responders are arriving. You''ve completed the simulation successfully!",
        "choices": [],
        "isEnd": true,
        "finalScore": true
      }
    }
  }'
);

-- Insert sample flood scenario
INSERT INTO public.simulation_scenarios (title, description, disaster_type, scenario_data)
VALUES (
  'Flash Flood Emergency',
  'Experience a sudden flash flood while driving and learn proper emergency responses.',
  'flood',
  '{
    "startStep": "driving_rain",
    "steps": {
      "driving_rain": {
        "title": "Heavy Rain While Driving",
        "description": "You''re driving home from work when heavy rain starts. The road ahead is starting to flood, and water is rising quickly.",
        "choices": [
          {
            "id": "turn_around",
            "text": "Turn around and find an alternate route",
            "nextStep": "safe_detour",
            "points": 10,
            "feedback": "Excellent! Turn Around, Don''t Drown - the safest choice."
          },
          {
            "id": "drive_through",
            "text": "The water doesn''t look too deep - drive through carefully",
            "nextStep": "car_stalled",
            "points": -8,
            "feedback": "Dangerous! Just 6 inches of water can sweep a car away."
          },
          {
            "id": "wait_roadside",
            "text": "Pull over and wait for the water to recede",
            "nextStep": "roadside_wait",
            "points": 7,
            "feedback": "Good choice to wait, but be careful of your location."
          }
        ]
      },
      "safe_detour": {
        "title": "Smart Detour",
        "description": "You''ve found a safe alternate route on higher ground. You arrive home safely and help your neighbors prepare for potential flooding.",
        "choices": [],
        "isEnd": true,
        "finalScore": true
      },
      "car_stalled": {
        "title": "Vehicle Compromised",
        "description": "Your car stalled in the rising water. The engine is flooded and water is entering the cabin. You need to act quickly!",
        "choices": [
          {
            "id": "abandon_car",
            "text": "Abandon the car and move to higher ground",
            "nextStep": "escape_success",
            "points": 8,
            "feedback": "Right choice! Cars can be replaced, lives cannot."
          },
          {
            "id": "stay_in_car",
            "text": "Stay in the car and call for rescue",
            "nextStep": "water_rising",
            "points": -5,
            "feedback": "Risky! The car could be swept away or submerged."
          }
        ]
      }
    }
  }'
);