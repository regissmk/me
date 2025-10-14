import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCog, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const UsersPage = () => {
  const { toast } = useToast();

  const handleActionClick = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'A criação de novos usuários administradores será implementada em breve. Atualmente, usuários admin são configurados via código.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Usuários | Cadastros</title>
        <meta name="description" content="Gerencie os usuários do sistema." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Usuários do Sistema</h1>
          <Button onClick={handleActionClick} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:from-primary/90 hover:to-secondary/90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
        <Card className="rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Adicione e gerencie as pessoas autorizadas a acessar o painel administrativo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center py-16">
            <UserCog className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Nenhum usuário cadastrado</h3>
            <p className="text-muted-foreground mt-2">Comece adicionando um novo usuário do sistema.</p>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default UsersPage;