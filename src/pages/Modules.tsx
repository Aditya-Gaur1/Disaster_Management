import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Waves, 
  Mountain, 
  Wind, 
  Flame,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';
import modulesData from '@/data/modules.json';

export const Modules = () => {
  const { t, i18n } = useTranslation();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  
  useEffect(() => {
    // Load completed modules from localStorage
    const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
    setCompletedModules(completed);
  }, []);

  const iconMap = {
    Waves,
    Mountain,
    Wind,
    Flame
  };

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-700',
    'Intermediate': 'bg-yellow-100 text-yellow-700',
    'Advanced': 'bg-red-100 text-red-700'
  };

  const calculateProgress = () => {
    return Math.round((completedModules.length / modulesData.modules.length) * 100);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Learning Modules
              </h1>
              <p className="text-lg text-muted-foreground">
                Master disaster preparedness with NDMA-approved content
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent mb-1">
                {completedModules.length}/{modulesData.modules.length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
          
          {/* Overall Progress */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{calculateProgress()}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {modulesData.modules.map((module) => {
            const Icon = iconMap[module.icon as keyof typeof iconMap];
            const isCompleted = completedModules.includes(module.id);
            const title = i18n.language === 'hi' ? module.titleHi : module.title;
            const description = i18n.language === 'hi' ? module.descriptionHi : module.description;
            
            return (
              <Card 
                key={module.id} 
                className={`hover:shadow-xl transition-all duration-300 shadow-card group ${
                  isCompleted ? 'ring-2 ring-success/20 bg-success/5' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`gradient-primary h-14 w-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      isCompleted ? 'gradient-success' : ''
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-7 w-7 text-success-foreground" />
                      ) : (
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        variant="secondary" 
                        className={difficultyColors[module.difficulty as keyof typeof difficultyColors]}
                      >
                        {module.difficulty}
                      </Badge>
                      {isCompleted && (
                        <Badge className="gradient-success text-success-foreground">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Module Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Award className="h-4 w-4" />
                      <span>{module.points} points</span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Link to={`/modules/${module.id}`} className="block">
                    <Button 
                      className={`w-full group ${
                        isCompleted 
                          ? 'gradient-success text-success-foreground' 
                          : 'gradient-primary text-primary-foreground'
                      }`}
                      size="lg"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {isCompleted ? (
                          <>
                            <BookOpen className="h-5 w-5" />
                            <span>Review Module</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            <span>Start Learning</span>
                          </>
                        )}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Achievement Section */}
        {completedModules.length > 0 && (
          <Card className="mt-12 shadow-card gradient-achievement text-achievement-foreground">
            <CardContent className="pt-8 text-center">
              <Award className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Great Progress!</h3>
              <p className="text-achievement-foreground/80 mb-4">
                You've completed {completedModules.length} module{completedModules.length > 1 ? 's' : ''}. 
                Keep learning to earn more certificates!
              </p>
              {completedModules.length === modulesData.modules.length && (
                <Badge variant="secondary" className="bg-white/20 text-achievement-foreground border-achievement-foreground/20">
                  🏆 All Modules Complete! Master Certificate Earned!
                </Badge>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};