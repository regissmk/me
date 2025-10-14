import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Upload, Filter, List, Home, MoreHorizontal, Pencil } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockOrderItems = [
  {
    id: 1,
    product: 'FOTO IMÃ - KIT COM 5 UNIDADES - 8X13CM',
    client: 'REGINALDO SANTOS DA SILVA',
    status: 'Em Produção',
    additionalCharge: '',
    created: '30/08/2025',
    edited: '30/08/2025',
  },
  {
    id: 2,
    product: 'LINK DIGITAL COM TODAS AS FOTOS DO DIA DOS PAIS',
    client: 'REGINALDO SANTOS DA SILVA',
    status: 'Adquirido',
    additionalCharge: '',
    created: '30/08/2025',
    edited: '30/08/2025',
  },
];

const OrderItemsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAction = (message) => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: message || 'Esta funcionalidade será implementada em breve! 🚀',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Em Produção':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Adquirido':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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
        <title>Itens para Fabricação | Admin</title>
        <meta name="description" content="Gerencie os itens dos pedidos para fabricação." />
      </Helmet>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Itens para Fabricação</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Home className="h-4 w-4 mr-1.5" />
              /
              <span className="mx-1.5">Itens para Fabricação</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white border-green-600" onClick={() => handleAction('Exportação de itens para CSV.')}>
              <Upload className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => handleAction('Funcionalidade de filtro avançado.')}>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 text-white p-3 rounded-lg flex items-center gap-2">
                    <List className="h-5 w-5" />
                    <span className="font-semibold">Itens: {mockOrderItems.length}</span>
                  </div>
                   <div className="flex items-center gap-2 text-sm">
                    <span>Exibir</span>
                    <Input type="number" defaultValue="25" className="w-16" />
                    <span>itens</span>
                  </div>
                </div>
                 <div className="w-full max-w-sm">
                    <Input placeholder="Digite a Pesquisa" />
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"><Checkbox /></TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cobrança Adicional</TableHead>
                    <TableHead>Criado</TableHead>
                    <TableHead>Editado</TableHead>
                    <TableHead><span className="sr-only">Ações</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell><Checkbox /></TableCell>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.additionalCharge || '-'}</TableCell>
                      <TableCell>{item.created}</TableCell>
                      <TableCell>{item.edited}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menu de ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/order-items/edit/${item.id}`)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
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

export default OrderItemsPage;