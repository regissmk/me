import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, parseISO, isValid } from 'date-fns'; // Import isValid
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
];

const AppointmentForm = ({ editingAppointment, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [recipientType, setRecipientType] = useState('client');

  const initialFormState = {
    appointment_type_id: '',
    client_id: null,
    contract_id: null,
    child_id: null,
    start_time: new Date(),
    end_time: new Date(),
    status: 'pending',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: typesData, error: typesError } = await supabase.from('appointment_types').select('*').eq('is_active', true);
      if (typesError) toast({ variant: 'destructive', title: 'Erro', description: typesError.message });
      else setAppointmentTypes(typesData.map(type => ({ value: type.id, label: type.name, duration: type.duration_minutes })));

      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, parent_name');
      if (clientsError) toast({ variant: 'destructive', title: 'Erro', description: clientsError.message });
      else setClients(clientsData.map(client => ({ value: client.id, label: client.parent_name })));

      const { data: contractsData, error: contractsError } = await supabase.from('contracts').select('id, name');
      if (contractsError) toast({ variant: 'destructive', title: 'Erro', description: contractsError.message });
      else setContracts(contractsData.map(contract => ({ value: contract.id, label: contract.name })));

      setLoading(false);
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (editingAppointment) {
      const parsedStartTime = editingAppointment.start_time ? parseISO(editingAppointment.start_time) : new Date();
      const parsedEndTime = editingAppointment.end_time ? parseISO(editingAppointment.end_time) : new Date(parsedStartTime.getTime() + 30 * 60 * 1000); // Default duration

      setFormData({
        ...editingAppointment,
        start_time: isValid(parsedStartTime) ? parsedStartTime : new Date(),
        end_time: isValid(parsedEndTime) ? parsedEndTime : new Date(parsedStartTime.getTime() + 30 * 60 * 1000),
      });
      setSelectedClient(editingAppointment.client_id);
      if (editingAppointment.client_id) {
        setRecipientType('client');
      } else if (editingAppointment.contract_id) {
        setRecipientType('contract');
      } else {
        setRecipientType('client');
      }
    } else {
      setFormData(initialFormState);
      setSelectedClient(null);
      setRecipientType('client');
    }
  }, [editingAppointment]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (selectedClient && recipientType === 'client') {
        const { data, error } = await supabase.from('children').select('id, name').eq('client_id', selectedClient);
        if (error) toast({ variant: 'destructive', title: 'Erro', description: error.message });
        else setChildren(data.map(child => ({ value: child.id, label: child.name })));
      } else {
        setChildren([]);
      }
    };
    fetchChildren();
  }, [selectedClient, recipientType, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateSelect = (date) => {
    if (!date || !isValid(date)) return; // Ensure selected date is valid

    const selectedType = appointmentTypes.find(type => type.value === formData.appointment_type_id);
    const duration = selectedType ? selectedType.duration : 30;

    const currentHours = isValid(formData.start_time) ? formData.start_time.getHours() : new Date().getHours();
    const currentMinutes = isValid(formData.start_time) ? formData.start_time.getMinutes() : new Date().getMinutes();

    const newStartTime = setMinutes(setHours(date, currentHours), currentMinutes);
    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000);

    setFormData((prev) => ({
      ...prev,
      start_time: newStartTime,
      end_time: newEndTime,
    }));
  };

  const handleTimeChange = (e) => {
    const { value } = e.target;
    const [hours, minutes] = value.split(':').map(Number);
    
    const baseDate = isValid(formData.start_time) ? formData.start_time : new Date();
    const newDate = setMinutes(setHours(baseDate, hours), minutes);

    const selectedType = appointmentTypes.find(type => type.value === formData.appointment_type_id);
    const duration = selectedType ? selectedType.duration : 30;

    const newEndTime = new Date(newDate.getTime() + duration * 60 * 1000);

    setFormData((prev) => ({
      ...prev,
      start_time: newDate,
      end_time: newEndTime,
    }));
  };

  const handleAppointmentTypeChange = (typeId) => {
    const selectedType = appointmentTypes.find(type => type.value === typeId);
    const baseStartTime = isValid(formData.start_time) ? formData.start_time : new Date();

    if (selectedType) {
      const duration = selectedType.duration;
      const newEndTime = new Date(baseStartTime.getTime() + duration * 60 * 1000);
      setFormData(prev => ({ ...prev, appointment_type_id: typeId, end_time: newEndTime }));
    } else {
      setFormData(prev => ({ ...prev, appointment_type_id: typeId, end_time: baseStartTime }));
    }
  };

  const handleRecipientTypeChange = (value) => {
    setRecipientType(value);
    setFormData(prev => ({
      ...prev,
      client_id: null,
      child_id: null,
      contract_id: null,
    }));
    setSelectedClient(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.appointment_type_id || !isValid(formData.start_time)) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Tipo de agendamento e data/hora são obrigatórios.' });
      setLoading(false);
      return;
    }

    if (recipientType === 'client' && !formData.client_id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um cliente para o agendamento.' });
      setLoading(false);
      return;
    }
    if (recipientType === 'contract' && !formData.contract_id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um contrato (escola) para o agendamento.' });
      setLoading(false);
      return;
    }

    const dataToSave = {
      ...formData,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time.toISOString(),
      client_id: recipientType === 'client' ? formData.client_id : null,
      contract_id: recipientType === 'contract' ? formData.contract_id : null,
      child_id: recipientType === 'contract' ? null : formData.child_id,
    };

    try {
      let result;
      if (editingAppointment) {
        result = await supabase.from('appointments').update(dataToSave).eq('id', editingAppointment.id).select().single();
      } else {
        result = await supabase.from('appointments').insert([dataToSave]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Agendamento ${editingAppointment ? 'Atualizado' : 'Criado'}!`, description: 'As alterações foram salvas com sucesso.' });
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
        <Label>Agendamento para:</Label>
        <RadioGroup defaultValue="client" value={recipientType} onValueChange={handleRecipientTypeChange} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="client" id="recipient-client" />
            <Label htmlFor="recipient-client">Cliente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="contract" id="recipient-contract" />
            <Label htmlFor="recipient-contract">Contrato (Escola)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="appointment_type_id">Tipo de Agendamento</Label>
          <Combobox
            options={appointmentTypes}
            value={formData.appointment_type_id}
            onChange={handleAppointmentTypeChange}
            placeholder="Selecione o tipo"
            searchPlaceholder="Buscar tipo..."
            notFoundMessage="Nenhum tipo encontrado."
            required
          />
        </div>
        {recipientType === 'client' && (
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Combobox
              options={clients}
              value={formData.client_id}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, client_id: value, child_id: null }));
                setSelectedClient(value);
              }}
              placeholder="Selecione o cliente"
              searchPlaceholder="Buscar cliente..."
              notFoundMessage="Nenhum cliente encontrado."
              required
            />
          </div>
        )}
        {recipientType === 'contract' && (
          <div className="space-y-2">
            <Label htmlFor="contract_id">Contrato (Escola)</Label>
            <Combobox
              options={contracts}
              value={formData.contract_id}
              onChange={(value) => setFormData(prev => ({ ...prev, contract_id: value }))}
              placeholder="Selecione o contrato"
              searchPlaceholder="Buscar contrato..."
              notFoundMessage="Nenhum contrato encontrado."
              required
            />
          </div>
        )}
      </div>
      {selectedClient && children.length > 0 && recipientType === 'client' && (
        <div className="space-y-2">
          <Label htmlFor="child_id">Filho (Opcional)</Label>
          <Combobox
            options={children}
            value={formData.child_id}
            onChange={(value) => setFormData(prev => ({ ...prev, child_id: value }))}
            placeholder="Selecione o filho"
            searchPlaceholder="Buscar filho..."
            notFoundMessage="Nenhum filho encontrado."
          />
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !isValid(formData.start_time) && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isValid(formData.start_time) ? format(formData.start_time, "PPP") : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={isValid(formData.start_time) ? formData.start_time : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_time_input">Hora de Início</Label>
          <Input
            id="start_time_input"
            type="time"
            value={isValid(formData.start_time) ? format(formData.start_time, 'HH:mm') : ''}
            onChange={handleTimeChange}
            required
          />
          <p className="text-sm text-muted-foreground">Hora de Término: {isValid(formData.end_time) ? format(formData.end_time, 'HH:mm') : 'N/A'}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Combobox
          options={statusOptions}
          value={formData.status}
          onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
          placeholder="Selecione o status"
          searchPlaceholder="Buscar status..."
          notFoundMessage="Nenhum status encontrado."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Agendamento'}
        </Button>
      </div>
    </form>
  );
};

export default AppointmentForm;