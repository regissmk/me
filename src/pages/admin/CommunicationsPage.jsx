import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Upload,
  PlusCircle,
  Send,
  Trash2,
  Edit,
  Download,
  Users2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const mockContacts = [
  { id: 1, name: 'Ana Silva', phone: '11987654321', email: 'ana.silva@example.com' },
  { id: 2, name: 'Carlos Pereira', phone: '21912345678', email: 'carlos.p@example.com' },
];

const mockGroups = [
  { id: 1, name: 'Formatura 2025 - Turma A', memberCount: 35, status: 'Enviado' },
  { id: 2, name: 'Dia das Crianças - VIP', memberCount: 12, status: 'Pendente' },
]

const CommunicationsPage = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState(mockContacts);
  const [groups, setGroups] = useState(mockGroups);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '' });
  const [newGroup, setNewGroup] = useState({ name: '', members: [] });
  const [newGroupMemberPhone, setNewGroupMemberPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewContact((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'Nome e Telefone são obrigatórios.',
      });
      return;
    }
    setContacts((prev) => [...prev, { ...newContact, id: Date.now() }]);
    setNewContact({ name: '', phone: '', email: '' });
    toast({
      title: '✅ Contato Adicionado!',
      description: `${newContact.name} foi adicionado à sua lista.`,
    });
    document.getElementById('close-contact-dialog').click();
  };
  
  const handleAddGroupMember = () => {
    if (!newGroupMemberPhone) return;
    setNewGroup(prev => ({
        ...prev,
        members: [...prev.members, { id: Date.now(), phone: newGroupMemberPhone, name: 'Novo Membro', email: ''}]
    }));
    setNewGroupMemberPhone('');
  }

  const handleSaveGroup = () => {
    if (!newGroup.name) {
      toast({ variant: 'destructive', title: 'Erro', description: 'O nome do grupo é obrigatório.' });
      return;
    }
    setGroups(prev => [...prev, { ...newGroup, id: Date.now(), memberCount: newGroup.members.length, status: 'Pendente' }]);
    setNewGroup({ name: '', members: [] });
    toast({ title: '✅ Grupo Criado!', description: 'O novo grupo de envio foi salvo.' });
    document.getElementById('close-group-dialog').click();
  }

  const handleImportCSV = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'Você poderá solicitar esta implementação em breve! 🚀',
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    toast({
      title: '✅ Mensagens Enviadas!',
      description: `Sua mensagem foi enviada para os grupos selecionados.`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      <Helmet>
        <title>Comunicação | Admin</title>
        <meta name="description" content="Envie mensagens por WhatsApp e E-mail para seus contatos." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Comunicação</h1>

        <Tabs defaultValue="messages">
          <TabsList className="grid w-full grid-cols-2 md:w-[500px]">
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-2" />Mensagens</TabsTrigger>
            <TabsTrigger value="groups"><Users2 className="w-4 h-4 mr-2" />Grupos de Envio</TabsTrigger>
            {/* <TabsTrigger value="contacts"><Users className="w-4 h-4 mr-2" />Contatos</TabsTrigger> */}
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <form onSubmit={handleSendMessage}>
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Enviar Mensagem</CardTitle>
                    <CardDescription>Crie e envie mensagens personalizadas para seus grupos.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="message">Editor de Mensagem</Label>
                        <Textarea
                          id="message"
                          placeholder="Digite sua mensagem aqui..."
                          className="min-h-[250px]"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <div>
                          <p className="text-sm font-medium">Variáveis disponíveis:</p>
                          <p className="text-xs text-muted-foreground">
                            {'{nome}'}, {'{email}'}, {'{contrato}'}, {'{desconto}'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label>Pré-visualização (Exemplo)</Label>
                        <div className="border rounded-lg p-4 bg-muted/50 min-h-[250px] whitespace-pre-wrap text-sm">
                          <p className="font-bold mb-2">🎓 Bem-vindo(a), João!</p>
                          <p>Seu cadastro foi realizado com sucesso!</p>
                          <p>📱 Acesse: minhaempresa.com/login</p>
                          <p>✉️ Login: joao@email.com</p>
                          <p>📋 Contrato: Escola ABC - Formatura 2025</p>
                          <p>💰 Desconto à vista: 10%</p>
                          <p>Em breve você receberá acesso às galerias!</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end gap-2">
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </form>
          </TabsContent>
          
          {/* Groups Tab */}
          <TabsContent value="groups">
             <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Grupos de Envio</CardTitle>
                          <CardDescription>Gerencie seus grupos para envio de mensagens em massa.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={handleImportCSV}><Download className="w-4 h-4 mr-2" />Exportar</Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button><PlusCircle className="w-4 h-4 mr-2" />Adicionar Grupo</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Adicionar Novo Grupo</DialogTitle>
                                <DialogDescription>Crie um novo grupo e adicione membros.</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="groupName">Nome do Grupo*</Label>
                                  <Input id="groupName" value={newGroup.name} onChange={(e) => setNewGroup(p => ({...p, name: e.target.value}))} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Importar Contatos</Label>
                                    <div className="flex gap-2 items-center">
                                        <Button type="button" variant="outline" onClick={handleImportCSV}><Upload className="w-4 h-4 mr-2" /> Importar CSV</Button>
                                        <p className="text-sm text-muted-foreground">Importe um arquivo CSV conforme o modelo.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Adicionar Membros Manualmente</Label>
                                    <div className="flex gap-2">
                                        <Input value={newGroupMemberPhone} onChange={(e) => setNewGroupMemberPhone(e.target.value)} placeholder="Digite o telefone com DDD" />
                                        <Button type="button" onClick={handleAddGroupMember}><PlusCircle className="w-4 h-4 mr-2" />Adicionar</Button>
                                    </div>
                                </div>
                                {newGroup.members.length > 0 && (
                                    <div className="border rounded-md max-h-48 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Telefone</TableHead>
                                                    <TableHead className="text-right">Ação</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {newGroup.members.map(m => (
                                                    <TableRow key={m.id}>
                                                        <TableCell>{m.phone}</TableCell>
                                                        <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setNewGroup(p => ({...p, members: p.members.filter(mem => mem.id !== m.id)}))}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                              </div>
                              <DialogFooter>
                                <DialogClose asChild><Button id="close-group-dialog" variant="ghost">Cancelar</Button></DialogClose>
                                <Button onClick={handleSaveGroup}>Salvar Grupo</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome do Grupo</TableHead>
                            <TableHead>Membros</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groups.map((group) => (
                            <TableRow key={group.id}>
                              <TableCell className="font-medium">{group.name}</TableCell>
                              <TableCell>{group.memberCount}</TableCell>
                              <TableCell>{group.status}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={handleImportCSV}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleImportCSV}><Trash2 className="h-4 w-4" /></Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default CommunicationsPage;