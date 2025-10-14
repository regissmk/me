import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, User, Users, Package, Image as ImageIcon, Phone, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientData, setClientData] = useState(null);
  const [children, setChildren] = useState([]);
  const [orders, setOrders] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch client profile (from 'profiles' and 'clients' tables)
        const { data: clientProfile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            first_name,
            last_name,
            clients (
              id,
              cpf,
              phone,
              email,
              parent_name
            )
          `)
          .eq('id', user.id)
          .single();

        if (profileError || !clientProfile || !clientProfile.clients) {
          throw new Error(profileError?.message || 'Client profile not found.');
        }
        setClientData({
          ...clientProfile.clients,
          first_name: clientProfile.first_name,
          last_name: clientProfile.last_name,
        });
        const clientId = clientProfile.clients.id;

        // Fetch children
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('client_id', clientId);
        if (childrenError) console.error('Error fetching children:', childrenError);
        else setChildren(childrenData || []);

        // Fetch orders and associated plans/products
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            created_at,
            contracts ( name ),
            order_items (
              item_type, // IMPORTANT: Ensure item_type is selected
              plans ( name, price ),
              products ( name, price )
            )
          `)
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });
        if (ordersError) console.error('Error fetching orders:', ordersError);
        else setOrders(ordersData || []);

        // Fetch accessible galleries
        const contractIds = [...new Set((ordersData || []).map(order => order.contracts?.id).filter(Boolean))]; // Fixed: Ensure ordersData is an array
        const planIds = [...new Set((ordersData || []).flatMap(order => (order.order_items || []).map(item => item.plan_id)).filter(Boolean) || [])]; // Fixed: Ensure ordersData and order.order_items are arrays

        let accessibleGalleries = [];

        if (contractIds.length > 0) {
          const { data: contractGalleries, error: contractGalleriesError } = await supabase
            .from('galleries')
            .select('id, name')
            .in('contract_id', contractIds);
          if (contractGalleriesError) console.error('Error fetching contract galleries:', contractGalleriesError);
          else accessibleGalleries = [...accessibleGalleries, ...contractGalleries];
        }

        if (planIds.length > 0) {
          const { data: planLinkedGalleries, error: planLinkedGalleriesError } = await supabase
            .from('gallery_plans')
            .select(`
              galleries (id, name)
            `)
            .in('plan_id', planIds);
          if (planLinkedGalleriesError) console.error('Error fetching plan-linked galleries:', planLinkedGalleriesError);
          else accessibleGalleries = [...accessibleGalleries, ...planLinkedGalleries.map(gp => gp.galleries)];
        }
        
        const uniqueGalleries = Array.from(new Map(accessibleGalleries.map(gallery => [gallery.id, gallery])).values());
        setGalleries(uniqueGalleries);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="text-center p-8">Carregando seu dashboard...</div>
    );
  }

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const activeOrder = orders.find(order => order.status === 'paid' || order.status === 'completed');

  return (
    <>
      <Helmet>
        <title>Dashboard | Cliente</title>
        <meta name="description" content="Visão geral da sua área de cliente." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo(a) à sua Área!</h1>
          <p className="text-muted-foreground">Aqui você pode gerenciar suas contratações e informações.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Meus Dados
                </CardTitle>
                <CardDescription>Suas informações pessoais e de contato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-semibold">Nome:</span> {clientData?.parent_name || 'N/A'}</p>
                <p><span className="font-semibold">CPF:</span> {clientData?.cpf || 'N/A'}</p>
                <p className="flex items-center gap-1"><Phone className="h-4 w-4" /><span className="font-semibold">Telefone:</span> {clientData?.phone || 'N/A'}</p>
                <p className="flex items-center gap-1"><Mail className="h-4 w-4" /><span className="font-semibold">Email:</span> {clientData?.email || 'N/A'}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Meus Filhos
                </CardTitle>
                <CardDescription>Informações sobre o(s) seu(s) filho(s) cadastrado(s).</CardDescription>
              </CardHeader>
              <CardContent>
                {children.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum filho cadastrado ainda.</p>
                ) : (
                  <ul className="space-y-3">
                    {children.map((child) => (
                      <li key={child.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md">
                        {child.profile_photo_url ? (
                          <img src={child.profile_photo_url} alt={child.name} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{child.name}</p>
                          <p className="text-sm text-muted-foreground">{child.school_course} - Nasc: {new Date(child.birth_date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Contratação Ativa
              </CardTitle>
              <CardDescription>Seu plano ou produtos adquiridos mais recentes.</CardDescription>
            </CardHeader>
            <CardContent>
              {activeOrder ? (
                <div className="space-y-4">
                  <p className="font-semibold">Contrato: {activeOrder.contracts?.name || 'N/A'} <Badge variant="secondary" className="ml-2">{activeOrder.status}</Badge></p>
                  <p className="text-sm text-muted-foreground">Data da Contratação: {new Date(activeOrder.created_at).toLocaleDateString('pt-BR')}</p>
                  <ul className="list-disc list-inside ml-4 text-sm text-muted-foreground">
                    {activeOrder.order_items.map((item, index) => (
                      <li key={index}>
                        {item.item_type === 'plan' ? item.plans?.name : item.products?.name} ({formatCurrency(item.plans?.price || item.products?.price || 0)})
                      </li>
                    ))}
                  </ul>
                  <p className="text-lg font-bold mt-4">Total: {formatCurrency(activeOrder.total_amount)}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhuma contratação ativa encontrada.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Galerias Disponíveis
              </CardTitle>
              <CardDescription>Galerias de fotos que você tem acesso.</CardDescription>
            </CardHeader>
            <CardContent>
              {galleries.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma galeria disponível ainda.</p>
              ) : (
                <ul className="list-disc list-inside ml-4 text-sm">
                  {galleries.map(gallery => (
                    <li key={gallery.id}>{gallery.name}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default DashboardPage;