import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart as ShoppingCartIcon, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import ProductCard from '@/components/client/ProductCard'; // NEW: Import ProductCard
import { useAuth } from '@/contexts/SupabaseAuthContext'; // NEW: Import useAuth

const ShopPage = () => {
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true) // Only show active products
        .order('name', { ascending: true });

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar produtos', description: error.message });
      } else {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [toast]);

  const handleAddToCart = async (product) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você precisa estar logado para comprar produtos.' });
      return;
    }

    // For simplicity, we'll simulate a direct purchase and create an order.
    // In a real application, this would involve a shopping cart, checkout process, and payment gateway integration.
    try {
      // 1. Get client ID
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientData) {
        throw new Error(clientError?.message || 'Client not found.');
      }

      // 2. Create a new order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: clientData.id,
          total_amount: product.price,
          status: 'pending', // Status will be 'pending' until payment
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Add product as an order item
      const { error: orderItemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderData.id,
          product_id: product.id,
          quantity: 1,
          price: product.price,
          item_type: 'product',
        });

      if (orderItemError) throw orderItemError;

      toast({
        title: '✅ Produto Adicionado ao Pedido!',
        description: `"${product.name}" foi adicionado ao seu pedido. Prossiga para o pagamento.`,
      });
      // Optionally, redirect to a "My Order" page or checkout
      // navigate('/client/my-order');

    } catch (error) {
      console.error('Erro ao adicionar produto ao pedido:', error);
      toast({ variant: 'destructive', title: 'Erro ao comprar produto', description: error.message });
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
        <title>Loja | Cliente</title>
        <meta name="description" content="Explore e compre produtos adicionais." />
      </Helmet>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">Loja de Produtos</h1>
          <p className="text-muted-foreground">Encontre produtos exclusivos para eternizar seus momentos.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCartIcon className="h-5 w-5 text-primary" />
                Nossos Produtos
              </CardTitle>
              <CardDescription>Navegue por nossa seleção de álbuns, impressões e muito mais.</CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando produtos...</p>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-muted-foreground">Nenhum produto disponível ainda.</p>
                  <p className="text-sm text-muted-foreground mt-2">Volte em breve para ver as novidades!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default ShopPage;