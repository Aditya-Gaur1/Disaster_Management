import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, Shield, Globe, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  if (!user) {
    // Public header for non-authenticated users
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary">NDMA</span>
                  <span className="text-xs text-muted-foreground">Disaster Prep</span>
                </div>
              </Link>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2"
                >
                  <Globe className="h-4 w-4" />
                  <span>{i18n.language === 'en' ? 'हिं' : 'EN'}</span>
                </Button>
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated layout with sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Minimal header for authenticated users */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>{i18n.language === 'en' ? 'हिं' : 'EN'}</span>
            </Button>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};