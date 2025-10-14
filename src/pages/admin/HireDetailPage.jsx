import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Home, ChevronRight, DollarSign, Package as PackageIcon, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CancellationDialog from '@/components/admin/CancellationDialog';

const mockHireData = {
  'hire_001': {
    parentName: 'REGINALDO MARIA LUIZA MATEUS SAPAIO SILVA',
    cpf: '101.766.124-32',
    phone: '(71) 99717-4672',
    contractName: 'GURILANDIA 2025',
    course: 'ABC',
    planName: 'REGISTRO FOTOGRÁFICO',
    planPrice: 0.00,
    totalToReceive: 0.00,
    totalToPay: 0.00,
    transactions: [
      {
        gateway: 'N/A',
        operation: 'Recebimento',
        orderId: '32573',
        type: 'Pedido',
        reference: '09/2025',
        dueDate: '03/09/2025',
        value: 0.00,
        status: 'Baixado',
      },
    ],
    products: [],
  },
};

const HireDetailPage = () => {
  const { hireId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCancellationOpen, setCancellationOpen] = useState(false);
  const data = mockHireData[hireId] || mockHireData['hire_001'];

  const handleActionClick = (message) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: message || 'Você poderá solicitar esta implementação em breve! 🚀',
    });
  };

  const handleAccessClientArea = () => {
    toast({
      title: 'Redirecionando...',
      description: 'Acessando a área do cliente.',
    });
    navigate('/login');
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
        <title>Detalhes da Contratação | Admin</title>
        <meta name="description" content={`Detalhes da contratação de ${data.parentName}`} />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Link to="/admin" className="hover:text-primary"><Home className="h-4 w-4" /></Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/admin/hires" className="hover:text-primary">Contratações</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Detalhes</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Contratações</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAccessClientArea}>Acessar</Button>
            <Button variant="destructive" onClick={() => setCancellationOpen(true)}>Cancelamento</Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Dados da Contratação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between rounded-lg bg-muted/50 p-6">
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{data.parentName}</p>
                  <p className="text-sm text-muted-foreground">CPF: {data.cpf}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium bg-green-100 px-2 py-1 rounded">{data.phone}</span>
                  </div>
                  <p className="text-sm"><span className="font-semibold">Contrato:</span> {data.contractName}</p>
                  <p className="text-sm"><span className="font-semibold">Curso:</span> {data.course}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">Plano:</span> {data.planName} (R$ {data.planPrice.toFixed(2)})
                    <Button size="sm" variant="outline" onClick={() => handleActionClick('A migração de plano será implementada.')}>Migrar plano</Button>
                  </div>
                </div>
                <div className="text-lg md:text-2xl font-bold mt-4 md:mt-0">
                  R$ {data.totalToReceive.toFixed(2)}
                </div>
              </div>
              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between items-center">
                  <p>Total a receber:</p>
                  <p className="font-semibold">R$ {data.totalToReceive.toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Total a pagar:</p>
                  <p className="font-semibold">R$ {data.totalToPay.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Lançamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trans. de Gateway</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((tx, index) => (
                    <TableRow key={index}>
                      <TableCell>{tx.gateway}</TableCell>
                      <TableCell>{tx.operation}</TableCell>
                      <TableCell>{tx.orderId}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.reference}</TableCell>
                      <TableCell>{tx.dueDate}</TableCell>
                      <TableCell>R$ {tx.value.toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{tx.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PackageIcon className="w-5 h-5" /> Produtos Contratados</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
              {data.products.length > 0 ? (
                <p>Lista de produtos aqui.</p>
              ) : (
                <p>Não há produtos contratados</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      <CancellationDialog isOpen={isCancellationOpen} onOpenChange={setCancellationOpen} hireData={data} />
    </>
  );
};

export default HireDetailPage;