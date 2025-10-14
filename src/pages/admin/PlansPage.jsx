import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FilePlus2, List, Save, Package, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PlansPage = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('all-plans');
  
  const initialPlanState = { name: '', price: '', description: '' };
  const [planData, setPlanData] = useState(initialPlanState);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const { data: plansData, error: plansError } = await supabase.from('plans').select('*, plan_products(products(*))').order('created_at', { ascending: false });
    if (plansError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar planos', description: plansError.message });
    } else {
      setPlans(plansData);
    }

    const { data: productsData, error: productsError } = await supabase.from('products').select('*').order('name');
    if (productsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar produtos', description: productsError.message });
    } else {
      setProducts(productsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const resetForm = () => {
    setPlanData(initialPlanState);
    setSelectedProducts([]);
    setEditingPlan(null);
    setActiveTab('all-plans');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPlanData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProductSelection = (productId, checked) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  };
  
  const handleEdit = async (plan) => {
    setEditingPlan(plan);
    setPlanData({ name: plan.name, price: plan.price, description: plan.description });
    const { data: planProducts, error } = await supabase.from('plan_products').select('product_id').eq('plan_id', plan.id);
    if (!error) {
      setSelectedProducts(planProducts.map(p => p.product_id));
    }
    setActiveTab('form-plan');
  };
  
  const handleSavePlan = async (e) => {
    e.preventDefault();
    setLoading(true);

    let currentPlanId;
    if (editingPlan) {
      const { data, error } = await supabase.from('plans').update(planData).eq('id', editingPlan.id).select().single();
      if (error) { toast({ variant: 'destructive', title: 'Erro ao atualizar plano', description: error.message }); setLoading(false); return; }
      currentPlanId = data.id;
    } else {
      const { data, error } = await supabase.from('plans').insert([planData]).select().single();
      if (error) { toast({ variant: 'destructive', title: 'Erro ao salvar plano', description: error.message }); setLoading(false); return; }
      currentPlanId = data.id;
    }

    const { error: deleteError } = await supabase.from('plan_products').delete().eq('plan_id', currentPlanId);
    if(deleteError) { /* handle error */ }

    if (selectedProducts.length > 0) {
      const planProducts = selectedProducts.map((productId) => ({ plan_id: currentPlanId, product_id: productId }));
      const { error: insertError } = await supabase.from('plan_products').insert(planProducts);
      if (insertError) { toast({ variant: 'destructive', title: 'Erro ao associar produtos', description: insertError.message }); }
    }

    toast({ title: `✅ Plano ${editingPlan ? 'Atualizado' : 'Salvo'} com Sucesso!` });
    resetForm();
    fetchData();
    setLoading(false);
  };

  const handleDeletePlan = async (planId) => {
    await supabase.from('plan_products').delete().eq('plan_id', planId);
    const { error } = await supabase.from('plans').delete().eq('id', planId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar plano', description: error.message });
    } else {
      toast({ title: '🗑️ Plano deletado com sucesso!' });
      fetchData();
    }
  };

  const handleTabChange = (value) => {
    if (value === 'form-plan' && !editingPlan) {
        resetForm();
        setEditingPlan(null);
    }
    setActiveTab(value);
  }

  return (
    <>
      <Helmet>
        <title>Gestão de Planos | Admin</title>
        <meta name="description" content="Gerencie e cadastre novos planos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Planos</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all-plans"><List className="w-4 h-4 mr-2" />Todos os Planos</TabsTrigger>
            <TabsTrigger value="form-plan"><FilePlus2 className="w-4 h-4 mr-2" />{editingPlan ? 'Editar Plano' : 'Novo Plano'}</TabsTrigger>
          </TabsList>
          <TabsContent value="all-plans">
            <Card>
              <CardHeader><CardTitle>Todos os Planos</CardTitle><CardDescription>Visualize e gerencie todos os planos existentes.</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Preço</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(plan)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem></AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita e irá deletar o plano permanentemente.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeletePlan(plan.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="form-plan">
            <motion.form onSubmit={handleSavePlan}>
              <Card>
                <CardHeader><CardTitle>{editingPlan ? 'Editar Plano' : 'Cadastrar Novo Plano'}</CardTitle><CardDescription>Crie ou edite um plano e associe produtos.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label htmlFor="name">Nome do Plano</Label><Input id="name" placeholder="Ex: Plano Ouro Formatura" value={planData.name} onChange={handleInputChange} required /></div>
                      <div className="space-y-2"><Label htmlFor="price">Preço (R$)</Label><Input id="price" type="number" step="0.01" placeholder="999,90" value={planData.price} onChange={handleInputChange} required /></div>
                    </div>
                    <div className="space-y-2"><Label htmlFor="description">Descrição / Itens Inclusos</Label><Textarea id="description" placeholder="- 1 Fotolivro Premium&#10;- 10 Fotos impressas 10x15" value={planData.description} onChange={handleInputChange} /></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center"><Package className="h-5 w-5 mr-2" />Associar Produtos ao Plano</h3>
                    <Card className="bg-muted/50"><CardContent className="py-4 max-h-60 overflow-y-auto">
                      {products.length > 0 ? (
                        <div className="space-y-2">
                          {products.map((product) => (<div key={product.id} className="flex items-center space-x-2"><Checkbox id={`product-${product.id}`} onCheckedChange={(checked) => handleProductSelection(product.id, checked)} checked={selectedProducts.includes(product.id)} /><Label htmlFor={`product-${product.id}`}>{product.name}</Label></div>))}
                        </div>
                      ) : <p className="text-muted-foreground">Nenhum produto cadastrado.</p>}
                    </CardContent></Card>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                    <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />{loading ? 'Salvando...' : 'Salvar Plano'}</Button>
                </CardFooter>
              </Card>
            </motion.form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default PlansPage;