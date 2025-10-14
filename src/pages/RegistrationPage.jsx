import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MultiStepIndicator from '@/components/MultiStepIndicator';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import WelcomeMessage from '@/components/WelcomeMessage'; // Import the updated WelcomeMessage

import Step1_CPF from '@/components/registration/Step1_CPF';
import Step2_ParentInfo from '@/components/registration/Step2_ParentInfo';
import Step3_ChildrenInfo from '@/components/registration/Step3_ChildrenInfo';
import Step4_PlanSelection from '@/components/registration/Step4_PlanSelection';
import Step5_Conclusion from '@/components/registration/Step5_Conclusion';

const RegistrationPage = () => {
  const { toast } = useToast();
  const { contractSlug } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const stepLabels = [
    'CPF',
    'Dados do Responsável',
    'Dados do(s) Filho(s)',
    'Escolha do Plano',
    'Conclusão',
  ];

  const [contractData, setContractData] = useState({
    id: null,
    name: '',
    plans: [],
    products: []
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cpf: '',
    parentName: '',
    phone: '', // New field
    parentEmail: '',
    password: '',
    confirmPassword: '',
    children: [{ name: '', school: '', class: '', shift: '', dob: '', photoFile: null, photoPreview: null }], // Updated child structure
    selectedPlan: null,
    selectedProducts: [],
  });

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contractSlug) {
        toast({ variant: "destructive", title: 'Erro', description: 'Link de contrato inválido.' });
        navigate('/login');
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          name,
          contract_plans(plans(*)),
          contract_products(products(*))
        `)
        .eq('invite_link_id', contractSlug)
        .single();

      if (error || !data) {
        toast({ variant: "destructive", title: 'Contrato não encontrado', description: 'O link de cadastro pode estar incorreto ou o contrato não existe mais.' });
        navigate('/login');
        return;
      }
      
      setContractData({
        id: data.id,
        name: data.name,
        plans: (data.contract_plans || []).map(p => p.plans).filter(Boolean), // Fixed: Ensure contract_plans is an array
        products: (data.contract_products || []).map(p => p.products).filter(Boolean), // Fixed: Ensure contract_products is an array
      });

      setFormData(prev => ({
        ...prev,
        children: prev.children.map(child => ({ ...child, school: data.name })) // Set school from contract name
      }));
      
      toast({
          title: `🎉 Bem-vindo(a) ao cadastro de ${data.name}!`,
          description: `Siga os passos para concluir seu cadastro.`,
      });
      setLoading(false);
    };

    fetchContractData();
  }, [contractSlug, toast, navigate]);

  const nextStep = () => {
    if (currentStep === 1 && !formData.cpf) {
      toast({ variant: "destructive", title: 'Erro', description: 'Por favor, insira seu CPF.' });
      return;
    }
    if (currentStep === 2) {
        if (!formData.parentName || !formData.phone || !formData.parentEmail || !formData.password || !formData.confirmPassword) {
            toast({ variant: "destructive", title: 'Erro', description: 'Por favor, preencha todos os campos de responsável.' });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast({ variant: "destructive", title: 'Erro', description: 'As senhas não coincidem.' });
            return;
        }
    }
    if (currentStep === 3 && formData.children.some(child => !child.name || !child.dob)) {
      toast({ variant: "destructive", title: 'Erro', description: 'Por favor, preencha o nome e data de nascimento de todos os filhos.' });
      return;
    }
    if (currentStep === 4 && !formData.selectedPlan && formData.selectedProducts.length === 0) {
      toast({ variant: "destructive", title: 'Erro', description: 'Por favor, selecione um plano ou pelo menos um produto avulso.' });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("Iniciando processo de cadastro...");

    // 1. Create user via Edge Function to bypass rate limits
    const { data: edgeFunctionData, error: edgeFunctionError } = await supabase.functions.invoke('register-client-user', {
      body: {
        email: formData.parentEmail,
        password: formData.password,
        first_name: formData.parentName.split(' ')[0],
        last_name: formData.parentName.split(' ').slice(1).join(' '),
      },
    });

    if (edgeFunctionError) {
      console.error("Erro de Cadastro: Falha na Edge Function de cadastro de usuário", edgeFunctionError);
      toast({ variant: "destructive", title: 'Erro ao criar usuário', description: edgeFunctionError.message });
      setIsSubmitting(false);
      return;
    }
    
    const userId = edgeFunctionData.userId;
    if (!userId) {
        console.error("Erro de Cadastro: ID do usuário não obtido após o cadastro pela Edge Function.");
        toast({ variant: "destructive", title: 'Erro', description: 'Não foi possível obter o ID do usuário criado.' });
        setIsSubmitting(false);
        return;
    }
    console.log("Etapa 1 de Cadastro: Usuário criado com sucesso via Edge Function. ID:", userId);

    // 2. Create client
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        cpf: formData.cpf,
        parent_name: formData.parentName,
        phone: formData.phone, // New phone field
        email: formData.parentEmail,
      })
      .select()
      .single();

    if (clientError) {
      console.error("Erro de Cadastro: Falha ao inserir cliente", clientError);
      toast({ variant: "destructive", title: 'Erro ao salvar dados do responsável', description: clientError.message });
      // Potentially delete the created user to allow retry
      // Note: Deleting user from auth.users requires service_role key, which is not available client-side.
      // In a real backend, you would handle this cleanup.
      setIsSubmitting(false);
      return;
    }
    console.log("Etapa 2 de Cadastro: Cliente criado com sucesso. ID:", clientData.id);

    // 3. Create children and upload photos
    const childrenToInsert = [];
    for (const child of formData.children) {
      let profilePhotoUrl = null;
      if (child.photoFile) {
        const fileExtension = child.photoFile.name.split('.').pop();
        const fileName = `${clientData.id}/${child.name.replace(/\s/g, '_')}_${Date.now()}.${fileExtension}`; // Store under client ID for organization

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('child_profile_photos')
          .upload(fileName, child.photoFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn("Aviso de Cadastro: Erro ao fazer upload da foto do filho", uploadError);
          toast({ variant: "warning", title: 'Aviso', description: `Erro ao fazer upload da foto para ${child.name}: ${uploadError.message}` });
          // Continue without photo, or handle error more strictly
        } else {
          const { data: publicUrlData } = supabase.storage.from('child_profile_photos').getPublicUrl(uploadData.path);
          profilePhotoUrl = publicUrlData.publicUrl;
        }
      }

      childrenToInsert.push({
        client_id: clientData.id,
        name: child.name,
        birth_date: child.dob,
        school_course: `${child.school} - ${child.class} (${child.shift})`, // Keep combined for now
        profile_photo_url: profilePhotoUrl,
      });
    }

    const { error: childrenError } = await supabase.from('children').insert(childrenToInsert);

    if (childrenError) {
      console.error("Erro de Cadastro: Falha ao inserir dados dos filhos", childrenError);
      toast({ variant: "destructive", title: 'Erro ao salvar dados dos filhos', description: childrenError.message });
      setIsSubmitting(false);
      return;
    }
    console.log("Etapa 3 de Cadastro: Filhos criados com sucesso.");

    // 4. Create Order and Order Items
    let totalAmount = 0;
    let itemsToInsert = [];

    if (formData.selectedPlan) {
        const plan = contractData.plans.find(p => p.id === formData.selectedPlan);
        if (plan) {
            totalAmount = plan.price;
            itemsToInsert.push({ product_id: null, plan_id: plan.id, quantity: 1, price: plan.price, item_type: 'plan' });
        }
    } else {
        formData.selectedProducts.forEach(productId => {
            const product = contractData.products.find(p => p.id === productId);
            if (product) {
                totalAmount += product.price;
                itemsToInsert.push({ product_id: product.id, plan_id: null, quantity: 1, price: product.price, item_type: 'product' });
            }
        });
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        client_id: clientData.id,
        contract_id: contractData.id,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error("Erro de Cadastro: Falha ao criar pedido", orderError);
      toast({ variant: "destructive", title: 'Erro ao criar pedido', description: orderError.message });
      setIsSubmitting(false);
      return;
    }
    console.log("Etapa 4 de Cadastro: Pedido criado com sucesso. ID:", orderData.id);

    const orderItemsToInsert = itemsToInsert.map(item => ({ ...item, order_id: orderData.id }));
    const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

    if (orderItemsError) {
      console.error("Erro de Cadastro: Falha ao salvar itens do pedido", orderItemsError);
      toast({ variant: "destructive", title: 'Erro ao salvar itens do pedido', description: orderItemsError.message });
      setIsSubmitting(false);
      return;
    }
    console.log("Etapa 4 de Cadastro: Itens do pedido criados com sucesso.");

    // 5. Send WhatsApp welcome message via Edge Function
    const clientDashboardLink = `${window.location.origin}/client/dashboard`;
    const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp-message', {
      body: {
        name: formData.parentName.split(' ')[0], // Use first name for personalization
        phone: formData.phone.replace(/\D/g, ''), // Send only digits for phone number
        clientDashboardLink: clientDashboardLink,
        messageType: 'welcome', // Specify message type
      },
    });

    if (whatsappError) {
      console.warn('Aviso de Cadastro: Falha na função Edge do WhatsApp', whatsappError);
      toast({
        variant: "warning",
        title: 'Cadastro Concluído, mas falha no WhatsApp',
        description: 'Seu cadastro foi concluído, mas não foi possível enviar a mensagem de boas-vindas no WhatsApp.',
      });
    } else {
      console.log("Etapa 5 de Cadastro: Mensagem do WhatsApp enviada/simulada com sucesso.");
      toast({
        title: '✅ Cadastro Concluído!',
        description: 'Seu cadastro foi enviado com sucesso e uma mensagem de boas-vindas foi enviada para o seu WhatsApp!',
      });
    }

    navigate('/client/dashboard'); // Redirect to client dashboard
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_CPF formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2_ParentInfo formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3_ChildrenInfo formData={formData} setFormData={setFormData} toast={toast} contractName={contractData.name} />;
      case 4:
        return <Step4_PlanSelection formData={formData} setFormData={setFormData} plans={contractData.plans} products={contractData.products} />;
      case 5:
        return <Step5_Conclusion formData={formData} plans={contractData.plans} products={contractData.products} />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40">
            <p>Carregando informações do contrato...</p>
        </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Cadastro | {contractData.name}</title>
        <meta name="description" content={`Cadastre-se em 5 etapas para o evento ${contractData.name}.`} />
      </Helmet>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50"
      >
        <div className="w-full max-w-3xl">
          <WelcomeMessage /> {/* Display the welcome message */}
          <MultiStepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            labels={stepLabels}
          />

          <motion.div
            key={currentStep}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
          >
            <Card className="w-full rounded-xl shadow-lg"> {/* Added rounded-xl and shadow-lg */}
              <CardHeader>
                <CardTitle className="text-2xl">
                  {stepLabels[currentStep - 1]}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Por favor, insira seu CPF para iniciar o cadastro.'}
                  {currentStep === 2 && 'Preencha seus dados para criar sua conta.'}
                  {currentStep === 3 && `Adicione as informações do(s) seu(s) filho(s) para o evento ${contractData.name}.`}
                  {currentStep === 4 && 'Escolha o plano ou produtos desejados.'}
                  {currentStep === 5 && 'Revise suas informações e finalize o cadastro.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderStep()}
              </CardContent>
              <CardFooter className="flex justify-between">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isSubmitting}
                  >
                    Voltar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90" // Apply new primary color
                  >
                    {isSubmitting ? 'Finalizando...' : (currentStep < totalSteps ? 'Próximo' : 'Finalizar Cadastro')}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default RegistrationPage;