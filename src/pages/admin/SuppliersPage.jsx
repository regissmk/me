import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Upload, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const mockSuppliers = [
  { id: 'SUP001', name: 'Gráfica Veloz', type: 'Jurídico', email: 'contato@graficaveloz.com.br', phone: '(11) 98765-4321' },
  { id: 'SUP002', name: 'João Fotógrafo', type: 'Físico', email: 'joao.foto@email.com', phone: '(21) 91234-5678' },
  { id: 'SUP003', name: 'Brindes Criativos Ltda', type: 'Jurídico', email: 'vendas@brindescriativos.com', phone: '(31) 99999-8888' },
];

const SuppliersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAction = (message) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: message || "Esta funcionalidade ainda não foi implementada. 🚀",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <Helmet>
        <title>Fornecedores | Admin</title>
        <meta name="description" content="Gerencie seus fornecedores." />
      </Helmet>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleAction('A importação de fornecedores será implementada em breve.')}>
              <Upload className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/admin/suppliers/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Fornecedor
            </Button>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Fornecedores</CardTitle>
              <CardDescription>Visualize e gerencie todos os seus fornecedores cadastrados.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome/Razão Social</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.type}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/suppliers/edit/${supplier.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onClick={() => handleAction('A exclusão de fornecedores será implementada.')}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SuppliersPage;