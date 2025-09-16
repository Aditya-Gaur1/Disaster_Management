import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Star, TrendingUp, Users, School, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import modulesData from '@/data/modules.json';

interface UserScore {
  id: string;
  user_id: string;
  module_id: string;
  score: number;
  max_score: number;
  completion_time?: number;
  attempts: number;
  school_name?: string;
  class_name?: string;
  created_at: string;
}

interface UserCertification {
  id: string;
  user_id: string;
  certification_type: 'bronze' | 'silver' | 'gold';
  module_id: string;
  score: number;
  percentage: number;
  earned_at: string;
}

interface LeaderboardEntry {
  user_id: string;
  total_score: number;
  total_modules: number;
  average_score: number;
  certifications: UserCertification[];
  school_name?: string;
  class_name?: string;
}

const certificationColors = {
  bronze: 'gradient-achievement',
  silver: 'bg-gray-400',
  gold: 'gradient-alert'
};

const certificationIcons = {
  bronze: Medal,
  silver: Award,
  gold: Trophy
};

export const Leaderboards = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<UserScore[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scoresResult, certificationsResult] = await Promise.all([
        supabase.from('user_scores').select('*').order('score', { ascending: false }),
        supabase.from('user_certifications').select('*').order('earned_at', { ascending: false })
      ]);

      if (scoresResult.error) throw scoresResult.error;
      if (certificationsResult.error) throw certificationsResult.error;

      const scoresData = scoresResult.data || [];
      const certificationsData = certificationsResult.data || [];

      setScores(scoresData);
      setCertifications(certificationsData as UserCertification[]);
      
      // Generate leaderboard
      generateLeaderboard(scoresData, certificationsData as UserCertification[]);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLeaderboard = (scoresData: UserScore[], certificationsData: UserCertification[]) => {
    const userStats = scoresData.reduce((acc, score) => {
      if (!acc[score.user_id]) {
        acc[score.user_id] = {
          user_id: score.user_id,
          total_score: 0,
          total_modules: 0,
          scores: [],
          school_name: score.school_name,
          class_name: score.class_name
        };
      }
      
      acc[score.user_id].total_score += score.score;
      acc[score.user_id].total_modules += 1;
      acc[score.user_id].scores.push(score);
      
      return acc;
    }, {} as any);

    const leaderboardEntries: LeaderboardEntry[] = Object.values(userStats).map((entry: any) => ({
      user_id: entry.user_id,
      total_score: entry.total_score,
      total_modules: entry.total_modules,
      average_score: entry.total_modules > 0 ? Math.round(entry.total_score / entry.total_modules) : 0,
      certifications: certificationsData.filter(cert => cert.user_id === entry.user_id),
      school_name: entry.school_name,
      class_name: entry.class_name
    }));

    leaderboardEntries.sort((a, b) => b.total_score - a.total_score);
    setLeaderboard(leaderboardEntries);
  };

  const filteredScores = scores.filter(score => {
    const matchesModule = selectedModule === 'all' || score.module_id === selectedModule;
    const matchesSchool = selectedSchool === 'all' || score.school_name === selectedSchool;
    return matchesModule && matchesSchool;
  });

  const filteredLeaderboard = leaderboard.filter(entry => {
    const matchesSchool = selectedSchool === 'all' || entry.school_name === selectedSchool;
    return matchesSchool;
  });

  const schools = [...new Set(scores.map(s => s.school_name).filter(Boolean))];
  const userRank = filteredLeaderboard.findIndex(entry => entry.user_id === user?.id) + 1;
  const userEntry = filteredLeaderboard.find(entry => entry.user_id === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="h-5 w-5 flex items-center justify-center text-xs font-bold">{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            School Leaderboards
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and compete with fellow students
          </p>
        </div>

        {/* User Stats */}
        {user && userEntry && (
          <Card className="mb-8 shadow-card border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
                    #{userRank || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold">Your Ranking</h3>
                    <p className="text-sm text-muted-foreground">
                      {userEntry.total_score} points • {userEntry.certifications.length} certificates
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userEntry.average_score}%</div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8 shadow-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Module</label>
                <Select value={selectedModule} onValueChange={setSelectedModule}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Modules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modulesData.modules.map(module => (
                      <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">School</label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schools.map(school => (
                      <SelectItem key={school} value={school!}>{school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overall" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="modules">By Module</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="overall">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Overall Leaderboard</span>
                </CardTitle>
                <CardDescription>Top performers across all modules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeaderboard.slice(0, 20).map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={entry.user_id}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border',
                          entry.user_id === user?.id && 'border-primary bg-primary/5'
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(rank)}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>U{rank}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Student {entry.user_id.slice(-4)}</div>
                            <div className="text-sm text-muted-foreground">
                              {entry.school_name && (
                                <span className="flex items-center">
                                  <School className="h-3 w-3 mr-1" />
                                  {entry.school_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{entry.total_score} pts</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.total_modules} modules • {entry.average_score}% avg
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Module Rankings</span>
                </CardTitle>
                <CardDescription>Best scores for selected module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredScores.slice(0, 15).map((score, index) => (
                    <div
                      key={score.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg bg-muted/50',
                        score.user_id === user?.id && 'border border-primary bg-primary/5'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-bold w-6">#{index + 1}</div>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">U</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {modulesData.modules.find(m => m.id === score.module_id)?.title || score.module_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {score.completion_time && (
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {Math.round(score.completion_time / 60)}min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{score.score}/{score.max_score}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((score.score / score.max_score) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <div className="grid gap-6">
              {/* Certificate Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(certificationColors).map(([type, colorClass]) => {
                  const count = certifications.filter(cert => cert.certification_type === type).length;
                  const Icon = certificationIcons[type as keyof typeof certificationIcons];
                  return (
                    <Card key={type} className="shadow-card">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className={`${colorClass} h-12 w-12 rounded-lg flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground capitalize">{type} Certificates</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Recent Certificates */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Recent Certifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {certifications.slice(0, 10).map((cert) => {
                      const Icon = certificationIcons[cert.certification_type];
                      return (
                        <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center space-x-3">
                            <div className={`${certificationColors[cert.certification_type]} h-8 w-8 rounded-full flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {modulesData.modules.find(m => m.id === cert.module_id)?.title || cert.module_id}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(cert.earned_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            className={cn(
                              'capitalize',
                              cert.certification_type === 'gold' && 'gradient-alert text-white',
                              cert.certification_type === 'silver' && 'bg-gray-400 text-white',
                              cert.certification_type === 'bronze' && 'gradient-achievement text-white'
                            )}
                          >
                            {cert.certification_type} • {cert.percentage}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};