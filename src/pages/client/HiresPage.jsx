import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const HiresPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientHires = async () => {
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

        // Then, fetch orders for this client
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            contracts ( name ),
            order_items (
              plans ( name ),
              products ( name )
            )
          `)
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedHires = data.map(order => {
          const planItem = order.order_items.find(item => item.item_type === 'plan');
          const productItems = order.order_items.filter(item => item.item_type === 'product');
          
          const planName = planItem?.plans?.name || 'N/A';
          const productNames = productItems.map(item => item.products?.name).filter(Boolean).join(', ') || 'N/A';

          return {
            id: order.id,
            contractName: order.contracts?.name || 'Contrato Direto',
            items: planName !== 'N/A' ? planName : productNames,
            status: order.status,
            totalAmount: order.total_amount,
            hireDate: new Date(order.created_at).toLocaleDateString('pt-BR'),
          };
        });
        setHires(formattedHires);

      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar contratações', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchClientHires();
  }, [user, toast]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge variant="success">Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Minhas Contratações | Cliente</title>
        <meta name="description" content="Visualize suas contratações e pedidos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Contratações</h1>
          <p className="text-muted-foreground">Acompanhe seus contratos, planos e produtos adquiridos.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Histórico de Contratações
              </CardTitle>
              <CardDescription>Todos os seus pedidos e contratos com a Memory School Fotografia.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="5" className="text-center">Carregando contratações...</TableCell></TableRow>
                  ) : hires.length === 0 ? (
                    <TableRow><TableCell colSpan="5" className="text-center">Nenhuma contratação encontrada.</TableCell></TableRow>
                  ) : (
                    hires.map((hire) => (
                      <TableRow key={hire.id}>
                        <TableCell className="font-medium">{hire.contractName}</TableCell>
                        <TableCell>{hire.items}</TableCell>
                        <TableCell>{getStatusBadge(hire.status)}</TableCell>
                        <TableCell className="text-right font-mono">R$ {hire.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{hire.hireDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default HiresPage;