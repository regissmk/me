import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Filter, MoreHorizontal, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const OrdersPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          clients ( parent_name ),
          contracts ( name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar pedidos', description: error.message });
      } else {
        setOrders(data);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [toast]);

  const handleActionClick = (message) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: message || 'Você poderá solicitar esta implementação em breve! 🚀',
    });
  };

  const handleViewDetails = (orderId) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: `Detalhes do pedido ${orderId} serão exibidos em breve.`,
    });
    // In a real app, you might navigate to a specific order detail page.
    // For now, we'll just show a toast.
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <title>Pedidos | Financeiro</title>
        <meta name="description" content="Visualize todos os pedidos realizados no sistema." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <Button onClick={() => handleActionClick('Filtros avançados para pedidos.')}>
                <Filter className="w-4 h-4 mr-2"/>
                Filtrar Pedidos
            </Button>
        </div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pedidos</CardTitle>
              <CardDescription>
                Lista de todos os pedidos realizados pelos clientes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Contrato</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="6" className="text-center">Carregando pedidos...</TableCell></TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow><TableCell colSpan="6" className="text-center">Nenhum pedido encontrado.</TableCell></TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.clients.parent_name}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{order.contracts?.name || 'N/A'}</TableCell>
                        <TableCell className="hidden sm:table-cell">{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right font-mono">R$ {order.total_amount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menu de ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
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

export default OrdersPage;