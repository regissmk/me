import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SupplierFormPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(supplierId);

  const [personType, setPersonType] = useState('fisico');
  const [contacts, setContacts] = useState([{ name: '', function: '', phone: '', email: '' }]);

  useEffect(() => {
    if (isEditing) {
      toast({
        title: 'Carregando dados...',
        description: 'Buscando informações do fornecedor para edição.',
      });
    }
  }, [isEditing, toast]);
  
  const handleAddContact = () => {
    setContacts([...contacts, { name: '', function: '', phone: '', email: '' }]);
  };

  const handleRemoveContact = (index) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: `🎉 ${isEditing ? 'Fornecedor Atualizado!' : 'Fornecedor Cadastrado!'}`,
      description: `Os dados do fornecedor foram salvos com sucesso.`,
    });
    navigate('/admin/suppliers');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'} | Admin</title>
      </Helmet>
      <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 mb-8">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</CardTitle>
              <CardDescription>Preencha os dados abaixo para {isEditing ? 'atualizar o' : 'cadastrar um novo'} fornecedor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tipo de pessoa</Label>
                <RadioGroup defaultValue="fisico" onValueChange={setPersonType} className="flex items-center gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisico" id="r1" />
                    <Label htmlFor="r1">Físico</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridico" id="r2" />
                    <Label htmlFor="r2">Jurídico</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{personType === 'fisico' ? 'Nome*' : 'Nome Fantasia*'}</Label>
                  <Input id="name" placeholder={personType === 'fisico' ? 'Digite o Nome Completo' : 'Digite o Nome Fantasia'} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc">{personType === 'fisico' ? 'CPF*' : 'CNPJ*'}</Label>
                  <Input id="doc" placeholder={personType === 'fisico' ? 'Digite o CPF' : 'Digite o CNPJ'} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{personType === 'fisico' ? 'Email' : 'Razão Social'}</Label>
                  <Input id="email" placeholder={personType === 'fisico' ? 'Digite o Email' : 'Digite a Razão Social'} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="https://exemplo.com" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="Digite o CEP" />
                </div>
                 <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" placeholder="Digite o Endereço" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" placeholder="Digite o Número" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input id="complement" placeholder="Digite o Complemento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" placeholder="Digite o Bairro" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="Digite a Cidade" />
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF</Label>
                    <Input id="uf" placeholder="Digite o Estado" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-fixed">Telefone Fixo</Label>
                    <Input id="phone-fixed" placeholder="Digite o Telefone Fixo" />
                  </div>
                </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank">Banco</Label>
                            <Input id="bank" placeholder="Nome do Banco"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="agency">Agência</Label>
                            <Input id="agency" placeholder="0000"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account">Conta</Label>
                            <Input id="account" placeholder="00000-0"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="pix-type">Tipo de Chave PIX</Label>
                            <Input id="pix-type" placeholder="CNPJ, Email, Telefone..."/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pix-key">Chave PIX</Label>
                            <Input id="pix-key" placeholder="Digite a chave PIX"/>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contatos</CardTitle>
                <CardDescription>Adicione pessoas de contato deste fornecedor.</CardDescription>
              </div>
               <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Contato
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={index} className="space-y-4 rounded-lg border p-4 relative">
                   <p className="font-semibold">Contato N° {index + 1}</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input placeholder="Nome do Contato" />
                        </div>
                        <div className="space-y-2">
                            <Label>Função</Label>
                            <Input placeholder="Função do Contato" />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input placeholder="Telefone do Contato" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="Email do Contato" />
                        </div>
                   </div>
                   {contacts.length > 1 && (
                     <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => handleRemoveContact(index)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/suppliers')}>Cancelar</Button>
          <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</Button>
        </motion.div>
      </motion.form>
    </>
  );
};

export default SupplierFormPage;