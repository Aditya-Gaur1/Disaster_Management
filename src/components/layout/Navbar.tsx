import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Menu, Globe, Shield, BookOpen, BarChart3, User, LogOut, LogIn, AlertTriangle, Gamepad2 } from 'lucide-react';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const navigation = [
    { name: t('home'), href: '/', icon: Shield },
    ...(user ? [
      { name: t('modules'), href: '/modules', icon: BookOpen },
      { name: 'Simulations', href: '/simulations', icon: Gamepad2 },
      { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
      { name: t('dashboard'), href: '/dashboard', icon: BarChart3 },
      { name: t('profile'), href: '/profile', icon: User },
    ] : [])
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-primary">NDMA</span>
              <span className="text-xs text-muted-foreground">Disaster Prep</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.href}>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Auth & Settings */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>{i18n.language === 'en' ? 'हिं' : 'EN'}</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/alerts" className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Alerts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.name} 
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start flex items-center space-x-3"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Button>
                      </Link>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={toggleLanguage}
                    className="w-full justify-start flex items-center space-x-3"
                  >
                    <Globe className="h-5 w-5" />
                    <span>{i18n.language === 'en' ? 'हिंदी में पढ़ें' : 'Read in English'}</span>
                  </Button>

                  {user ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full justify-start flex items-center space-x-3 text-destructive"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </Button>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-start flex items-center space-x-3"
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Sign In</span>
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};