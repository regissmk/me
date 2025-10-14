import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, Package, Users, FileText, Camera, MessageSquare, ChevronDown, UserCog, Truck, Landmark, Shapes, FileSignature, Calendar, Banknote, ShoppingCart, ArrowLeftRight, PiggyBank, Receipt, CreditCard, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const navItems = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  {
    label: 'Contratos',
    icon: FileText,
    subItems: [
      { href: '/admin/contracts', icon: FileSignature, label: 'Contratos' },
      { href: '/admin/hires', icon: Users, label: 'Contratações' },
    ],
  },
  {
    label: 'Financeiro',
    icon: Banknote,
    subItems: [
      { href: '/admin/financial/orders', icon: ShoppingCart, label: 'Pedidos' },
      { href: '/admin/financial/cash-flow', icon: ArrowLeftRight, label: 'Caixa' },
      { href: '/admin/financial/accounts-payable', icon: Receipt, label: 'Contas a Pagar' },
      { href: '/admin/financial/accounts-receivable', icon: PiggyBank, label: 'Contas a Receber' },
      { href: '/admin/financial/gateway-operations', icon: CreditCard, label: 'Operações no Gateway' },
      { href: '/admin/financial-categories', icon: Shapes, label: 'Categorias Financeiras' }, // Moved here
      { href: '/admin/accounts', icon: Landmark, label: 'Contas Bancárias' }, // Moved here and renamed for clarity
    ],
  },
  {
    label: 'Cadastros',
    icon: Package,
    subItems: [
      { href: '/admin/users', icon: UserCog, label: 'Usuários' },
      { href: '/admin/clients', icon: Users, label: 'Clientes' },
      { href: '/admin/suppliers', icon: Truck, label: 'Fornecedores' },
    ],
  },
  { href: '/admin/products', icon: Package, label: 'Produtos' },
  { href: '/admin/plans', icon: Package, label: 'Planos' },
  { href: '/admin/galleries', icon: Camera, label: 'Galerias' },
  { href: '/admin/scheduling', icon: Calendar, label: 'Agendamento' },
  { href: '/admin/communications', icon: MessageSquare, label: 'Comunicação' },
  { href: '/admin/settings', icon: Settings, label: 'Configurações' },
];

const NavLink = ({ to, icon: Icon, label, pathname, isSubItem = false, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-accent',
      isSubItem && 'text-sm',
      pathname === to && 'bg-primary/10 text-primary font-semibold'
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

const NavContent = ({ closeSheet }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      toast({ title: 'Desconectado', description: 'Você foi desconectado com sucesso.' });
      navigate('/admin/login');
    }
    closeSheet();
  };

  return (
    <nav className="flex flex-col gap-2 p-4 h-full">
      <Link to="/admin" className="flex h-16 items-center px-2 mb-4" onClick={closeSheet}>
        <Camera className="h-8 w-8 text-primary" />
        <span className="font-display text-xl font-bold ml-2">Foto Escola</span>
      </Link>
      <div className="flex-1 overflow-y-auto"> {/* Added for scrollable navigation */}
        {navItems.map((item) =>
          item.subItems ? (
            <Collapsible key={item.label} className="flex flex-col gap-1" defaultOpen={item.subItems.some(sub => location.pathname.startsWith(sub.href))}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-primary hover:bg-accent cursor-pointer [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1 pl-7"
                >
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.href}
                      to={subItem.href}
                      icon={subItem.icon}
                      label={subItem.label}
                      pathname={location.pathname}
                      isSubItem
                      onClick={closeSheet}
                    />
                  ))}
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <NavLink
              key={item.href}
              to={item.href}
              icon={item.icon}
              label={item.label}
              pathname={location.pathname}
              onClick={closeSheet}
            />
          )
        )}
      </div>
      <div className="mt-auto pt-4 border-t border-border"> {/* Logout button at the bottom */}
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-accent" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </Button>
      </div>
    </nav>
  );
};

const AdminLayout = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex bg-background">
      <aside className="hidden w-72 flex-col border-r bg-card sm:flex">
        <NavContent closeSheet={() => {}} />
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
              <NavContent closeSheet={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
          {/* Header content can go here, e.g., user menu */}
          <div className="flex-1"></div> {/* Pushes content to the right */}
          <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => { /* Placeholder for user menu */ }}>
            <UserCog className="h-5 w-5" />
            <span className="sr-only">User Menu</span>
          </Button>
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

export default AdminLayout;