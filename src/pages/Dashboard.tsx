import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp,
  Clock,
  CheckCircle,
  Trophy,
  Users,
  AlertTriangle
} from 'lucide-react';
import modulesData from '@/data/modules.json';

export const Dashboard = () => {
  const { t } = useTranslation();
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
    const certs = JSON.parse(localStorage.getItem('certificates') || '[]');
    setCompletedModules(completed);
    setCertificates(certs);
  }, []);

  const totalModules = modulesData.modules.length;
  const completionRate = Math.round((completedModules.length / totalModules) * 100);
  const totalPoints = certificates.reduce((sum, cert) => sum + cert.score, 0);
  const averageScore = certificates.length > 0 
    ? Math.round(certificates.reduce((sum, cert) => sum + cert.percentage, 0) / certificates.length)
    : 0;

  const stats = [
    {
      title: 'Modules Completed',
      value: `${completedModules.length}/${totalModules}`,
      icon: BookOpen,
      color: 'gradient-primary'
    },
    {
      title: 'Total Points Earned',
      value: totalPoints.toLocaleString(),
      icon: Award,
      color: 'gradient-achievement'
    },
    {
      title: 'Average Quiz Score',
      value: `${averageScore}%`,
      icon: Target,
      color: 'gradient-success'
    },
    {
      title: 'Certificates Earned',
      value: certificates.length.toString(),
      icon: Trophy,
      color: 'gradient-alert'
    }
  ];

  const recentActivity = [
    { type: 'quiz', module: 'Floods', score: 85, date: '2024-01-15' },
    { type: 'complete', module: 'Earthquakes', date: '2024-01-14' },
    { type: 'start', module: 'Cyclones', date: '2024-01-13' }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Learning Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your disaster preparedness learning progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} h-12 w-12 rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Learning Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm text-muted-foreground">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                        {completedModules.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">
                        {totalModules - completedModules.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Remaining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Module Progress */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Module Status</CardTitle>
                <CardDescription>Your progress across all disaster preparedness modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modulesData.modules.map((module) => {
                    const isCompleted = completedModules.includes(module.id);
                    const certificate = certificates.find(c => c.moduleId === module.id);
                    
                    return (
                      <div key={module.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-success" />
                          ) : (
                            <Clock className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div>
                            <div className="font-medium">{module.title}</div>
                            <div className="text-sm text-muted-foreground">{module.difficulty} • {module.duration}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {certificate && (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              {certificate.percentage}%
                            </Badge>
                          )}
                          <Badge variant={isCompleted ? "default" : "secondary"}>
                            {isCompleted ? 'Completed' : 'Not Started'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certificates */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Certificates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert, index) => (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="font-medium text-sm">{cert.moduleTitle}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Score: {cert.percentage}% • {new Date(cert.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete modules to earn certificates</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Emergency Contacts</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Police: 100 • Fire: 101 • Ambulance: 108
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Study Groups</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect with other learners
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};