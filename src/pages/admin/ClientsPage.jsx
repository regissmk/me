import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ClientsPage = () => {
    const { toast } = useToast();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    id,
                    parent_name,
                    email,
                    created_at,
                    orders (
                        status,
                        contracts ( name ),
                        order_items ( plans ( name ) )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                toast({ variant: 'destructive', title: 'Erro ao buscar clientes', description: error.message });
            } else {
                setClients(data);
            }
            setLoading(false);
        };
        fetchClients();
    }, [toast]);
    
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
    };
    
    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
    };

    const handleActionClick = () => {
        toast({
            title: '🚧 Funcionalidade em construção!',
            description: 'Você poderá solicitar esta implementação em breve! 🚀',
        });
    }

    const getClientContractAndPlan = (client) => {
        const lastOrder = client.orders?.[0];
        if (!lastOrder) return { contract: 'N/A', plan: 'N/A', status: 'Inativo' };
        
        const contractName = lastOrder.contracts?.name || 'Contrato Direto';
        const planItem = lastOrder.order_items.find(item => item.item_type === 'plan');
        const planName = planItem?.plans?.name || 'Produtos Avulsos';
        
        let status = 'Pendente';
        if (lastOrder.status === 'paid' || lastOrder.status === 'completed') {
            status = 'Ativo';
        } else if (lastOrder.status === 'cancelled') {
            status = 'Inativo';
        }

        return { contract: contractName, plan: planName, status };
    };

  return (
    <>
      <Helmet>
        <title>Gestão de Clientes | Admin</title>
        <meta name="description" content="Visualize e gerencie todos os clientes cadastrados." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Todos os Clientes</CardTitle>
                    <CardDescription>
                        Lista de todos os pais e responsáveis que se cadastraram no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead className="hidden md:table-cell">Contrato</TableHead>
                                <TableHead className="hidden lg:table-cell">Plano</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Data de Cadastro</TableHead>
                                <TableHead>
                                    <span className="sr-only">Ações</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan="6" className="text-center">Carregando clientes...</TableCell></TableRow>
                            ) : clients.length === 0 ? (
                                <TableRow><TableCell colSpan="6" className="text-center">Nenhum cliente cadastrado.</TableCell></TableRow>
                            ) : (
                                clients.map((client) => {
                                    const { contract, plan, status } = getClientContractAndPlan(client);
                                    return (
                                        <TableRow key={client.id}>
                                            <TableCell>
                                                <div className="font-medium">{client.parent_name}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">{client.email}</div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{contract}</TableCell>
                                            <TableCell className="hidden lg:table-cell">{plan}</TableCell>
                                            <TableCell>
                                                <Badge variant={status === 'Ativo' ? 'default' : status === 'Pendente' ? 'secondary' : 'destructive'}>
                                                    {status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{new Date(client.created_at).toLocaleDateString('pt-BR')}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={handleActionClick}>Ver Detalhes</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleActionClick}>Editar</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={handleActionClick} className="text-destructive">Excluir</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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

export default ClientsPage;