import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthLayout from '@/layouts/AuthLayout';

const ClientLoginPage = () => {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para sua área...',
      });
      navigate('/client/dashboard', { replace: true }); // Redirect to client dashboard
    }
    setLoading(false);
  };

  // Removed handleRegister and the "Cadastre-se" button as per the new rule.

  return (
    <>
      <Helmet>
        <title>Login | Sistema de Fotografia Escolar</title>
        <meta name="description" content="Acesse sua conta ou cadastre-se para visualizar as fotos." />
      </Helmet>
      <AuthLayout>
        <div className="grid gap-2 text-center">
          <Camera className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Bem-vindo(a)!</h1>
          <p className="text-balance text-muted-foreground">
            Acesse sua conta para ver os momentos especiais.
          </p>
        </div>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Senha</Label>
              <Link
                to="#"
                onClick={() => toast({ title: '🚧 Em breve!', description: "A recuperação de senha será implementada em breve." })}
                className="ml-auto inline-block text-sm underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:from-primary/90 hover:to-secondary/90" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          É um administrador?{" "}
          <Link to="/admin/login" className="underline font-semibold">
            Acessar painel
          </Link>
        </div>
      </AuthLayout>
    </>
  );
};

export default ClientLoginPage;