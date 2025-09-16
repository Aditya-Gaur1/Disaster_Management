import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const { updatePassword, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated via the reset link
    if (!searchParams.get('access_token') && !user) {
      navigate('/auth');
    }
  }, [searchParams, user, navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    setIsLoading(true);
    
    const { error } = await updatePassword(password);
    
    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="gradient-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6" />
                <span className="font-semibold">NDMA Learning Platform</span>
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                  Official
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="shadow-card text-center">
              <CardContent className="p-8">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Password Updated Successfully!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Your password has been updated. You'll be redirected to your dashboard shortly.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="gradient-primary text-primary-foreground"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">NDMA Learning Platform</span>
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                Official
              </Badge>
            </div>
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reset Password Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Set New Password
            </h1>
            <p className="text-muted-foreground">
              Enter your new password to complete the reset process
            </p>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Choose a strong password that you haven't used before
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full gradient-primary text-primary-foreground" 
                  disabled={isLoading || password !== confirmPassword || password.length < 6}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};