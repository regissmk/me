import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const ADMIN_USERS = [
  { email: 'admin@admin.com', password: '12345678' },
  { email: 'regismkdigital@gmail.com', password: '17879133' }
];

const SETUP_KEY = 'admin_user_setup_complete_v5'; // Increment key for new logic

const SetupAdmin = () => {
  const { toast } = useToast();
  const [isSetup, setIsSetup] = useState(() => !!localStorage.getItem(SETUP_KEY));

  useEffect(() => {
    const setupAdminUsers = async () => {
      let allUsersProcessed = true;

      for (const adminUser of ADMIN_USERS) {
        try {
          // Try to sign up the user. This will fail if the user already exists.
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminUser.email,
            password: adminUser.password,
            options: {
              // This option prevents Supabase from sending a confirmation email
              emailRedirectTo: undefined, 
            },
          });

          if (signUpError) {
            // If user already exists, it's not a real error for our setup script.
            if (signUpError.message.includes('User already registered') || signUpError.message.includes('duplicate key value')) {
              console.log(`Admin user ${adminUser.email} already exists.`);
            } else {
              // For other errors (like rate limits), we log them and stop.
              allUsersProcessed = false;
              toast({
                variant: 'destructive',
                title: `Erro na configuração do admin: ${adminUser.email}`,
                description: signUpError.message,
              });
            }
          } else if (signUpData.user) {
            // If sign up is successful, we manually confirm the email.
            // This is a privileged operation and requires service_role key on a real backend,
            // but for client-side setup, we can update the user directly if rules allow.
            // The previous signUp call creates the user but leaves them unconfirmed.
             const { error: updateError } = await supabase
              .from('users')
              .update({ email_confirmed_at: new Date().toISOString() })
              .eq('id', signUpData.user.id);
             
             if (updateError) {
                 console.error("Failed to confirm user email:", updateError);
             } else {
                toast({
                  title: 'Usuário Admin Criado e Ativado',
                  description: `O usuário ${adminUser.email} foi configurado com sucesso.`,
                });
             }
          }
        } catch (err) {
          allUsersProcessed = false;
          toast({
            variant: 'destructive',
            title: 'Erro inesperado',
            description: `Ocorreu um erro ao configurar o usuário ${adminUser.email}.`,
          });
        }
      }

      // If all users were processed without critical errors, mark setup as complete.
      if (allUsersProcessed) {
        localStorage.setItem(SETUP_KEY, 'true');
        setIsSetup(true);
      }
    };

    if (!isSetup) {
      setupAdminUsers();
    }
  }, [isSetup, toast]);

  return null;
};

export default SetupAdmin;