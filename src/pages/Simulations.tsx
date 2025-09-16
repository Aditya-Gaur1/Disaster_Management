import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import SimulationCard from '@/components/simulations/SimulationCard';
import SimulationPlayer from '@/components/simulations/SimulationPlayer';
import { Gamepad2, Clock, BarChart, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Scenario {
  id: string;
  title: string;
  description: string;
  disaster_type: string;
  scenario_data: any;
}

interface UserProgress {
  id: string;
  scenario_id: string;
  completed: boolean;
  score: number;
  started_at: string;
  completed_at: string | null;
}

const Simulations: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch scenarios
      const { data: scenariosData, error: scenariosError } = await supabase
        .from('simulation_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (scenariosError) throw scenariosError;
      setScenarios(scenariosData || []);

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_simulation_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (progressError) throw progressError;
      setUserProgress(progressData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load simulations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = (scenarioId: string) => {
    setActiveSimulation(scenarioId);
  };

  const handleExitSimulation = () => {
    setActiveSimulation(null);
    fetchData(); // Refresh data when exiting
  };

  const getScenarioProgress = (scenarioId: string) => {
    return userProgress.find(p => p.scenario_id === scenarioId);
  };

  const completedSimulations = scenarios.filter(scenario => 
    userProgress.some(progress => progress.scenario_id === scenario.id && progress.completed)
  );

  const availableSimulations = scenarios.filter(scenario => 
    !userProgress.some(progress => progress.scenario_id === scenario.id && progress.completed)
  );

  const inProgressSimulations = scenarios.filter(scenario => 
    userProgress.some(progress => progress.scenario_id === scenario.id && !progress.completed)
  );

  if (activeSimulation) {
    return (
      <SimulationPlayer 
        scenarioId={activeSimulation} 
        onExit={handleExitSimulation}
      />
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Disaster Simulations</h1>
            <p className="text-muted-foreground">Interactive scenarios to test your emergency response skills</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedSimulations.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{inProgressSimulations.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">
                  {completedSimulations.length > 0 
                    ? Math.round(userProgress.filter(p => p.completed).reduce((acc, p) => acc + p.score, 0) / completedSimulations.length)
                    : 0
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Simulation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="available">Available ({availableSimulations.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressSimulations.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSimulations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Start New Simulations</h2>
            {availableSimulations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Simulations Completed!</h3>
                  <p className="text-muted-foreground">You've completed all available simulations. Check back for new scenarios!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSimulations.map((scenario, index) => (
                  <motion.div
                    key={scenario.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SimulationCard
                      id={scenario.id}
                      title={scenario.title}
                      description={scenario.description}
                      disaster_type={scenario.disaster_type}
                      onStart={handleStartSimulation}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Continue Your Progress</h2>
            {inProgressSimulations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Simulations in Progress</h3>
                  <p className="text-muted-foreground">Start a new simulation to see your progress here.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('available')}
                  >
                    Browse Available Simulations
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressSimulations.map((scenario) => {
                  const progress = getScenarioProgress(scenario.id);
                  return (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <SimulationCard
                        id={scenario.id}
                        title={scenario.title}
                        description={scenario.description}
                        disaster_type={scenario.disaster_type}
                        onStart={handleStartSimulation}
                      />
                      {progress && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Current Score: {progress.score} points
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-4">Completed Simulations</h2>
            {completedSimulations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Simulations</h3>
                  <p className="text-muted-foreground">Complete simulations to track your achievements here.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('available')}
                  >
                    Start First Simulation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSimulations.map((scenario) => {
                  const progress = getScenarioProgress(scenario.id);
                  return (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="relative">
                        <SimulationCard
                          id={scenario.id}
                          title={scenario.title}
                          description={scenario.description}
                          disaster_type={scenario.disaster_type}
                          onStart={handleStartSimulation}
                        />
                        <Badge 
                          className="absolute top-2 right-2 bg-green-100 text-green-800"
                        >
                          Completed
                        </Badge>
                        {progress && (
                          <div className="mt-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Final Score:</span>
                              <span className="font-semibold">{progress.score} points</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Completed:</span>
                              <span className="text-sm">{new Date(progress.completed_at!).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Simulations;