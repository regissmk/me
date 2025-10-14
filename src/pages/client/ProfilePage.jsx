import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, UploadCloud } from 'lucide-react'; // NEW: Import UploadCloud icon
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { formatInput } from '@/lib/utils';

const ProfilePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cpf: '',
    avatar_url: '', // NEW: Add avatar_url to state
  });
  const [avatarFile, setAvatarFile] = useState(null); // NEW: State for new avatar file
  const [avatarPreview, setAvatarPreview] = useState(null); // NEW: State for avatar preview

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            first_name,
            last_name,
            avatar_url,
            clients (
              cpf,
              phone,
              email
            )
          `)
          .eq('id', user.id)
          .single();

        if (error || !data || !data.clients) {
          throw new Error(error?.message || 'Profile data not found.');
        }

        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.clients.email || '',
          phone: formatInput(data.clients.phone || '', 'phone'),
          cpf: formatInput(data.clients.cpf || '', 'cpf'),
          avatar_url: data.avatar_url || '',
        });
        setAvatarPreview(data.avatar_url || null); // Set initial preview
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar perfil', description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: formatInput(value, id === 'phone' ? 'phone' : id === 'cpf' ? 'cpf' : null) }));
  };

  // NEW: Handle avatar file change
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    let newAvatarUrl = profile.avatar_url;

    try {
      // NEW: Upload new avatar if a file is selected
      if (avatarFile) {
        const fileExtension = avatarFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
        const filePath = `avatars/${fileName}`; // Store under 'avatars' folder in bucket

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile_avatars') // Use the new bucket
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true, // Overwrite if file with same name exists (though we use timestamped names)
          });

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da foto de perfil: ${uploadError.message}`);
        }
        const { data: publicUrlData } = supabase.storage.from('profile_avatars').getPublicUrl(uploadData.path);
        newAvatarUrl = publicUrlData.publicUrl;
      }

      // Update profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: newAvatarUrl, // NEW: Update avatar_url
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Update clients table
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({
          phone: profile.phone.replace(/\D/g, ''), // Save raw phone number
          parent_name: `${profile.first_name} ${profile.last_name}`.trim(),
        })
        .eq('user_id', user.id);

      if (clientUpdateError) throw clientUpdateError;

      toast({ title: '✅ Perfil Atualizado!', description: 'Suas informações foram salvas com sucesso.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar perfil', description: error.message });
    } finally {
      setLoading(false);
    }
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
        <title>Perfil | Cliente</title>
        <meta name="description" content="Gerencie suas informações de perfil." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">Atualize suas informações pessoais e de contato.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>Mantenha suas informações atualizadas.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Carregando dados do perfil...</p>
              ) : (
                <form onSubmit={handleSaveProfile} className="grid gap-4 md:grid-cols-2">
                  {/* NEW: Avatar Upload */}
                  <div className="md:col-span-2 flex flex-col items-center gap-4 mb-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 flex items-center justify-center bg-muted">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-20 h-20 text-muted-foreground" />
                      )}
                      <Input 
                        id="avatar_url" 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={handleAvatarChange} 
                      />
                      <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90">
                        <UploadCloud className="h-4 w-4" />
                      </div>
                    </div>
                    <Label htmlFor="avatar_url" className="cursor-pointer text-sm text-muted-foreground">
                      Clique para alterar a foto de perfil
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="first_name">Primeiro Nome</Label>
                    <Input id="first_name" placeholder="Seu primeiro nome" value={profile.first_name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Sobrenome</Label>
                    <Input id="last_name" placeholder="Seu sobrenome" value={profile.last_name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" value={profile.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" value={profile.phone} onChange={handleInputChange} maxLength={15} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" type="text" placeholder="000.000.000-00" value={profile.cpf} onChange={handleInputChange} maxLength={14} disabled />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" disabled={loading}>Salvar Alterações</Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ProfilePage;