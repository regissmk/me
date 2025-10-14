import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const FinancialCategoryForm = ({ editingCategory, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const initialFormState = {
    name: '',
    type: 'income', // 'income' or 'expense'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
    } else {
      setFormData(initialFormState);
    }
  }, [editingCategory]);

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
      if (editingCategory) {
        result = await supabase.from('financial_categories').update(formData).eq('id', editingCategory.id).select().single();
      } else {
        result = await supabase.from('financial_categories').insert([formData]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Categoria ${editingCategory ? 'Atualizada' : 'Criada'}!`, description: 'As alterações foram salvas com sucesso.' });
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
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input id="name" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Tipo</Label>
        <Select value={formData.type} onValueChange={handleSelectChange}>
          <SelectTrigger id="type">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Categoria'}
        </Button>
      </div>
    </form>
  );
};

export default FinancialCategoryForm;