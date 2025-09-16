import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Trophy, Play } from 'lucide-react';

interface SimulationCardProps {
  id: string;
  title: string;
  description: string;
  disaster_type: string;
  estimatedDuration?: number;
  participantCount?: number;
  averageScore?: number;
  onStart: (id: string) => void;
}

const SimulationCard: React.FC<SimulationCardProps> = ({
  id,
  title,
  description,
  disaster_type,
  estimatedDuration = 5,
  participantCount = 0,
  averageScore = 0,
  onStart
}) => {
  const getDisasterTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'flood':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fire':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cyclone':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-l-4 border-l-primary hover:shadow-elegant transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{title}</CardTitle>
              <Badge className={getDisasterTypeColor(disaster_type)}>
                {disaster_type.charAt(0).toUpperCase() + disaster_type.slice(1)}
              </Badge>
            </div>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Play className="h-6 w-6 text-primary" />
            </motion.div>
          </div>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedDuration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{participantCount} completed</span>
            </div>
            {averageScore > 0 && (
              <div className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>{Math.round(averageScore)}% avg</span>
              </div>
            )}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => onStart(id)}
              className="w-full gradient-primary text-primary-foreground"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimulationCard;