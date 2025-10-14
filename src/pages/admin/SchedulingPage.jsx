import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, PlusCircle, Clock, MoreVertical, Edit, Trash2, List, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/customSupabaseClient';
import { format, isSameDay, parseISO, isValid } from 'date-fns';
import AppointmentTypeForm from '@/components/admin/AppointmentTypeForm';
import AppointmentForm from '@/components/admin/AppointmentForm';
import { Badge } from '@/components/ui/badge';

const SchedulingPage = () => {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [isAppointmentTypeFormOpen, setIsAppointmentTypeFormOpen] = useState(false);
  const [editingAppointmentType, setEditingAppointmentType] = useState(null);

  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const fetchAppointmentTypes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('appointment_types').select('*').order('name', { ascending: true });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar tipos de agendamento', description: error.message });
    } else {
      setAppointmentTypes(data);
    }
    setLoading(false);
  }, [toast]);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        appointment_types (name, color, duration_minutes),
        clients (parent_name),
        children (name),
        contracts (name)
      `)
      .order('start_time', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar agendamentos', description: error.message });
    } else {
      setAppointments(data);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchAppointmentTypes();
    fetchAppointments();
  }, [fetchAppointmentTypes, fetchAppointments]);

  const handleNewAppointmentType = () => {
    setEditingAppointmentType(null);
    setIsAppointmentTypeFormOpen(true);
  };

  const handleEditAppointmentType = (type) => {
    setEditingAppointmentType(type);
    setIsAppointmentTypeFormOpen(true);
  };

  const handleDeleteAppointmentType = async (typeId) => {
    setLoading(true);
    const { error } = await supabase.from('appointment_types').delete().eq('id', typeId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar tipo', description: error.message });
    } else {
      toast({ title: '🗑️ Tipo de Agendamento deletado!' });
      fetchAppointmentTypes();
    }
    setLoading(false);
  };

  const handleNewAppointment = () => {
    setEditingAppointment(null);
    setIsAppointmentFormOpen(true);
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentFormOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    setLoading(true);
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar agendamento', description: error.message });
    } else {
      toast({ title: '🗑️ Agendamento deletado!' });
      fetchAppointments();
    }
    setLoading(false);
  };

  const appointmentsForSelectedDate = appointments.filter(
    (appt) => {
      const startTime = appt.start_time ? parseISO(appt.start_time) : null;
      return startTime && isValid(startTime) && isSameDay(startTime, date);
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
        <title>Agendamento | Admin</title>
        <meta name="description" content="Gerencie seus agendamentos e tipos de eventos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Agendamento</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="types">Tipos de Agendamento</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <motion.div variants={itemVariants} className="lg:col-span-4">
              <Card>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Próximos Agendamentos</CardTitle>
                    <CardDescription>Agendamentos para {format(date, 'dd/MM/yyyy')}.</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleNewAppointment}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Novo Agendamento
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-8">Carregando agendamentos...</p>
                  ) : appointmentsForSelectedDate.length > 0 ? (
                    <>
                      {appointmentsForSelectedDate.map((appt) => {
                        const startTime = appt.start_time ? parseISO(appt.start_time) : null;
                        const endTime = appt.end_time ? parseISO(appt.end_time) : null;
                        
                        const formattedStartTime = startTime && isValid(startTime) ? format(startTime, 'HH:mm') : 'N/A';
                        const formattedEndTime = endTime && isValid(endTime) ? format(endTime, 'HH:mm') : 'N/A';

                        return (
                          <div key={appt.id} className="flex items-center p-3 border rounded-md bg-muted/50">
                            <div className={`w-2 h-10 rounded-full mr-4`} style={{ backgroundColor: appt.appointment_types?.color || '#0F3A7D' }}></div>
                            <div className="flex-grow">
                              <p className="font-semibold">{appt.appointment_types?.name || 'Tipo Desconhecido'}</p>
                              <p className="text-sm text-muted-foreground">
                                {appt.clients?.parent_name || appt.contracts?.name || 'N/A'} {appt.children ? `(${appt.children.name})` : ''}
                              </p>
                            </div>
                            <div className="text-right flex items-center gap-2">
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
                                          <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Esta ação não pode ser desfeita e irá deletar o agendamento permanentemente.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteAppointment(appt.id)} className="bg-destructive hover:bg-destructive/90">
                                            Deletar
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <CalendarIcon className="mx-auto h-12 w-12" />
                      <p className="mt-4">Nenhum agendamento para este dia.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
          <TabsContent value="types">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando tipos de agendamento...</p>
            ) : appointmentTypes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appointmentTypes.map((type) => (
                  <motion.div key={type.id} variants={itemVariants}>
                    <Card className="flex flex-col">
                      <CardHeader className="flex-row items-start justify-between pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: type.color }}></div>
                          <p className="font-semibold">{type.name}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <>
                              <DropdownMenuItem onClick={() => handleEditAppointmentType(type)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                                    <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita e irá deletar o tipo de agendamento permanentemente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAppointmentType(type.id)} className="bg-destructive hover:bg-destructive/90">
                                      Deletar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span className="text-sm">{type.duration_minutes} minutos</span>
                        </div>
                        {type.description && <p className="text-sm text-muted-foreground mt-2">{type.description}</p>}
                        {!type.is_active && <Badge variant="secondary" className="mt-2">Inativo</Badge>}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <List className="mx-auto h-12 w-12 mb-4" />
                <p className="mt-4">Nenhum tipo de agendamento cadastrado.</p>
                <Button className="mt-4" onClick={handleNewAppointmentType}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Criar Primeiro Tipo
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Appointment Type Form Dialog */}
      <Dialog open={isAppointmentTypeFormOpen} onOpenChange={setIsAppointmentTypeFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingAppointmentType ? 'Editar Tipo de Agendamento' : 'Novo Tipo de Agendamento'}</DialogTitle>
            <DialogDescription>
              {editingAppointmentType ? 'Ajuste os detalhes do tipo de agendamento.' : 'Crie um novo tipo de agendamento para sua empresa.'}
            </DialogDescription>
          </DialogHeader>
          <AppointmentTypeForm
            editingType={editingAppointmentType}
            onSuccess={() => {
              setIsAppointmentTypeFormOpen(false);
              fetchAppointmentTypes();
            }}
            onCancel={() => setIsAppointmentTypeFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Appointment Form Dialog */}
      <Dialog open={isAppointmentFormOpen} onOpenChange={setIsAppointmentFormOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Ajuste os detalhes do agendamento.' : 'Crie um novo agendamento para um cliente ou contrato.'}
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            editingAppointment={editingAppointment}
            onSuccess={() => {
              setIsAppointmentFormOpen(false);
              fetchAppointments();
            }}
            onCancel={() => setIsAppointmentFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SchedulingPage;