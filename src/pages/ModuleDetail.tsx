import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuizCard } from '@/components/quiz/QuizCard';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Award, 
  Waves, 
  Mountain, 
  Wind, 
  Flame,
  PlayCircle,
  CheckCircle
} from 'lucide-react';
import modulesData from '@/data/modules.json';

export const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [moduleComplete, setModuleComplete] = useState(false);
  
  const module = modulesData.modules.find(m => m.id === moduleId);
  
  useEffect(() => {
    if (!module) {
      navigate('/modules');
    }
  }, [module, navigate]);

  const iconMap = {
    Waves,
    Mountain,
    Wind,
    Flame
  };

  if (!module) return null;

  const Icon = iconMap[module.icon as keyof typeof iconMap];
  const title = i18n.language === 'hi' ? module.titleHi : module.title;
  const description = i18n.language === 'hi' ? module.descriptionHi : module.description;
  
  const handleQuizComplete = (score: number, totalPoints: number) => {
    const percentage = (score / totalPoints) * 100;
    
    if (percentage >= 70) {
      // Mark module as completed
      const completedModules = JSON.parse(localStorage.getItem('completedModules') || '[]');
      if (!completedModules.includes(module.id)) {
        completedModules.push(module.id);
        localStorage.setItem('completedModules', JSON.stringify(completedModules));
      }
      
      // Store certificate data
      const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
      certificates.push({
        moduleId: module.id,
        moduleTitle: title,
        score,
        totalPoints,
        percentage: Math.round(percentage),
        completedAt: new Date().toISOString()
      });
      localStorage.setItem('certificates', JSON.stringify(certificates));
      
      setModuleComplete(true);
    }
  };

  const startQuiz = () => {
    setShowQuiz(true);
  };

  const nextSection = () => {
    if (currentSection < module.content.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      startQuiz();
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  if (showQuiz && !moduleComplete) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setShowQuiz(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {title} - Quiz
            </h1>
            <p className="text-muted-foreground">
              Test your knowledge to earn your certificate
            </p>
          </div>

          <QuizCard 
            questions={module.quiz} 
            onComplete={handleQuizComplete}
          />
        </div>
      </div>
    );
  }

  if (moduleComplete) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto shadow-card gradient-success text-success-foreground">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="mb-6">
                <CheckCircle className="h-20 w-20 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Module Completed!</h1>
                <p className="text-success-foreground/80 text-lg">
                  Congratulations on completing {title}
                </p>
              </div>
              
              <Badge variant="secondary" className="mb-6 bg-white/20 text-success-foreground border-white/30">
                🏆 Certificate Earned
              </Badge>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/modules')}
                  className="bg-white text-success hover:bg-white/90"
                >
                  Continue Learning
                </Button>
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setShowQuiz(false);
                      setModuleComplete(false);
                      setCurrentSection(0);
                    }}
                    className="text-success-foreground/80 hover:text-success-foreground"
                  >
                    Review Module Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentContent = module.content.sections[currentSection];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/modules')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="gradient-primary h-12 w-12 rounded-xl flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{module.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4" />
              <span>{module.points} points</span>
            </div>
            <Badge variant="secondary">
              Section {currentSection + 1} of {module.content.sections.length}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">{currentContent.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {currentContent.content}
                </p>
              </div>
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-2">
                  {module.content.sections.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-8 rounded-full ${
                        index === currentSection 
                          ? 'gradient-primary' 
                          : index < currentSection 
                          ? 'bg-success' 
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={nextSection}
                  className="gradient-primary text-primary-foreground"
                >
                  {currentSection === module.content.sections.length - 1 ? (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Quiz
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};