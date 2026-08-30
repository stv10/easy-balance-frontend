import React from 'react';
import { Landmark, Wallet, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { useApi } from '../context/ApiContext';

interface HeaderProps {
  onOpenAccounts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAccounts }) => {
  const { logout, username, accounts } = useApi();
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary dark:bg-primary/25">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="hidden sm:inline-block font-semibold text-xl tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent dark:from-primary dark:to-indigo-400">
            MyBalance
          </span>
        </div>

        <div className="flex items-center gap-2">
          {username && (
            <span className="hidden sm:inline-block text-xs text-muted-foreground mr-1">
              Hola, <span className="font-semibold text-foreground">{username}</span>
            </span>
          )}

          <ThemeToggle />

          {username && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Cerrar sesión"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Accounts Drawer Button showing total balance */}
          {onOpenAccounts && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAccounts}
              className="md:hidden font-semibold"
            >
              <Wallet className="mr-1.5 h-4 w-4" />
              ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
