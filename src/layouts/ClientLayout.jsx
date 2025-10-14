import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Image, ShoppingCart, Receipt, Star, CalendarDays, Briefcase, Banknote, Download, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient'; // Import supabase client

const navItems = [
  { href: '/client/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/client/galleries', icon: Image, label: 'Galerias' },
  { href: '/client/shop', icon: ShoppingCart, label: 'Loja' },
  { href: '/client/my-order', icon: Receipt, label: 'Meu pedido' },
  { href: '/client/favorite-photos', icon: Star, label: 'Fotos favoritas' },
  { href: '/client/schedule', icon: CalendarDays, label: 'Agenda' },
  { href: '/client/hires', icon: Briefcase, label: 'Contratações' },
  { href: '/client/financial', icon: Banknote, label: 'Financeiro' },
];

const NavLink = ({ to, icon: Icon, label, pathname, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-accent',
      pathname === to && 'bg-primary/10 text-primary font-semibold'
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

const NavContent = ({ closeSheet, logoUrl }) => { // Accept logoUrl as prop
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({ title: 'Desconectado', description: 'Você foi desconectado com sucesso.' });
      navigate('/login');
    }
    closeSheet();
  };

  const handleDownloadContract = () => {
    toast({
      title: '🚧 Funcionalidade em construção!',
      description: 'O download do contrato será implementado em breve! 🚀',
    });
    closeSheet();
  };

  return (
    <nav className="flex flex-col gap-2 p-4 h-full">
      <Link to="/client/dashboard" className="flex h-16 items-center px-2 mb-4" onClick={closeSheet}>
        {logoUrl ? (
          <img src={logoUrl} alt="Memory School Fotografia Logo" className="h-8 w-auto object-contain" />
        ) : (
          <div className="h-8 w-auto flex items-center justify-center text-primary font-bold text-xl">
            MSF
          </div>
        )}
      </Link>
      <div className="flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            icon={item.icon}
            label={item.label}
            pathname={location.pathname}
            onClick={closeSheet}
          />
        ))}
      </div>
      <div className="mt-auto pt-4 border-t border-border space-y-2">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent" onClick={handleDownloadContract}>
          <Download className="h-4 w-4 mr-3" />
          Baixar contrato
        </Button>
        <div className="mt-4 p-2 text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Grupo Memory</p>
          <p>ALAMEDA SALVADOR, 1057(EDF. SALVADOR SHOPPING BUSINESS TORRE AMERICA SALA 911 E 912) - CAMINHO DAS ÁRVORES - SALVADOR / BA, 41820790</p>
        </div>
      </div>
    </nav>
  );
};

const ClientLayout = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loadingLogo, setLoadingLogo] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLogo = async () => {
      setLoadingLogo(true);
      const { data, error } = await supabase
        .from('settings')
        .select('logo_url')
        .eq('id', 1) // Assuming '1' is the ID for global settings
        .maybeSingle();

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao carregar logo', description: error.message });
      } else if (data && data.logo_url) {
        setLogoUrl(data.logo_url);
      }
      setLoadingLogo(false);
    };
    fetchLogo();
  }, [toast]);

  return (
    <div className="min-h-screen w-full flex bg-background">
      <aside className="hidden w-72 flex-col border-r bg-card sm:flex">
        <NavContent closeSheet={() => {}} logoUrl={logoUrl} />
      </aside>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs p-0 bg-card">
              <NavContent closeSheet={() => setIsSheetOpen(false)} logoUrl={logoUrl} />
            </SheetContent>
          </Sheet>
          <div className="flex-1"></div>
          {/* Placeholder for user menu or other header content */}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;