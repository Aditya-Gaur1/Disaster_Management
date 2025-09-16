import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Camera, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  BookOpen, 
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, uploading, updateProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleEditToggle = () => {
    if (!editing) {
      setFullName(profile?.full_name || '');
    }
    setEditing(!editing);
  };

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName });
    setEditing(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    await uploadAvatar(file);
  };

  const getInitials = (name: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mockLearningStats = {
    modulesCompleted: 3,
    totalModules: 8,
    learningStreak: 7,
    totalPoints: 1250,
    achievements: [
      { name: 'First Steps', description: 'Completed your first module', icon: Trophy },
      { name: 'Quick Learner', description: '7-day learning streak', icon: Target },
      { name: 'Safety First', description: 'Completed earthquake preparedness', icon: Shield }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account and track your learning progress
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profile?.avatar_url || ''} 
                        alt={profile?.full_name || 'User avatar'} 
                      />
                      <AvatarFallback className="text-lg gradient-primary text-primary-foreground">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </div>
                  
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold">
                      {profile?.full_name || 'Anonymous User'}
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-1 justify-center sm:justify-start">
                      <Mail className="h-4 w-4" />
                      {user?.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-1">
                      <Calendar className="h-4 w-4" />
                      Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Edit Profile Form */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Full Name</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={editing ? handleSaveProfile : handleEditToggle}
                    >
                      {editing ? 'Save' : 'Edit'}
                    </Button>
                  </div>
                  
                  {editing ? (
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-md">
                      {profile?.full_name || 'No name set'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Learning Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">Modules Completed</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {mockLearningStats.modulesCompleted}/{mockLearningStats.totalModules}
                  </div>
                  <Progress 
                    value={(mockLearningStats.modulesCompleted / mockLearningStats.totalModules) * 100} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-success" />
                    <span className="font-medium">Learning Streak</span>
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {mockLearningStats.learningStreak} days
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Keep it up!</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-achievement" />
                    <span className="font-medium">Total Points</span>
                  </div>
                  <div className="text-2xl font-bold text-achievement">
                    {mockLearningStats.totalPoints.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Points earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your learning milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLearningStats.achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={index} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="gradient-achievement h-12 w-12 rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-achievement-foreground" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Email Address</Label>
                    <div className="p-3 bg-muted/50 rounded-md mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user?.email}
                      <Badge variant="secondary" className="ml-auto">Verified</Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Account Status</Label>
                    <div className="p-3 bg-muted/50 rounded-md mt-1 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Active Account
                      <Badge variant="outline" className="ml-auto">
                        NDMA Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="pt-4">
                  <h4 className="font-medium text-destructive mb-4">Danger Zone</h4>
                  <Button 
                    variant="destructive" 
                    onClick={signOut}
                    className="w-full sm:w-auto"
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};