import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, XCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // NEW: Import RadioGroup

const transactionStatusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'cancelled', label: 'Cancelado' },
];

const FinancialTransactionForm = ({ editingTransaction, onSuccess, onCancel, defaultType = 'income' }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // NEW: State for suppliers
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recipientType, setRecipientType] = useState('client'); // NEW: State to toggle between client/supplier

  const initialFormState = {
    client_id: null, // Changed to null initially
    supplier_id: null, // NEW: Add supplier_id
    order_id: null,
    financial_category_id: '',
    account_id: '',
    description: '',
    amount: 0,
    type: defaultType,
    status: 'pending',
    due_date: new Date(),
    payment_date: null,
    gateway_id: null,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: clientsData, error: clientsError } = await supabase.from('clients').select('id, parent_name');
      if (clientsError) toast({ variant: 'destructive', title: 'Erro ao buscar clientes', description: clientsError.message });
      else setClients(clientsData.map(client => ({ value: client.id, label: client.parent_name })));

      // NEW: Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase.from('suppliers').select('id, name');
      if (suppliersError) toast({ variant: 'destructive', title: 'Erro ao buscar fornecedores', description: suppliersError.message });
      else setSuppliers(suppliersData.map(supplier => ({ value: supplier.id, label: supplier.name })));

      const { data: ordersData, error: ordersError } = await supabase.from('orders').select('id, clients(parent_name)');
      if (ordersError) toast({ variant: 'destructive', title: 'Erro ao buscar pedidos', description: ordersError.message });
      else setOrders(ordersData.map(order => ({ value: order.id, label: `Pedido #${order.id} - ${order.clients?.parent_name || 'N/A'}` })));

      const { data: categoriesData, error: categoriesError } = await supabase.from('financial_categories').select('id, name, type');
      if (categoriesError) toast({ variant: 'destructive', title: 'Erro ao buscar categorias', description: categoriesError.message });
      else setCategories(categoriesData);

      const { data: accountsData, error: accountsError } = await supabase.from('accounts').select('id, name, type');
      if (accountsError) toast({ variant: 'destructive', title: 'Erro ao buscar contas', description: accountsError.message });
      else setAccounts(accountsData.map(account => ({ value: account.id, label: `${account.name} (${account.type})` })));

      setLoading(false);
    };
    fetchData();
  }, [toast]);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        due_date: editingTransaction.due_date ? parseISO(editingTransaction.due_date) : new Date(),
        payment_date: editingTransaction.payment_date ? parseISO(editingTransaction.payment_date) : null,
      });
      // NEW: Determine recipient type based on existing transaction
      if (editingTransaction.client_id) {
        setRecipientType('client');
      } else if (editingTransaction.supplier_id) {
        setRecipientType('supplier');
      } else {
        setRecipientType('client'); // Default if neither is set
      }
    } else {
      setFormData({ ...initialFormState, type: defaultType });
      setRecipientType('client'); // Default for new transactions
    }
  }, [editingTransaction, defaultType]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleDateSelect = (id, date) => {
    setFormData((prev) => ({ ...prev, [id]: date }));
  };

  const handleRecipientTypeChange = (value) => {
    setRecipientType(value);
    setFormData(prev => ({
      ...prev,
      client_id: null, // Clear client_id if switching to supplier
      supplier_id: null, // Clear supplier_id if switching to client
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // NEW: Validate based on selected recipient type
    if (!formData.amount || !formData.type || !formData.due_date || !formData.financial_category_id || !formData.account_id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Campos obrigatórios ausentes.' });
      setLoading(false);
      return;
    }
    if (recipientType === 'client' && !formData.client_id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um cliente.' });
      setLoading(false);
      return;
    }
    if (recipientType === 'supplier' && !formData.supplier_id) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um fornecedor.' });
      setLoading(false);
      return;
    }


    const dataToSave = {
      ...formData,
      due_date: formData.due_date.toISOString().split('T')[0], // Format to YYYY-MM-DD
      payment_date: formData.payment_date ? formData.payment_date.toISOString().split('T')[0] : null,
      // Ensure only one of client_id or supplier_id is sent
      client_id: recipientType === 'client' ? formData.client_id : null,
      supplier_id: recipientType === 'supplier' ? formData.supplier_id : null,
    };

    try {
      let result;
      if (editingTransaction) {
        result = await supabase.from('financial_transactions').update(dataToSave).eq('id', editingTransaction.id).select().single();
      } else {
        result = await supabase.from('financial_transactions').insert([dataToSave]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Transação ${editingTransaction ? 'Atualizada' : 'Criada'}!`, description: 'As alterações foram salvas com sucesso.' });
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* NEW: Recipient Type Selection */}
      <div className="space-y-2">
        <Label>Destinatário</Label>
        <RadioGroup defaultValue="client" value={recipientType} onValueChange={handleRecipientTypeChange} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="client" id="recipient-client" />
            <Label htmlFor="recipient-client">Cliente</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="supplier" id="recipient-supplier" />
            <Label htmlFor="recipient-supplier">Fornecedor</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Conditional Recipient Selection */}
      {recipientType === 'client' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Combobox
              options={clients}
              value={formData.client_id}
              onChange={(value) => handleSelectChange('client_id', value)}
              placeholder="Selecione o cliente"
              searchPlaceholder="Buscar cliente..."
              notFoundMessage="Nenhum cliente encontrado."
              required={recipientType === 'client'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order_id">Pedido (Opcional)</Label>
            <Combobox
              options={orders}
              value={formData.order_id}
              onChange={(value) => handleSelectChange('order_id', value)}
              placeholder="Selecione o pedido"
              searchPlaceholder="Buscar pedido..."
              notFoundMessage="Nenhum pedido encontrado."
            />
          </div>
        </div>
      )}

      {recipientType === 'supplier' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplier_id">Fornecedor</Label>
            <Combobox
              options={suppliers}
              value={formData.supplier_id}
              onChange={(value) => handleSelectChange('supplier_id', value)}
              placeholder="Selecione o fornecedor"
              searchPlaceholder="Buscar fornecedor..."
              notFoundMessage="Nenhum fornecedor encontrado."
              required={recipientType === 'supplier'}
            />
          </div>
          {/* Order field might not be relevant for suppliers, or could be a different type of reference */}
          <div className="space-y-2">
            <Label htmlFor="order_id">Referência do Pedido/Serviço (Opcional)</Label>
            <Input id="order_id" value={formData.order_id || ''} onChange={handleInputChange} placeholder="Ex: Pedido #12345 ou Serviço de Impressão" />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="financial_category_id">Categoria Financeira</Label>
          <Combobox
            options={filteredCategories.map(cat => ({ value: cat.id, label: cat.name }))}
            value={formData.financial_category_id}
            onChange={(value) => handleSelectChange('financial_category_id', value)}
            placeholder="Selecione a categoria"
            searchPlaceholder="Buscar categoria..."
            notFoundMessage="Nenhuma categoria encontrada."
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account_id">Conta</Label>
          <Combobox
            options={accounts}
            value={formData.account_id}
            onChange={(value) => handleSelectChange('account_id', value)}
            placeholder="Selecione a conta"
            searchPlaceholder="Buscar conta..."
            notFoundMessage="Nenhuma conta encontrada."
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição (Opcional)</Label>
        <Textarea id="description" value={formData.description || ''} onChange={handleInputChange} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Transação</Label>
          <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
            <SelectTrigger id="type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {transactionStatusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Data de Vencimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.due_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.due_date ? format(formData.due_date, "PPP") : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.due_date}
                onSelect={(date) => handleDateSelect('due_date', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Data de Pagamento (Opcional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.payment_date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.payment_date ? format(formData.payment_date, "PPP") : <span>Escolha uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.payment_date}
              onSelect={(date) => handleDateSelect('payment_date', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gateway_id">ID do Gateway (Opcional)</Label>
        <Input id="gateway_id" value={formData.gateway_id || ''} onChange={handleInputChange} placeholder="ID da transação no gateway" />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <XCircle className="w-4 h-4 mr-2" /> Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Salvando...' : 'Salvar Transação'}
        </Button>
      </div>
    </form>
  );
};

export default FinancialTransactionForm;