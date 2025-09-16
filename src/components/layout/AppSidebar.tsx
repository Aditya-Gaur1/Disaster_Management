import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  Shield, 
  BookOpen, 
  BarChart3, 
  User, 
  AlertTriangle, 
  Gamepad2,
  Megaphone,
  Trophy,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, roles: ['student', 'teacher', 'admin'] },
    { name: 'Learning Modules', href: '/modules', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
    { name: 'Quizzes', href: '/dashboard', icon: Trophy, roles: ['student', 'teacher', 'admin'] },
    { name: 'Simulations', href: '/simulations', icon: Gamepad2, roles: ['student', 'teacher', 'admin'] },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, roles: ['student', 'teacher', 'admin'] },
    { name: 'Broadcast Alert', href: '/broadcast', icon: Megaphone, roles: ['teacher', 'admin'] },
    { name: 'Leaderboard', href: '/leaderboards', icon: Trophy, roles: ['student', 'teacher', 'admin'] },
    { name: 'Profile', href: '/profile', icon: User, roles: ['student', 'teacher', 'admin'] },
  ];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  return (
    <Sidebar className={isCollapsed ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-3">
          <div className="gradient-primary flex h-10 w-10 items-center justify-center rounded-lg shrink-0">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-primary">NDMA</span>
              <span className="text-xs text-muted-foreground">Disaster Prep</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                // Show all items for now - role checking can be added later
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.href} 
                        end={item.href === '/'}
                        className={getNavCls}
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {!isCollapsed && user && (
            <Button variant="ghost" size="sm" onClick={signOut} className="flex-1">
              Sign Out
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}