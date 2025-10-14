import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const HiresPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHires = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                status,
                clients ( parent_name ),
                contracts ( name ),
                order_items ( plans ( name ) )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao buscar contratações', description: error.message });
        } else {
            const formattedData = data.map(order => {
                const planItem = order.order_items.find(item => item.item_type === 'plan');
                return {
                    id: order.id,
                    parentName: order.clients?.parent_name || 'Cliente não encontrado',
                    contractName: order.contracts?.name || 'Contrato Direto',
                    planName: planItem?.plans?.name || 'Produtos Avulsos',
                    status: order.status,
                    hireDate: new Date(order.created_at).toLocaleDateString('pt-BR'),
                };
            });
            setHires(formattedData);
        }
        setLoading(false);
    };
    fetchHires();
  }, [toast]);

  const handleActionClick = (message) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: message || 'Você poderá solicitar esta implementação em breve! 🚀',
    });
  };

  const handleViewDetails = (hireId) => {
    // This should navigate to a new order detail page, not hire detail page.
    // For now, let's point to the financial orders page as a placeholder.
    navigate(`/admin/financial/orders?orderId=${hireId}`);
    toast({ title: "Navegando para detalhes do pedido..." });
  };

  // NEW: Function to handle viewing client details
  const handleViewClient = (clientName) => {
    toast({
        title: '🚧 Funcionalidade em construção!',
        description: `A página de detalhes para o cliente "${clientName}" será implementada em breve.`,
    });
    navigate('/admin/clients'); // Navigate to the general clients list
  };

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
  }

  return (
    <>
      <Helmet>
        <title>Contratações | Admin</title>
        <meta name="description" content="Visualize todas as contratações feitas pelos clientes." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Contratações</h1>
          <Button onClick={() => handleActionClick('A exportação para CSV será implementada aqui.')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Contratações</CardTitle>
              <CardDescription>
                Aqui estão todas as contratações (pedidos) realizadas a partir dos cadastros dos pais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="hidden md:table-cell">Contrato</TableHead>
                    <TableHead className="hidden lg:table-cell">Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Data</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                      <TableRow><TableCell colSpan="6" className="text-center">Carregando...</TableCell></TableRow>
                  ) : hires.length === 0 ? (
                      <TableRow><TableCell colSpan="6" className="text-center">Nenhuma contratação encontrada.</TableCell></TableRow>
                  ) : (
                      hires.map((hire) => (
                        <TableRow key={hire.id} className="cursor-pointer" onClick={() => handleViewDetails(hire.id)}>
                          <TableCell>
                            <div className="font-medium">{hire.parentName}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{hire.contractName}</TableCell>
                          <TableCell className="hidden lg:table-cell">{hire.planName}</TableCell>
                          <TableCell>{getStatusBadge(hire.status)}</TableCell>
                          <TableCell className="hidden sm:table-cell">{hire.hireDate}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(hire.id); }}>Ver Detalhes do Pedido</DropdownMenuItem>
                                {/* NEW: View Client option */}
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewClient(hire.parentName); }}>Ver Cliente</DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleActionClick(); }}>Editar Contratação</DropdownMenuItem>
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

export default HiresPage;