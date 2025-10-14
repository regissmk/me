import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, ChevronRight, FileText, Package, PackagePlus, Calendar, Percent, Banknote, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ContractDetailPage = () => {
  const { contractId } = useParams();
  const { toast } = useToast();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractDetails = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          contract_plans(plans(id, name, price)),
          contract_products(products(id, name, price))
        `)
        .eq('id', contractId)
        .single();

      if (error) {
        toast({ variant: "destructive", title: "Erro ao buscar contrato", description: error.message });
      } else {
        setContract(data);
      }
      setLoading(false);
    };

    fetchContractDetails();
  }, [contractId, toast]);

  if (loading) {
    return <div className="text-center p-8">Carregando detalhes do contrato...</div>;
  }

  if (!contract) {
    return <div className="text-center p-8">Contrato não encontrado.</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const InfoCard = ({ icon, title, value }) => (
    <div className="flex items-center space-x-3 rounded-md bg-muted/50 p-3">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Detalhes do Contrato | {contract.name}</title>
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Link to="/admin" className="hover:text-primary"><Home className="h-4 w-4" /></Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/admin/contracts" className="hover:text-primary">Contratos</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Detalhes</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{contract.name}</h1>
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoCard icon={<Calendar className="h-6 w-6 text-primary"/>} title="Data Limite" value={contract.deadline ? new Date(contract.deadline).toLocaleDateString('pt-BR') : 'Não definida'} />
            <InfoCard icon={<Percent className="h-6 w-6 text-primary"/>} title="Desconto à Vista" value={`${contract.discount || 0}%`} />
            <InfoCard icon={<Banknote className="h-6 w-6 text-primary"/>} title="Parcelamento" value={contract.allow_installments ? "Permitido" : "Não Permitido"} />
            <InfoCard icon={<Clock className="h-6 w-6 text-primary"/>} title="Vencimento Padrão" value={`${contract.default_due_date || 0} dias`} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/> Descrição e Cláusulas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Descrição</h3>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contract.description || '<p class="text-muted-foreground">Nenhuma descrição fornecida.</p>' }} />
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Cláusulas</h3>
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: contract.clauses || '<p class="text-muted-foreground">Nenhuma cláusula específica.</p>' }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Package className="mr-2 h-5 w-5"/> Planos Vinculados</CardTitle></CardHeader>
              <CardContent>
                {contract.contract_plans.length > 0 ? (
                  <ul className="space-y-2">
                    {contract.contract_plans.map(item => (
                      <li key={item.plans.id} className="flex justify-between items-center text-sm">
                        <span>{item.plans.name}</span>
                        <Badge variant="secondary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.plans.price)}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Nenhum plano vinculado.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><PackagePlus className="mr-2 h-5 w-5"/> Produtos Avulsos Vinculados</CardTitle></CardHeader>
              <CardContent>
                {contract.contract_products.length > 0 ? (
                  <ul className="space-y-2">
                    {contract.contract_products.map(item => (
                      <li key={item.products.id} className="flex justify-between items-center text-sm">
                        <span>{item.products.name}</span>
                        <Badge variant="outline">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.products.price)}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Nenhum produto avulso vinculado.</p>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ContractDetailPage;