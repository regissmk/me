import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, Lock, Download } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button'; // NEW: Import Button
import { getFlaskBaseUrl } from '@/lib/utils'; // NEW: Import getFlaskBaseUrl

const GalleriesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientGalleries = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // First, get the client_id for the current user
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (clientError || !clientData) {
          throw new Error(clientError?.message || 'Client not found.');
        }

        const clientId = clientData.id;

        // Then, get all orders for this client
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select(`
            contract_id,
            order_items (
              plan_id,
              product_id
            )
          `)
          .eq('client_id', clientId);

        if (ordersError) throw ordersError;

        const contractIds = [...new Set((orders || []).map(order => order.contract_id).filter(Boolean))]; // Fixed: Ensure orders is an array
        const planIds = [...new Set((orders || []).flatMap(order => (order.order_items || []).map(item => item.plan_id)).filter(Boolean))]; // Fixed: Ensure orders and order.order_items are arrays

        let accessibleGalleries = [];

        if (contractIds.length > 0) {
          const { data: contractGalleries, error: contractGalleriesError } = await supabase
            .from('galleries')
            .select('id, name, tags, watermark_enabled, download_enabled')
            .in('contract_id', contractIds);
          if (contractGalleriesError) console.error('Error fetching contract galleries:', contractGalleriesError);
          else accessibleGalleries = [...accessibleGalleries, ...contractGalleries];
        }

        if (planIds.length > 0) {
          const { data: planLinkedGalleries, error: planLinkedGalleriesError } = await supabase
            .from('gallery_plans')
            .select(`
              galleries (id, name, tags, watermark_enabled, download_enabled)
            `)
            .in('plan_id', planIds);
          if (planLinkedGalleriesError) console.error('Error fetching plan-linked galleries:', planLinkedGalleriesError);
          else accessibleGalleries = [...accessibleGalleries, ...planLinkedGalleries.map(gp => gp.galleries)];
        }
        
        // Remove duplicates
        const uniqueGalleries = Array.from(new Map(accessibleGalleries.map(gallery => [gallery.id, gallery])).values());
        setGalleries(uniqueGalleries);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar galerias', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchClientGalleries();
  }, [user, toast]);

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
        <title>Minhas Galerias | Cliente</title>
        <meta name="description" content="Visualize suas galerias de fotos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Galerias</h1>
          <p className="text-muted-foreground">Explore as galerias de fotos disponíveis para você.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p>Carregando galerias...</p>
          ) : galleries.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="pt-6 text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">Nenhuma galeria disponível ainda.</p>
                <p className="text-sm text-muted-foreground mt-2">Suas galerias aparecerão aqui quando estiverem prontas.</p>
              </CardContent>
            </Card>
          ) : (
            galleries.map((gallery) => (
              <Card key={gallery.id} className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 flex items-end p-4">
                  <h3 className="text-xl font-bold text-white">{gallery.name}</h3>
                </div>
                {/* Placeholder for gallery cover image */}
                <img
                  src="https://via.placeholder.com/400x300?text=Gallery+Cover" // Replace with actual gallery cover image
                  alt={gallery.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {gallery.download_enabled ? (
                      <Download className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    <span>{gallery.download_enabled ? 'Download Liberado' : 'Download Restrito'}</span>
                  </div>
                  {/* NEW: Link to Flask Client Gallery Page */}
                  <Button variant="secondary" size="sm" onClick={() => window.location.href = `${getFlaskBaseUrl()}/dashboard/evento/${gallery.id}`}>
                    Ver Galeria
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default GalleriesPage;