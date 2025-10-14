import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const FinancialPage = () => {
  const { toast } = useToast();

  const handleActionClick = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'A área financeira do cliente será implementada em breve! 🚀',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Helmet>
        <title>Financeiro | Cliente</title>
        <meta name="description" content="Visualize suas transações financeiras e pagamentos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Meu Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe seus pagamentos e histórico de transações.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Extrato de Pagamentos
              </CardTitle>
              <CardDescription>Seu histórico de pagamentos e faturas.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-muted-foreground">Nenhuma transação financeira encontrada.</p>
              <p className="text-sm text-muted-foreground mt-2">Seus pagamentos aparecerão aqui.</p>
              <Button className="mt-4" onClick={handleActionClick}>Ver Detalhes (Em Breve)</Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default FinancialPage;