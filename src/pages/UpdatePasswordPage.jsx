import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound } from 'lucide-react';

const UpdatePasswordPage = () => {
  const { updateUserPassword, session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This effect will run when the component mounts and the session is available.
    // It checks if the user is on this page as part of a password recovery flow.
    // If not, it redirects them.
    // We allow access if it's a recovery event OR if the user has never signed in, which accommodates invite links.
    if (session && session.user.last_sign_in_at && session.user.user_metadata?.event !== 'PASSWORD_RECOVERY') {
        setTimeout(() => {
             toast({
                variant: "destructive",
                title: "Acesso inválido",
                description: "Este link parece ter sido usado ou é inválido.",
            });
            navigate('/admin/login');
        }, 100);
    }
  }, [session, navigate, toast]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem!",
        description: "Por favor, verifique e tente novamente.",
      });
      return;
    }
    if(password.length < 6) {
        toast({
            variant: "destructive",
            title: "Senha muito curta",
            description: "A senha deve ter no mínimo 6 caracteres.",
        });
        return;
    }

    setLoading(true);
    const { error } = await updateUserPassword(password);
    if (!error) {
      navigate('/admin/login');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha | Sistema de Fotografia</title>
        <meta name="description" content="Crie uma nova senha para sua conta." />
      </Helmet>
      <AuthLayout>
        <div className="grid gap-2 text-center">
          <KeyRound className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Crie sua nova senha</h1>
          <p className="text-balance text-muted-foreground">
            Escolha uma senha forte e segura.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        </form>
      </AuthLayout>
    </>
  );
};

export default UpdatePasswordPage;