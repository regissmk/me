import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Copy, Package, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import RichTextEditor from '@/components/RichTextEditor';

const ContractForm = ({ editingContract, plans, products, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const initialContractState = {
    name: '',
    invite_link_id: '',
    description: '',
    clauses: '',
    discount: 0,
    deadline: '',
    default_due_date: 2,
    allow_installments: false,
    use_course: false,
    alert_responsible: false,
    request_measurements: false,
    disable_notifications: false,
    use_profile_picture: true,
  };

  const [contractData, setContractData] = useState(initialContractState);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const generateInviteLinkId = useCallback((name) => {
    if (name) {
      const slug = slugify(name);
      setContractData(prev => ({ ...prev, invite_link_id: slug }));
    } else {
      const randomId = Math.random().toString(36).substring(2, 10);
      setContractData(prev => ({ ...prev, invite_link_id: randomId }));
    }
  }, []);

  useEffect(() => {
    if (editingContract) {
      setContractData({
        ...editingContract,
        deadline: editingContract.deadline ? editingContract.deadline.split('T')[0] : '',
      });
      const fetchAssociations = async () => {
        const { data: contractPlans } = await supabase.from('contract_plans').select('plan_id').eq('contract_id', editingContract.id);
        if (contractPlans) setSelectedPlans(contractPlans.map(p => p.plan_id));
        const { data: contractProducts } = await supabase.from('contract_products').select('product_id').eq('contract_id', editingContract.id);
        if (contractProducts) setSelectedProducts(contractProducts.map(p => p.product_id));
      };
      fetchAssociations();
    } else {
      generateInviteLinkId('');
    }
  }, [editingContract, generateInviteLinkId]);

  const handleRichTextChange = (id, value) => setContractData(prev => ({ ...prev, [id]: value }));
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setContractData(prev => ({ ...prev, [id]: value }));
    if (id === 'name') generateInviteLinkId(value);
  };
  const handleSwitchChange = (id, checked) => setContractData(prev => ({ ...prev, [id]: checked }));
  const handlePlanSelection = (planId, checked) => setSelectedPlans(prev => checked ? [...prev, planId] : prev.filter(id => id !== planId));
  const handleProductSelection = (productId, checked) => setSelectedProducts(prev => checked ? [...prev, productId] : prev.filter(id => id !== productId));

  const copyInviteLink = (linkId) => {
    const link = `${window.location.origin}/cadastro/${linkId}`;
    navigator.clipboard.writeText(link);
    toast({ title: '🔗 Link Copiado!', description: 'O link de convite foi copiado.' });
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = { ...contractData };
    if (dataToSave.discount === '') dataToSave.discount = 0;
    if (dataToSave.deadline === '') dataToSave.deadline = null;

    let result;
    if (editingContract) {
      result = await supabase.from('contracts').update(dataToSave).eq('id', editingContract.id).select().single();
    } else {
      result = await supabase.from('contracts').insert([dataToSave]).select().single();
    }

    const { data: newContract, error: contractError } = result;

    if (contractError) {
      toast({ variant: 'destructive', title: 'Erro ao salvar contrato', description: contractError.message });
      setLoading(false);
      return;
    }

    await supabase.from('contract_plans').delete().eq('contract_id', newContract.id);
    await supabase.from('contract_products').delete().eq('contract_id', newContract.id);

    if (selectedPlans.length > 0) {
      await supabase.from('contract_plans').insert(selectedPlans.map(planId => ({ contract_id: newContract.id, plan_id: planId })));
    }
    if (selectedProducts.length > 0) {
      await supabase.from('contract_products').insert(selectedProducts.map(productId => ({ contract_id: newContract.id, product_id: productId })));
    }

    toast({ title: `✅ Contrato ${editingContract ? 'Atualizado' : 'Salvo'} com Sucesso!` });
    setLoading(false);
    onSuccess();
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.form onSubmit={handleSaveContract} variants={itemVariants}>
      <Card>
        <CardHeader>
          <CardTitle>{editingContract ? 'Editar Contrato' : 'Cadastrar Novo Contrato'}</CardTitle>
          <CardDescription>Preencha as informações para {editingContract ? 'atualizar o' : 'criar um novo'} contrato.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Gerais</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Contrato</Label>
                <Input id="name" placeholder="Ex: Formatura 2025 - Escola ABC" value={contractData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite_link_id">Link de Convite para Clientes</Label>
                <div className="flex items-center gap-2">
                  <Input id="invite_link_id" value={`${window.location.origin}/cadastro/${contractData.invite_link_id}`} readOnly />
                  <Button type="button" variant="outline" size="icon" onClick={() => generateInviteLinkId(contractData.name)}><RefreshCw className="h-4 w-4" /></Button>
                  <Button type="button" variant="outline" size="icon" onClick={() => copyInviteLink(contractData.invite_link_id)}><Copy className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">O link é gerado automaticamente a partir do nome do contrato.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <RichTextEditor value={contractData.description || ''} onChange={(v) => handleRichTextChange('description', v)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clauses">Cláusulas Específicas</Label>
              <RichTextEditor value={contractData.clauses || ''} onChange={(v) => handleRichTextChange('clauses', v)} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">Configuração de Planos e Produtos</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center"><Package className="w-4 h-4 mr-2" />Planos Vinculados</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-48 overflow-y-auto">{plans.map(plan => (<div key={plan.id} className="flex items-center space-x-2"><Checkbox id={`plan-${plan.id}`} onCheckedChange={(c) => handlePlanSelection(plan.id, c)} checked={selectedPlans.includes(plan.id)} /><Label htmlFor={`plan-${plan.id}`}>{plan.name}</Label></div>))}</CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center"><PackagePlus className="w-4 h-4 mr-2" />Produtos Vinculados</CardTitle></CardHeader>
                <CardContent className="space-y-2 max-h-48 overflow-y-auto">{products.map(product => (<div key={product.id} className="flex items-center space-x-2"><Checkbox id={`product-${product.id}`} onCheckedChange={(c) => handleProductSelection(product.id, c)} checked={selectedProducts.includes(product.id)} /><Label htmlFor={`product-${product.id}`}>{product.name}</Label></div>))}</CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">Regras Financeiras</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label htmlFor="discount">Desconto à Vista (%)</Label><Input id="discount" type="number" placeholder="10" value={contractData.discount || ''} onChange={handleInputChange} /></div>
              <div className="space-y-2"><Label htmlFor="deadline">Data Limite de Compras</Label><Input id="deadline" type="date" value={contractData.deadline || ''} onChange={handleInputChange} /></div>
              <div className="space-y-2"><Label htmlFor="default_due_date">Vencimento Padrão (dias)</Label><Input id="default_due_date" type="number" placeholder="2" value={contractData.default_due_date} onChange={handleInputChange} /></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações Adicionais</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center space-x-2"><Switch id="use_course" checked={contractData.use_course} onCheckedChange={(c) => handleSwitchChange('use_course', c)} /><Label htmlFor="use_course">Usar Curso/Turma?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="alert_responsible" checked={contractData.alert_responsible} onCheckedChange={(c) => handleSwitchChange('alert_responsible', c)} /><Label htmlFor="alert_responsible">Alertar sobre Responsável?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="request_measurements" checked={contractData.request_measurements} onCheckedChange={(c) => handleSwitchChange('request_measurements', c)} /><Label htmlFor="request_measurements">Solicitar Medidas?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="disable_notifications" checked={contractData.disable_notifications} onCheckedChange={(c) => handleSwitchChange('disable_notifications', c)} /><Label htmlFor="disable_notifications">Desabilitar Notificações?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="use_profile_picture" checked={contractData.use_profile_picture} onCheckedChange={(c) => handleSwitchChange('use_profile_picture', c)} /><Label htmlFor="use_profile_picture">Usar Foto de Perfil para R.F.?</Label></div>
              <div className="flex items-center space-x-2"><Switch id="allow_installments" checked={contractData.allow_installments} onCheckedChange={(c) => handleSwitchChange('allow_installments', c)} /><Label htmlFor="allow_installments">Parcelar até data limite?</Label></div>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />{loading ? 'Salvando...' : 'Salvar Contrato'}</Button>
        </CardFooter>
      </Card>
    </motion.form>
  );
};

export default ContractForm;