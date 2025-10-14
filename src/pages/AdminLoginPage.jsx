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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AdminLoginPage = () => {
  const { toast } = useToast();
  const { signIn, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para o painel...',
      });
      // Use navigate with replace to prevent going back to login page
      navigate('/admin', { replace: true });
    } else {
       // Only set loading to false if there's an error
       setLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    setLoading(true);
    await resetPasswordForEmail(resetEmail);
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Acesso Admin | Sistema de Fotografia</title>
        <meta name="description" content="Acesso restrito para administradores do sistema." />
      </Helmet>
      <AuthLayout>
        <div className="grid gap-2 text-center">
          <Camera className="h-8 w-8 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Acesso Administrativo</h1>
          <p className="text-balance text-muted-foreground">
            Use suas credenciais para acessar o painel.
          </p>
        </div>
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
                <Label htmlFor="password">Senha</Label>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="ml-auto inline-block text-sm underline p-0 h-auto">
                        Esqueceu sua senha?
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Redefinir sua senha</AlertDialogTitle>
                      <AlertDialogDescription>
                        Digite seu e-mail abaixo. Se uma conta correspondente for encontrada, enviaremos um link para redefinir sua senha.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          disabled={loading}
                        />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePasswordReset} disabled={loading || !resetEmail} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:from-primary/90 hover:to-secondary/90">
                        {loading ? 'Enviando...' : 'Enviar Link'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
          Não é um administrador?{' '}
          <Link to="/login" className="underline font-semibold">
            Acessar área do cliente
          </Link>
        </div>
      </AuthLayout>
    </>
  );
};

export default AdminLoginPage;