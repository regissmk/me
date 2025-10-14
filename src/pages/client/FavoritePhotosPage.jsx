import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const FavoritePhotosPage = () => {
  const { toast } = useToast();

  const handleActionClick = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'A gestão de fotos favoritas será implementada em breve! 🚀',
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
        <title>Fotos Favoritas | Cliente</title>
        <meta name="description" content="Gerencie suas fotos favoritas." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Fotos Favoritas</h1>
          <p className="text-muted-foreground">Salve as fotos que você mais amou para fácil acesso.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Suas Escolhas
              </CardTitle>
              <CardDescription>Todas as fotos que você marcou como favoritas.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <p className="text-lg font-semibold text-muted-foreground">Nenhuma foto favorita ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">Marque suas fotos preferidas nas galerias para vê-las aqui.</p>
              <Button className="mt-4" onClick={handleActionClick}>Explorar Galerias</Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default FavoritePhotosPage;