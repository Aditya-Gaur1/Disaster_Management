import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Choice {
  id: string;
  text: string;
  nextStep: string;
  points: number;
  feedback: string;
}

interface SimulationStep {
  title: string;
  description: string;
  image?: string;
  choices: Choice[];
  isEnd?: boolean;
  finalScore?: boolean;
}

interface SimulationData {
  startStep: string;
  steps: Record<string, SimulationStep>;
}

interface SimulationPlayerProps {
  scenarioId: string;
  onExit: () => void;
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ scenarioId, onExit }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [scenario, setScenario] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [score, setScore] = useState(0);
  const [choicesMade, setChoicesMade] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    fetchScenario();
  }, [scenarioId]);

  const fetchScenario = async () => {
    try {
      const { data: scenarioData, error } = await supabase
        .from('simulation_scenarios')
        .select('*')
        .eq('id', scenarioId)
        .single();

      if (error) throw error;

      setScenario(scenarioData);
      setSimulationData(scenarioData.scenario_data as unknown as SimulationData);
      setCurrentStep((scenarioData.scenario_data as unknown as SimulationData).startStep);
      
      // Check for existing progress
      const { data: existingProgress } = await supabase
        .from('user_simulation_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('scenario_id', scenarioId)
        .eq('completed', false)
        .single();

      if (existingProgress) {
        setProgressId(existingProgress.id);
        setCurrentStep(existingProgress.current_step);
        setChoicesMade(existingProgress.choices_made as any[] || []);
        setScore(existingProgress.score || 0);
      } else {
        // Create new progress record
        const { data: newProgress, error: progressError } = await supabase
          .from('user_simulation_progress')
          .insert({
            user_id: user?.id,
            scenario_id: scenarioId,
            current_step: (scenarioData.scenario_data as unknown as SimulationData).startStep,
            choices_made: [],
            score: 0
          })
          .select()
          .single();

        if (progressError) throw progressError;
        setProgressId(newProgress.id);
      }

      calculateProgress();
    } catch (error) {
      console.error('Error fetching scenario:', error);
      toast({
        title: "Error",
        description: "Failed to load simulation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (!simulationData) return;
    const totalSteps = Object.keys(simulationData.steps).length;
    const currentStepIndex = Object.keys(simulationData.steps).indexOf(currentStep);
    setStepProgress(((currentStepIndex + 1) / totalSteps) * 100);
  };

  const handleChoice = async (choice: Choice) => {
    if (!user || !progressId || !simulationData) return;

    const newChoice = {
      stepId: currentStep,
      choiceId: choice.id,
      points: choice.points,
      timestamp: new Date().toISOString()
    };

    const newChoicesMade = [...choicesMade, newChoice];
    const newScore = score + choice.points;

    setChoicesMade(newChoicesMade);
    setScore(newScore);
    setLastChoice(choice);
    setShowFeedback(true);

    try {
      // Update progress in database
      const isCompleted = simulationData.steps[choice.nextStep]?.isEnd || false;
      
      await supabase
        .from('user_simulation_progress')
        .update({
          current_step: choice.nextStep,
          choices_made: newChoicesMade,
          score: newScore,
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('id', progressId);

      setTimeout(() => {
        setCurrentStep(choice.nextStep);
        setShowFeedback(false);
        setLastChoice(null);
        calculateProgress();
      }, 2000);

    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress.",
        variant: "destructive"
      });
    }
  };

  const restartSimulation = () => {
    if (!simulationData) return;
    
    setCurrentStep(simulationData.startStep);
    setScore(0);
    setChoicesMade([]);
    setShowFeedback(false);
    setLastChoice(null);
    calculateProgress();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <p>Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulationData || !scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Simulation not found</p>
      </div>
    );
  }

  const currentStepData = simulationData.steps[currentStep];
  
  if (!currentStepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid simulation step</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onExit}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="font-semibold">{scenario.title}</h1>
                <p className="text-sm text-muted-foreground">Score: {score} points</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={restartSimulation}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              <Badge variant="outline">
                {scenario.disaster_type.charAt(0).toUpperCase() + scenario.disaster_type.slice(1)}
              </Badge>
            </div>
          </div>
          <Progress value={stepProgress} className="mt-4" />
        </div>
      </div>

      {/* Simulation Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg mb-6 leading-relaxed"
                  >
                    {currentStepData.description}
                  </motion.p>

                  {currentStepData.isEnd ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">Simulation Complete!</h3>
                      <p className="text-xl mb-4">Final Score: {score} points</p>
                      <div className="flex justify-center space-x-4">
                        <Button onClick={restartSimulation} className="gradient-primary text-primary-foreground">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Try Again
                        </Button>
                        <Button variant="outline" onClick={onExit}>
                          View More Simulations
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      {currentStepData.choices.map((choice, index) => (
                        <motion.div
                          key={choice.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (index * 0.1) }}
                        >
                          <Button
                            variant="outline"
                            size="lg"
                            className="w-full text-left justify-start p-4 h-auto hover-scale"
                            onClick={() => handleChoice(choice)}
                            disabled={showFeedback}
                          >
                            <span className="text-wrap">{choice.text}</span>
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Feedback Modal */}
          <AnimatePresence>
            {showFeedback && lastChoice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        lastChoice.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {lastChoice.points > 0 ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Trophy className="h-6 w-6" />
                        )}
                      </div>
                      <h3 className="font-semibold mb-2">
                        {lastChoice.points > 0 ? 'Good Choice!' : 'Learn & Improve'}
                      </h3>
                      <p className="text-muted-foreground mb-4">{lastChoice.feedback}</p>
                      <Badge variant={lastChoice.points > 0 ? 'default' : 'destructive'}>
                        {lastChoice.points > 0 ? '+' : ''}{lastChoice.points} points
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SimulationPlayer;