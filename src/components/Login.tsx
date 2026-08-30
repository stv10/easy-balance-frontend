import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApi();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !passwordInput) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const success = await login(usernameInput, passwordInput);
      if (!success) {
        setError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setError('Ocurrió un error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Easy Balance
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder a tu balance personal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border border-border bg-card/60 backdrop-blur-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Iniciar sesión</CardTitle>
              <CardDescription>
                Introduce tus datos para acceder
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="username">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="pl-9 bg-background/50 border-input"
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="pl-9 bg-background/50 border-input"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full font-semibold transition-all"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Entrar'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};
