import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import FinancialTransactionForm from '@/components/admin/FinancialTransactionForm';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AccountsPayablePage = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        clients(parent_name),
        suppliers(name),
        financial_categories(name),
        accounts(name)
      `)
      .eq('type', 'expense')
      .order('due_date', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar contas a pagar', description: error.message });
    } else {
      setTransactions(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    setLoading(true);
    const { error } = await supabase.from('financial_transactions').delete().eq('id', transactionId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar transação', description: error.message });
    } else {
      toast({ title: '🗑️ Transação deletada!' });
      fetchTransactions();
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      case 'paid': return <Badge variant="success">Pago</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Contas a Pagar | Financeiro</title>
        <meta name="description" content="Gerencie suas contas a pagar." />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-4"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
          <Button onClick={handleNewTransaction}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Despesas</CardTitle>
              <CardDescription>Visualize todas as suas contas a pagar.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Destinatário</TableHead> {/* Changed from Cliente */}
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan="8" className="text-center">Carregando contas a pagar...</TableCell></TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow><TableCell colSpan="8" className="text-center">Nenhuma conta a pagar encontrada.</TableCell></TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.description || 'N/A'}</TableCell>
                        <TableCell>{transaction.clients?.parent_name || transaction.suppliers?.name || 'N/A'}</TableCell> {/* Display client or supplier name */}
                        <TableCell>{transaction.financial_categories?.name || 'N/A'}</TableCell>
                        <TableCell>{transaction.accounts?.name || 'N/A'}</TableCell>
                        <TableCell>{format(new Date(transaction.due_date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita e irá deletar a transação permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Ajuste os detalhes da despesa.' : 'Registre uma nova despesa para sua empresa.'}
            </DialogDescription>
          </DialogHeader>
          <FinancialTransactionForm
            editingTransaction={editingTransaction}
            onSuccess={() => {
              setIsFormOpen(false);
              fetchTransactions();
            }}
            onCancel={() => setIsFormOpen(false)}
            defaultType="expense"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountsPayablePage;