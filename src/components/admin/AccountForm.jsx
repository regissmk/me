import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AccountForm = ({ editingAccount, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const initialFormState = {
    name: '',
    balance: 0,
    type: 'checking', // e.g., 'checking', 'savings', 'cash', 'credit_card'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingAccount) {
      setFormData(editingAccount);
    } else {
      setFormData(initialFormState);
    }
  }, [editingAccount]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.type) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Nome e Tipo são obrigatórios.' });
      setLoading(false);
      return;
    }

    try {
      let result;
      if (editingAccount) {
        result = await supabase.from('accounts').update(formData).eq('id', editingAccount.id).select().single();
      } else {
        result = await supabase.from('accounts').insert([formData]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Conta ${editingAccount ? 'Atualizada' : 'Criada'}!`, description: 'As alterações foram salvas com sucesso.' });
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Conta</Label>
        <Input id="name" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Saldo Inicial</Label>
        <Input id="balance" type="number" step="0.01" value={formData.balance} onChange={handleInputChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select value={formData.type} onValueChange={handleSelectChange}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Conta Corrente</SelectItem>
            <SelectItem value="savings">Poupança</SelectItem>
            <SelectItem value="cash">Dinheiro em Espécie</SelectItem>
            <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
            <SelectItem value="investment">Investimento</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Conta'}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;