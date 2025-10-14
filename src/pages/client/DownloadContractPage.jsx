import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const DownloadContractPage = () => {
  const { toast } = useToast();

  const handleActionClick = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'O download do contrato será implementado em breve! 🚀',
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
        <title>Baixar Contrato | Cliente</title>
        <meta name="description" content="Baixe uma cópia do seu contrato." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Baixar Contrato</h1>
          <p className="text-muted-foreground">Obtenha uma cópia digital do seu contrato.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Seu Contrato
              </CardTitle>
              <CardDescription>Faça o download do seu contrato assinado.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-muted-foreground">Nenhum contrato disponível para download.</p>
              <p className="text-sm text-muted-foreground mt-2">Seu contrato aparecerá aqui após a finalização.</p>
              <Button className="mt-4" onClick={handleActionClick}>Baixar Contrato (Em Breve)</Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default DownloadContractPage;