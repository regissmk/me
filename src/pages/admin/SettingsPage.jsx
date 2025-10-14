import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Palette, Link as LinkIcon, CreditCard, Save, Upload, FileText as FileTextIcon, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/lib/customSupabaseClient';

const SettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    id: 1,
    fantasy_name: '',
    logo_url: '',
    presentation_image_url: '',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    terms_of_use: '',
    whatsapp_api_key: '',
    email_api_key: '',
    payment_api_key: '',
    company_address: '', // New field
    company_phone: '',   // New field
    company_email: '',   // New field
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data) {
        setSettings(data);
      } else if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar configurações', description: error.message });
      } else {
        // No data and no error means the row doesn't exist, which is fine.
        // The form will be pre-filled with initial state.
        // The first save will be an insert.
      }
      setLoading(false);
    };

    fetchSettings();
  }, [toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = async (e) => {
    const { id, files } = e.target;
    const file = files[0];
    if (!file) return;

    const bucket = id === 'logo_url' ? 'logos' : 'presentation_images';
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: uploadError.message });
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    setSettings(prev => ({ ...prev, [id]: urlData.publicUrl }));
    toast({ title: '🖼️ Imagem Carregada!', description: 'Clique em "Salvar Alterações" para confirmar.' });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSave = { ...settings, updated_at: new Date() };

    const { error } = await supabase
      .from('settings')
      .upsert(dataToSave, { onConflict: 'id' });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: '✅ Configurações Salvas!', description: 'Suas alterações foram salvas com sucesso.' });
    }
    setLoading(false);
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
        <title>Configurações | Admin</title>
        <meta name="description" content="Gerencie as configurações gerais da sua empresa e sistema." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

        {loading ? <p>Carregando configurações...</p> : (
          <form onSubmit={handleSaveSettings}>
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Aparência</TabsTrigger>
                <TabsTrigger value="company-options"><Building className="w-4 h-4 mr-2" />Opções da Empresa</TabsTrigger> {/* New Tab Trigger */}
                <TabsTrigger value="terms"><FileTextIcon className="w-4 h-4 mr-2" />Termos</TabsTrigger>
                <TabsTrigger value="integrations"><LinkIcon className="w-4 h-4 mr-2" />Integrações</TabsTrigger>
                <TabsTrigger value="billing"><CreditCard className="w-4 h-4 mr-2" />Faturamento</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Aparência e Marca</CardTitle>
                      <CardDescription>Personalize a aparência do sistema com sua marca.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <div className="space-y-2">
                          <Label htmlFor="fantasy_name">Nome Fantasia*</Label>
                          <Input id="fantasy_name" value={settings.fantasy_name || ''} onChange={handleInputChange} />
                        </div>
                      <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <Label>Logotipo</Label>
                              <div className="flex items-center gap-4">
                                  <Button type="button" variant="outline" onClick={() => document.getElementById('logo_url').click()}>
                                  <Upload className="w-4 h-4 mr-2" /> Carregar Logo
                                  </Button>
                                  <Input id="logo_url" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                  {settings.logo_url && <img src={settings.logo_url} alt="Logo Preview" className="h-10 w-auto object-contain" />}
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label>Imagem de Apresentação (Login)</Label>
                              <div className="flex items-center gap-4">
                                  <Button type="button" variant="outline" onClick={() => document.getElementById('presentation_image_url').click()}>
                                  <Upload className="w-4 h-4 mr-2" /> Carregar Imagem
                                  </Button>
                                  <Input id="presentation_image_url" type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
                                  {settings.presentation_image_url && <img src={settings.presentation_image_url} alt="Presentation Preview" className="h-10 w-auto object-contain" />}
                              </div>
                          </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="primary_color">Cor Primária</Label>
                          <div className="flex items-center gap-2">
                            <Input id="primary_color" type="color" value={settings.primary_color || '#000000'} onChange={handleInputChange} className="p-1 h-10 w-14" />
                            <span className="font-mono text-sm">{settings.primary_color}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secondary_color">Cor Secundária</Label>
                          <div className="flex items-center gap-2">
                            <Input id="secondary_color" type="color" value={settings.secondary_color || '#ffffff'} onChange={handleInputChange} className="p-1 h-10 w-14" />
                            <span className="font-mono text-sm">{settings.secondary_color}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* New Tab Content for Company Options */}
              <TabsContent value="company-options">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Opções da Empresa</CardTitle>
                      <CardDescription>Gerencie os dados de contato e endereço da sua empresa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="company_address">Endereço da Empresa</Label>
                        <Input id="company_address" placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF" value={settings.company_address || ''} onChange={handleInputChange} />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_phone">Telefone da Empresa</Label>
                          <Input id="company_phone" type="tel" placeholder="(XX) XXXXX-XXXX" value={settings.company_phone || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_email">Email da Empresa</Label>
                          <Input id="company_email" type="email" placeholder="contato@suaempresa.com" value={settings.company_email || ''} onChange={handleInputChange} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="terms">
                  <motion.div variants={itemVariants}>
                      <Card>
                          <CardHeader>
                              <CardTitle>Termos de Uso</CardTitle>
                              <CardDescription>Edite os termos e condições de uso da plataforma.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <ReactQuill 
                                  theme="snow" 
                                  value={settings.terms_of_use || ''} 
                                  onChange={(value) => setSettings(prev => ({ ...prev, terms_of_use: value }))}
                                  style={{ minHeight: '300px' }}
                              />
                          </CardContent>
                      </Card>
                  </motion.div>
              </TabsContent>

              <TabsContent value="integrations">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Integrações</CardTitle>
                      <CardDescription>Conecte o sistema a serviços de terceiros.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_api_key">API Key do WhatsApp</Label>
                        <Input id="whatsapp_api_key" type="password" placeholder="••••••••••••••••••••" value={settings.whatsapp_api_key || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_api_key">API Key do Provedor de Email</Label>
                        <Input id="email_api_key" type="password" placeholder="••••••••••••••••••••" value={settings.email_api_key || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment_api_key">API Key do Gateway de Pagamento</Label>
                        <Input id="payment_api_key" type="password" placeholder="••••••••••••••••••••" value={settings.payment_api_key || ''} onChange={handleInputChange} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

               <TabsContent value="billing">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Faturamento e Assinatura</CardTitle>
                      <CardDescription>Gerencie sua assinatura e visualize seu histórico de faturamento.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                      <p className="text-lg font-semibold">Você está no plano Profissional.</p>
                      <p className="text-muted-foreground mt-2">Sua próxima fatura será em 1 de Outubro de 2025.</p>
                      <Button className="mt-4" onClick={() => toast({title: "🚧 Funcionalidade em construção!"})}>Gerenciar Assinatura</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

            </Tabs>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </>
  );
};

export default SettingsPage;