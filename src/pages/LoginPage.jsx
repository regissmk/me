import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'Você poderá solicitar a implementação do login em breve! 🚀',
    });
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <>
      <Helmet>
        <title>Login | Sistema de Fotografia Escolar</title>
        <meta name="description" content="Acesse sua conta ou cadastre-se para visualizar as fotos." />
      </Helmet>
      <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
        <div className="flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto grid w-[350px] gap-6"
          >
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
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    to="#"
                    onClick={() => toast({ title: '🚧 Em breve!' })}
                    className="ml-auto inline-block text-sm underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <button type="button" onClick={handleRegister} className="underline font-semibold">
                Cadastre-se
              </button>
            </div>
            <div className="mt-2 text-center text-sm">
              É um administrador?{" "}
              <Link to="/admin" className="underline font-semibold">
                Acessar painel
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="hidden bg-muted lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-slate-900/80" />
          <img 
            className="h-full w-full object-cover"
            alt="Imagem de apresentação de uma empresa de fotografia escolar"
           src="https://images.unsplash.com/photo-1652285374663-d06ce650028a" />
        </div>
      </div>
    </>
  );
};

export default LoginPage;