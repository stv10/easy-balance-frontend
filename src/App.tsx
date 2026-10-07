import { useState } from 'react';
import { ApiProvider, useApi } from './context/ApiContext';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { AccountsSidebar } from './components/AccountsSidebar';
import { AddExpenseForm } from './components/AddExpenseForm';
import { MonthViewTab } from './components/MonthViewTab';
import { ConfigTab } from './components/ConfigTab';
import { TagManagementCard } from './components/TagManagementCard';
import { Toaster } from './components/ui/sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { CalendarDays, Settings } from 'lucide-react';

function AppContent() {
  const { token } = useApi();
  const [isMobileAccountsOpen, setIsMobileAccountsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'month' | 'config'>('month');

  if (!token) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col antialiased overflow-hidden">
      {/* Header with mobile accounts drawer toggle */}
      <Header onOpenAccounts={() => setIsMobileAccountsOpen(true)} />

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0 overflow-hidden">
        {/* Main columns for Tabs */}
        <div className="md:col-span-3 h-full flex flex-col min-h-0 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'month' | 'config')}
            className="w-full h-full flex flex-col gap-4 min-h-0 overflow-hidden"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs bg-muted/65 p-1 rounded-lg border border-border/50 shrink-0">
              <TabsTrigger value="month" className="flex items-center gap-1.5 text-xs font-semibold">
                <CalendarDays className="h-4 w-4" />
                Vista del Mes
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center gap-1.5 text-xs font-semibold">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="focus-visible:outline-none flex-1 min-h-0 lg:overflow-hidden overflow-y-auto flex flex-col">
              <MonthViewTab />
            </TabsContent>
            <TabsContent value="config" className="focus-visible:outline-none flex-1 min-h-0 overflow-y-auto pr-1">
              <ConfigTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Right Column Slot: Accounts & AddExpense on 'month', TagManagementCard on 'config' */}
        <div className="hidden md:flex md:col-span-1 flex-col gap-6 h-full min-h-0 overflow-hidden">
          {activeTab === 'month' ? (
            <>
              <AccountsSidebar />
              <AddExpenseForm />
            </>
          ) : (
            <TagManagementCard />
          )}
        </div>
      </main>

      {/* Mobile Accounts Drawer */}
      <Drawer open={isMobileAccountsOpen} onOpenChange={setIsMobileAccountsOpen}>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader className="text-left px-0 pb-2">
            <DrawerTitle className="sr-only">Cuentas Bancarias</DrawerTitle>
            <DrawerDescription className="sr-only">Administración de cuentas bancarias y saldos</DrawerDescription>
          </DrawerHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            <AccountsSidebar />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Toaster for toast alerts */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <AppContent />
    </ApiProvider>
  );
}
