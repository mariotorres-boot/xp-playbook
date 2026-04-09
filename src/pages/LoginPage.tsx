import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useProjectStore } from '@/store/useProjectStore';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useProjectStore((s) => s.login);
  const isLoggedIn = useProjectStore((s) => s.isLoggedIn);

  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) login(email.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">XP Project Manager</CardTitle>
          <CardDescription>Inicia sesión para gestionar tus proyectos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">Iniciar Sesión</Button>
          </form>
          <Button variant="outline" className="w-full mt-3" onClick={() => login('demo@xp-project.com')}>
            Acceso Demo Rápido
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-4">O ingresa cualquier email arriba</p>
        </CardContent>
      </Card>
    </div>
  );
}