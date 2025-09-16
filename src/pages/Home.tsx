import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Award, 
  Users, 
  AlertTriangle,
  Waves,
  Mountain,
  Wind,
  Flame,
  ArrowRight,
  Shield,
  Target,
  CheckCircle
} from 'lucide-react';

export const Home = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Learning',
      description: 'Engaging modules covering all major disaster types with NDMA guidelines'
    },
    {
      icon: Award,
      title: 'Gamified Experience',
      description: 'Earn points, badges, and certificates as you complete modules'
    },
    {
      icon: Users,
      title: 'Multi-user Support',
      description: 'Student and teacher dashboards with progress tracking'
    },
    {
      icon: AlertTriangle,
      title: 'Real-time Alerts',
      description: 'Stay informed with emergency notifications and updates'
    }
  ];

  const disasters = [
    { icon: Waves, name: t('floods'), color: 'bg-blue-100 text-blue-700' },
    { icon: Mountain, name: t('earthquakes'), color: 'bg-orange-100 text-orange-700' },
    { icon: Wind, name: t('cyclones'), color: 'bg-purple-100 text-purple-700' },
    { icon: Flame, name: t('fires'), color: 'bg-red-100 text-red-700' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* NDMA Official Badge */}
            <div className="inline-flex items-center space-x-3 mb-8 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">National Disaster Management Authority</span>
              <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-white/30">
                Official Platform
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t('welcomeTitle')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t('welcomeSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 shadow-lg group"
                >
                  <span>{t('startLearning')}</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Free Access</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Offline Support</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Multilingual</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disaster Types Quick Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learn About Key Disasters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive modules covering India's most common natural disasters
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {disasters.map((disaster, index) => {
              const Icon = disaster.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow group cursor-pointer shadow-card">
                  <CardContent className="pt-8 pb-6">
                    <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${disaster.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg">{disaster.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed specifically for Indian educational institutions following NDMA protocols
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 shadow-card group">
                  <CardHeader>
                    <div className="gradient-primary mx-auto mb-4 h-14 w-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students and educators building disaster resilience
            </p>
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                Explore Learning Modules
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};