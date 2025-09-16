import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'student' | 'teacher' | 'admin' | null;

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchUserRole = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          // Default to student if no role found
          setRole('student');
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('student');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  };

  const canBroadcast = (): boolean => {
    return hasRole(['teacher', 'admin']);
  };

  return {
    role,
    loading,
    hasRole,
    canBroadcast,
    isStudent: role === 'student',
    isTeacher: role === 'teacher',
    isAdmin: role === 'admin',
  };
};