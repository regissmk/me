import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Progress } from '@/components/ui/progress';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-1/4">
            <p className="text-center mb-4">Carregando...</p>
            <Progress value={50} className="w-full" />
        </div>
      </div>
    );
  }

  if (user) {
    return children;
  }

  return null;
};

export default ProtectedRoute;