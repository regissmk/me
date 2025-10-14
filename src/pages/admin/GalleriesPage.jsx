import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FilePlus2, List, Save, UploadCloud, MoreHorizontal, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getFlaskBaseUrl } from '@/lib/utils'; // NEW: Import getFlaskBaseUrl

const GalleriesPage = () => {
  const { toast } = useToast();
  const [galleries, setGalleries] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [activeTab, setActiveTab] = useState('all-galleries');
  
  const initialGalleryState = { name: '', contract_id: '', tags: '', watermark_enabled: true, download_enabled: false, face_recognition_enabled: false, compare_with_profile_photos: true, show_background_photos: false, display_mode: 'all' };
  const [galleryData, setGalleryData] = useState(initialGalleryState);
  const [selectedPlans, setSelectedPlans] = useState([]);
  // Removed uploadedImages state as direct upload is moved to Flask

  const fetchData = async () => {
    setLoading(true);
    const { data: gData, error: gError } = await supabase.from('galleries').select('*, contracts(name)').order('created_at', { ascending: false });
    if(gError) toast({variant: 'destructive', title: 'Erro ao buscar galerias'}); else setGalleries(gData);

    const { data: cData, error: cError } = await supabase.from('contracts').select('*').order('name');
    if(cError) toast({variant: 'destructive', title: 'Erro ao buscar contratos'}); else setContracts(cData);

    const { data: pData, error: pError } = await supabase.from('plans').select('*').order('name');
    if(pError) toast({variant: 'destructive', title: 'Erro ao buscar planos'}); else setPlans(pData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setGalleryData(initialGalleryState);
    setSelectedPlans([]);
    // setUploadedImages([]); // Removed
    setEditingGallery(null);
    setActiveTab('all-galleries');
  };
  
  const handleEdit = async (gallery) => {
    setEditingGallery(gallery);
    setGalleryData(gallery);
    const {data} = await supabase.from('gallery_plans').select('plan_id').eq('gallery_id', gallery.id);
    if (data) {
        setSelectedPlans(data.map(p => p.plan_id));
    }
    setActiveTab('form-gallery');
  };

  const handleInputChange = (e) => setGalleryData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleSwitchChange = (id, checked) => setGalleryData((prev) => ({ ...prev, [id]: checked }));
  const handleSelectChange = (id, value) => setGalleryData((prev) => ({ ...prev, [id]: value }));
  const handlePlanSelection = (planId, checked) => setSelectedPlans(prev => checked ? [...prev, planId] : prev.filter(id => id !== planId));
  // Removed handleImageUpload as direct upload is moved to Flask

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    setLoading(true);
    let currentGalleryId;

    // 1. Save/Update Gallery in Supabase
    if(editingGallery) {
      const { data, error } = await supabase.from('galleries').update(galleryData).eq('id', editingGallery.id).select().single();
      if(error) { toast({variant: 'destructive', title: 'Erro ao atualizar galeria', description: error.message}); setLoading(false); return; }
      currentGalleryId = data.id;
    } else {
      const { data, error } = await supabase.from('galleries').insert([galleryData]).select().single();
      if(error) { toast({variant: 'destructive', title: 'Erro ao salvar galeria', description: error.message}); setLoading(false); return; }
      currentGalleryId = data.id;
    }
    
    // 2. Update associated plans in Supabase
    await supabase.from('gallery_plans').delete().eq('gallery_id', currentGalleryId);
    if(selectedPlans.length > 0){
      const galleryPlans = selectedPlans.map(planId => ({ gallery_id: currentGalleryId, plan_id: planId }));
      const { error: planError } = await supabase.from('gallery_plans').insert(galleryPlans);
      if (planError) {
        toast({variant: 'destructive', title: 'Erro ao associar planos à galeria', description: planError.message});
        setLoading(false);
        return;
      }
    }
    
    // 3. Synchronize with Flask backend
    try {
      const flaskBaseUrl = getFlaskBaseUrl();
      const syncResponse = await fetch(`${flaskBaseUrl}/api/sync-gallery-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentGalleryId, // Use Supabase gallery ID as Flask event ID
          name: galleryData.name,
          contract_id: galleryData.contract_id, // Use Supabase contract ID as Flask contract ID
        }),
      });

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json();
        throw new Error(errorData.error || 'Erro desconhecido ao sincronizar com o Flask.');
      }
      toast({ title: '✅ Galeria sincronizada com o Flask!', description: 'O evento correspondente foi criado/atualizado no backend.' });

    } catch (flaskError) {
      console.error('Erro ao sincronizar galeria com Flask:', flaskError);
      toast({ variant: 'destructive', title: 'Erro de Sincronização', description: `Falha ao sincronizar com o backend Flask: ${flaskError.message}` });
      setLoading(false);
      return;
    }
    
    toast({ title: `✅ Galeria ${editingGallery ? 'Atualizada' : 'Salva'} com Sucesso!` });
    resetForm();
    fetchData();
    setLoading(false);
  };
  
  const handleDeleteGallery = async (galleryId) => {
    setLoading(true);
    try {
      // Delete associated plans first
      await supabase.from('gallery_plans').delete().eq('gallery_id', galleryId);
      
      // Delete gallery from Supabase
      const { error: galleryDeleteError } = await supabase.from('galleries').delete().eq('id', galleryId);
      if (galleryDeleteError) throw galleryDeleteError;

      // Optionally, delete corresponding event from Flask (if implemented)
      const flaskBaseUrl = getFlaskBaseUrl();
      const deleteEventResponse = await fetch(`${flaskBaseUrl}/api/delete-event/${galleryId}`, { // NEW: Flask endpoint for deleting event
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!deleteEventResponse.ok) {
        const errorData = await deleteEventResponse.json();
        console.warn('Aviso: Falha ao deletar evento no Flask:', errorData.error);
        toast({ variant: 'warning', title: 'Aviso', description: `Galeria deletada, mas falha ao remover evento no Flask: ${errorData.error}` });
      } else {
        toast({ title: '🗑️ Galeria e Evento Flask deletados com sucesso!' });
      }

      toast({ title: '🗑️ Galeria deletada com sucesso!' }); 
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar galeria', description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (value) => {
    if (value === 'form-gallery' && !editingGallery) {
      resetForm();
      setEditingGallery(null);
    }
    setActiveTab(value);
  }

  return (
    <>
      <Helmet><title>Gestão de Galerias | Admin</title></Helmet>
      <motion.div initial="hidden" animate="visible" className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Galerias</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all-galleries"><List className="w-4 h-4 mr-2" />Todas as Galerias</TabsTrigger>
            <TabsTrigger value="form-gallery"><FilePlus2 className="w-4 h-4 mr-2" />{editingGallery ? 'Editar Galeria' : 'Nova Galeria'}</TabsTrigger>
          </TabsList>
          <TabsContent value="all-galleries">
            <Card><CardHeader><CardTitle>Todas as Galerias</CardTitle><CardDescription>Visualize e gerencie as galerias existentes.</CardDescription></CardHeader>
              <CardContent>
                <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Contrato</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {galleries.map((gallery) => (
                      <TableRow key={gallery.id}>
                        <TableCell className="font-medium">{gallery.name}</TableCell>
                        <TableCell>{gallery.contracts?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {/* NEW: Link to Flask Admin Event Details Page */}
                                <DropdownMenuItem onSelect={() => window.open(`${getFlaskBaseUrl()}/admin/evento/${gallery.id}`, '_blank')}>
                                  <List className="mr-2 h-4 w-4" /> Gerenciar Evento (Flask)
                                </DropdownMenuItem>
                                {/* NEW: Link to Flask Admin Tagging Page */}
                                <DropdownMenuItem onSelect={() => window.open(`${getFlaskBaseUrl()}/admin/evento/${gallery.id}/etiquetar`, '_blank')}>
                                  <Tag className="mr-2 h-4 w-4" /> Etiquetar Fotos (Flask)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(gallery)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem></AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>A galeria e todas as fotos serão deletadas permanentemente.</AlertDialogDescription></AlertDialogHeader>
                              <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteGallery(gallery.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction></AlertDialogFooter>
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
          <TabsContent value="form-gallery">
            <motion.form onSubmit={handleSaveGallery}>
              <Card>
                <CardHeader><CardTitle>{editingGallery ? 'Editar Galeria' : 'Cadastrar Nova Galeria'}</CardTitle><CardDescription>Preencha os detalhes para criar ou editar uma galeria.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  {/* Form fields */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Informações Gerais</h3>
                      <div><Label htmlFor="name">Nome da Galeria</Label><Input id="name" value={galleryData.name} onChange={handleInputChange} required /></div>
                      <div><Label htmlFor="contract_id">Contrato Associado</Label><Select onValueChange={(v) => handleSelectChange('contract_id', v)} value={galleryData.contract_id}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{contracts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label>Planos Vinculados</Label><div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">{plans.map((p) => (<div key={p.id} className="flex items-center space-x-2"><Checkbox id={`plan-${p.id}`} checked={selectedPlans.includes(p.id)} onCheckedChange={(c) => handlePlanSelection(p.id, c)} /><Label htmlFor={`plan-${p.id}`}>{p.name}</Label></div>))}</div></div>
                      <div><Label htmlFor="tags">Tags (separadas por vírgula)</Label><Input id="tags" value={galleryData.tags || ''} onChange={handleInputChange} /></div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Upload de Imagens</h3>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          As fotos são gerenciadas na página "Gerenciar Evento" do Flask.
                          <br />
                          Clique em "Salvar Galeria" e depois em "Gerenciar Evento" para adicionar fotos.
                        </p>
                      </div>
                      {/* Removed image upload input and preview */}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Configurações</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center space-x-2"><Switch id="watermark_enabled" checked={galleryData.watermark_enabled} onCheckedChange={(c) => handleSwitchChange('watermark_enabled', c)} /><Label htmlFor="watermark_enabled">Marca d'água</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="download_enabled" checked={galleryData.download_enabled} onCheckedChange={(c) => handleSwitchChange('download_enabled', c)} /><Label htmlFor="download_enabled">Liberar Download</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="face_recognition_enabled" checked={galleryData.face_recognition_enabled} onCheckedChange={(c) => handleSwitchChange('face_recognition_enabled', c)} /><Label htmlFor="face_recognition_enabled">Reconhecimento Facial</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="show_background_photos" checked={galleryData.show_background_photos} onCheckedChange={(c) => handleSwitchChange('show_background_photos', c)} /><Label htmlFor="show_background_photos">Mostrar Fotos de Fundo</Label></div>
                        <div className="flex items-center space-x-2"><Switch id="compare_with_profile_photos" checked={galleryData.compare_with_profile_photos} onCheckedChange={(c) => handleSwitchChange('compare_with_profile_photos', c)} /><Label htmlFor="compare_with_profile_photos">Comparar com Fotos de Perfil</Label></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />{loading ? 'Salvando...' : 'Salvar Galeria'}</Button>
                </CardFooter>
              </Card>
            </motion.form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default GalleriesPage;