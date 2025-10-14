import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, PlusCircle, MoreVertical, Edit, Trash2, XCircle, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO, setHours, setMinutes, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const ClientSchedulePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const initialFormState = {
    appointment_type_id: '',
    client_id: '',
    child_id: null,
    start_time: new Date(),
    end_time: new Date(),
    status: 'pending',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchClientData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        throw new Error(clientError?.message || 'Client not found.');
      }

      setFormData(prev => ({ ...prev, client_id: clientData.id }));

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id, name')
        .eq('client_id', clientData.id);
      if (childrenError) console.error('Error fetching children:', childrenError);
      else setChildren(childrenData.map(child => ({ value: child.id, label: child.name })) || []);

      const { data: typesData, error: typesError } = await supabase.from('appointment_types').select('*').eq('is_active', true);
      if (typesError) toast({ variant: 'destructive', title: 'Erro ao buscar tipos de agendamento', description: typesError.message });
      else setAppointmentTypes(typesData.map(type => ({ value: type.id, label: type.name, duration: type.duration_minutes })));

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_types (name, color, duration_minutes),
          children (name)
        `)
        .eq('client_id', clientData.id)
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar dados', description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchClientData();
  }, [fetchClientData]);

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setFormData(prev => ({ ...initialFormState, client_id: prev.client_id, start_time: selectedDate, end_time: selectedDate }));
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    const parsedStartTime = appointment.start_time ? parseISO(appointment.start_time) : new Date();
    const parsedEndTime = appointment.end_time ? parseISO(appointment.end_time) : new Date(parsedStartTime.getTime() + 30 * 60 * 1000); // Default duration

    setFormData({
      ...appointment,
      start_time: isValid(parsedStartTime) ? parsedStartTime : new Date(),
      end_time: isValid(parsedEndTime) ? parsedEndTime : new Date(parsedStartTime.getTime() + 30 * 60 * 1000),
    });
    setIsAppointmentFormOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    setLoading(true);
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar agendamento', description: error.message });
    } else {
      toast({ title: '🗑️ Agendamento deletado!' });
      fetchClientData();
    }
    setLoading(false);
  };

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
    setSelectedDate(date);
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

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.appointment_type_id || !isValid(formData.start_time)) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Tipo de agendamento e data/hora são obrigatórios.' });
      setLoading(false);
      return;
    }

    const dataToSave = {
      ...formData,
      start_time: formData.start_time.toISOString(),
      end_time: formData.end_time.toISOString(),
      status: 'pending',
    };

    try {
      let result;
      if (editingAppointment) {
        result = await supabase.from('appointments').update(dataToSave).eq('id', editingAppointment.id).select().single();
      } else {
        result = await supabase.from('appointments').insert([dataToSave]).select().single();
      }

      if (result.error) throw result.error;

      toast({ title: `✅ Agendamento ${editingAppointment ? 'Atualizado' : 'Solicitado'}!`, description: 'Seu agendamento foi enviado para revisão.' });
      setIsAppointmentFormOpen(false);
      fetchClientData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const appointmentsForSelectedDate = appointments.filter(
    (appt) => {
      const startTime = appt.start_time ? parseISO(appt.start_time) : null;
      return startTime && isValid(startTime) && isSameDay(startTime, selectedDate);
    }
  ).sort((a, b) => {
    const startTimeA = a.start_time ? parseISO(a.start_time) : new Date(0);
    const startTimeB = b.start_time ? parseISO(b.start_time) : new Date(0);
    return startTimeA.getTime() - startTimeB.getTime();
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  return (
    <>
      <Helmet>
        <title>Agenda | Cliente</title>
        <meta name="description" content="Gerencie seus agendamentos com a Memory School Fotografia." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus agendamentos.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Calendário
                </CardTitle>
                <CardDescription>Selecione uma data para ver seus compromissos.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md border w-full"
                  initialFocus
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Compromissos em {format(selectedDate, 'dd/MM/yyyy')}
                  </CardTitle>
                  <CardDescription>Seus compromissos para a data selecionada.</CardDescription>
                </div>
                <Button size="sm" onClick={handleNewAppointment}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Agendar Novo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando agendamentos...</p>
                ) : appointmentsForSelectedDate.length > 0 ? (
                  appointmentsForSelectedDate.map((appt) => {
                    const startTime = appt.start_time ? parseISO(appt.start_time) : null;
                    const endTime = appt.end_time ? parseISO(appt.end_time) : null;
                    
                    const formattedStartTime = startTime && isValid(startTime) ? format(startTime, 'HH:mm') : 'N/A';
                    const formattedEndTime = endTime && isValid(endTime) ? format(endTime, 'HH:mm') : 'N/A';

                    return (
                      <div key={appt.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div>
                          <p className="font-semibold">{appt.appointment_types?.name || 'Tipo Desconhecido'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formattedStartTime} - {formattedEndTime}
                            {appt.children && <span className="ml-2">({appt.children.name})</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(appt.status)}>{appt.status}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <>
                                <DropdownMenuItem onClick={() => handleEditAppointment(appt)}>
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                      <Trash2 className="mr-2 h-4 w-4" /> Cancelar
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta ação não pode ser desfeita e irá cancelar o agendamento.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteAppointment(appt.id)} className="bg-destructive hover:bg-destructive/90">
                                        Confirmar Cancelamento
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Nenhum compromisso agendado.</p>
                    <p className="text-sm mt-2">Que tal agendar um novo evento?</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Client Appointment Form Dialog */}
      <Dialog open={isAppointmentFormOpen} onOpenChange={setIsAppointmentFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Editar Agendamento' : 'Solicitar Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Ajuste os detalhes do seu agendamento.' : 'Preencha os detalhes para solicitar um novo agendamento.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAppointment} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appointment_type_id">Tipo de Agendamento</Label>
              <Combobox
                options={appointmentTypes}
                value={formData.appointment_type_id}
                onChange={handleAppointmentTypeChange}
                placeholder="Selecione o tipo"
                searchPlaceholder="Buscar tipo..."
                notFoundMessage="Nenhum tipo encontrado."
              />
            </div>
            {children.length > 0 && (
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
                      <CalendarDays className="mr-2 h-4 w-4" />
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
              <Label htmlFor="notes">Observações (Opcional)</Label>
              <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAppointmentFormOpen(false)} disabled={loading}>
                <XCircle className="w-4 h-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" /> {loading ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientSchedulePage;