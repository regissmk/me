import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FilePlus2, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import ContractList from '@/components/contracts/ContractList';
import ContractForm from '@/components/contracts/ContractForm';

const ContractsPage = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [activeTab, setActiveTab] = useState('all-contracts');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: contractsData, error: contractsError } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
      if (contractsError) throw contractsError;
      setContracts(contractsData);

      const { data: plansData, error: plansError } = await supabase.from('plans').select('*').order('name');
      if (plansError) throw plansError;
      setPlans(plansData);

      const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('name');
      if (productsError) throw productsError;
      setProducts(productsData);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = useCallback(async (contract) => {
    setEditingContract(contract);
    setActiveTab('form-contract');
  }, []);

  const handleDelete = useCallback(async (contractId) => {
    const { error } = await supabase.from('contracts').delete().eq('id', contractId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar contrato', description: error.message });
    } else {
      toast({ title: '🗑️ Contrato deletado com sucesso!' });
      fetchData();
    }
  }, [fetchData, toast]);

  const handleFormSuccess = useCallback(() => {
    setEditingContract(null);
    setActiveTab('all-contracts');
    fetchData();
  }, [fetchData]);

  const handleTabChange = (value) => {
    if (value === "form-contract" && activeTab !== 'form-contract') {
      setEditingContract(null);
    }
    setActiveTab(value);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  return (
    <>
      <Helmet>
        <title>Gestão de Contratos | Admin</title>
        <meta name="description" content="Gerencie e cadastre novos contratos com escolas." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Contratos</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all-contracts"><List className="w-4 h-4 mr-2" />Todos os Contratos</TabsTrigger>
            <TabsTrigger value="form-contract"><FilePlus2 className="w-4 h-4 mr-2" />{editingContract ? 'Editar Contrato' : 'Novo Contrato'}</TabsTrigger>
          </TabsList>
          <TabsContent value="all-contracts">
            <ContractList
              contracts={contracts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="form-contract">
            <ContractForm
              key={editingContract ? editingContract.id : 'new'}
              editingContract={editingContract}
              plans={plans}
              products={products}
              onSuccess={handleFormSuccess}
              onCancel={() => setActiveTab('all-contracts')}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default ContractsPage;