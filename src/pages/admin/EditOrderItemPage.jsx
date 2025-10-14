import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Home, Save } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const productionStatusOptions = [
    { value: 'em_producao', label: 'Em Produção' },
    { value: 'adquirido', label: 'Adquirido' },
    { value: 'entregue', label: 'Entregue' },
    { value: 'cancelado', label: 'Cancelado' },
];

const EditOrderItemPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [date, setDate] = useState(null);
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        toast({
            title: "🎉 Item do Pedido Atualizado!",
            description: "As alterações foram salvas com sucesso.",
        });
        navigate('/admin/order-items');
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
                <title>Editar Item do Pedido #{itemId} | Admin</title>
                <meta name="description" content={`Editando o item de pedido ${itemId}.`} />
            </Helmet>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 mb-8">
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between">
                         <div>
                            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Home className="h-4 w-4 mr-1.5" />
                                /
                                <span className="mx-1.5 cursor-pointer" onClick={() => navigate('/admin/order-items')}>Pedidos</span>
                                /
                                <span className="mx-1.5 text-foreground">Editar Item #{itemId}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Dados do Item</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="font-bold">REGINALDO SANTOS DA SILVA</p>
                                    <p className="text-sm text-muted-foreground">CPF: 225.803.556-26</p>
                                    <p className="text-sm text-muted-foreground">RG: </p>
                                    <p className="text-sm text-muted-foreground">End.: /</p>
                                    <p className="text-sm text-muted-foreground">Email: email@email.com</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="font-bold">Pedido #32259</p>
                                    <p className="text-sm text-muted-foreground">Forma de pagamento: Boleto</p>
                                    <p className="text-sm text-muted-foreground">Valor: R$ 0,00</p>
                                    <p className="text-sm text-muted-foreground">Reembolso: R$ 0,00</p>
                                    <p className="text-sm text-muted-foreground">Desconto de cupom: R$ 0,00</p>
                                    <p className="text-sm text-muted-foreground">Desconto à vista: R$ 0,00</p>
                                    <p className="text-sm text-muted-foreground">Desconto total: R$ 0,00</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="bg-gray-100 p-3 rounded-md mb-6">
                                <p className="font-semibold">LINK DIGITAL COM TODAS AS FOTOS DO DIA DOS PAIS</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                <div className="bg-gray-50 p-4 rounded-lg border md:col-span-1">
                                    <p className="font-bold">Item #{itemId}</p>
                                    <p className="text-sm text-muted-foreground">Valor: R$ 0,00</p>
                                    <p className="text-sm text-muted-foreground">Quantidade: 1</p>
                                    <p className="text-sm text-muted-foreground">Tag: </p>
                                    <p className="text-sm text-muted-foreground">Data de entrega: Não informado</p>
                                </div>
                                
                                <div className="space-y-2">
                                     <label className="text-sm font-medium">Data de entrega:</label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Escolha uma data</span>}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status de produção:</label>
                                    <Combobox 
                                        options={productionStatusOptions}
                                        value={status}
                                        onChange={setStatus}
                                        placeholder="Digite o Status"
                                        searchPlaceholder="Buscar status..."
                                        notFoundMessage="Nenhum status encontrado."
                                    />
                                </div>

                                <div className="md:col-span-3 flex justify-end">
                                    <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                        <Save className="mr-2 h-4 w-4" />
                                        Salvar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    );
};

export default EditOrderItemPage;