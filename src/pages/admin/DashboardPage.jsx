import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity, ArrowUp } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalRevenue: { value: 0, change: 0 },
    newClients: { value: 0, change: 0 },
    totalSales: { value: 0, change: 0 },
    activeGalleries: { value: 0, change: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const { data: revenueData } = await supabase
        .from('financial_transactions')
        .select('amount', { count: 'exact' })
        .eq('status', 'paid')
        .eq('type', 'income');
      const totalRevenue = revenueData?.reduce((sum, item) => sum + item.amount, 0) || 0;
      
      const { count: newClientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .gte('created_at', oneMonthAgo.toISOString());

      const { count: totalSalesCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .in('status', ['paid', 'completed']);

      const { count: activeGalleriesCount } = await supabase
        .from('galleries')
        .select('*', { count: 'exact' });

      setStats({
        totalRevenue: { value: totalRevenue, change: 12.5 },
        newClients: { value: newClientsCount || 0, change: 25 },
        totalSales: { value: totalSalesCount || 0, change: 5 },
        activeGalleries: { value: activeGalleriesCount || 0, change: 2 },
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Receita Total', value: `R$ ${stats.totalRevenue.value.toFixed(2)}`, icon: DollarSign, change: `+${stats.totalRevenue.change.toFixed(1)}%` },
    { title: 'Novos Clientes (Mês)', value: `+${stats.newClients.value}`, icon: Users, change: `${stats.newClients.change}%` },
    { title: 'Vendas Realizadas', value: stats.totalSales.value, icon: CreditCard, change: `${stats.totalSales.change}%` },
    { title: 'Galerias Ativas', value: stats.activeGalleries.value, icon: Activity, change: `+${stats.activeGalleries.change}` },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };
  
  const StatCard = ({ title, value, icon: Icon, change, loading }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md mt-1"></div>
            <div className="h-4 w-1/2 bg-muted/50 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold font-display">{value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="text-success flex items-center font-semibold">
                <ArrowUp className="h-3 w-3 mr-0.5" /> {change}
              </span>
              desde o último mês
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin</title>
        <meta name="description" content="Visão geral do sistema de fotografia escolar." />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold font-display tracking-tight">Dashboard</h1>
        <motion.div
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <StatCard {...stat} loading={loading} />
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-white">Bem-vindo(a) de volta! 👋</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Aqui você gerencia contratos, produtos, galerias e muito mais.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Use o menu à esquerda para navegar pelas seções. As funcionalidades serão adicionadas conforme você solicitar. Vamos começar?
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
};

export default DashboardPage;