import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AppointmentTypeForm = ({ editingType, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const initialFormState = {
    name: '',
    duration_minutes: 30,
    description: '',
    color: '#0F3A7D', // Default primary color
    is_active: true,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (editingType) {
      setFormData(editingType);
    } else {
      setFormData(initialFormState);
    }
  }, [editingType]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.duration_minutes) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Nome e Duração são obrigatórios.' });
      setLoading(false);
      return;
    }

    try {
      let result;
      if (editingType) {
        result = await supabase.from('appointment_types').update(formData).eq('id', editingType.id).select().single();
      } else {
        result = await supabase.from('appointment_types').insert([formData]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Tipo de Agendamento ${editingType ? 'Atualizado' : 'Criado'}!`, description: 'As alterações foram salvas com sucesso.' });
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Tipo de Agendamento</Label>
          <Input id="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duração (minutos)</Label>
          <Input id="duration_minutes" type="number" value={formData.duration_minutes} onChange={handleInputChange} required min="1" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Cor de Exibição</Label>
          <div className="flex items-center gap-2">
            <Input id="color" type="color" value={formData.color || '#0F3A7D'} onChange={handleInputChange} className="p-1 h-10 w-14" />
            <span className="font-mono text-sm">{formData.color}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <Switch id="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
          <Label htmlFor="is_active">Ativo</Label>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Tipo'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentTypeForm;