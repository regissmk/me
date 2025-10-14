import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const MyOrderPage = () => {
  const { toast } = useToast();

  const handleActionClick = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'A visualização do seu pedido será implementada em breve! 🚀',
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
        <title>Meu Pedido | Cliente</title>
        <meta name="description" content="Visualize os detalhes do seu pedido atual." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Meu Pedido</h1>
          <p className="text-muted-foreground">Acompanhe o status e os detalhes do seu pedido.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Detalhes do Pedido
              </CardTitle>
              <CardDescription>Informações sobre o seu pedido mais recente.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-muted-foreground">Nenhum pedido ativo encontrado.</p>
              <p className="text-sm text-muted-foreground mt-2">Seu pedido aparecerá aqui após a finalização da compra.</p>
              <Button className="mt-4" onClick={handleActionClick}>Ver Histórico de Pedidos (Em Breve)</Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default MyOrderPage;