import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

export default function TeamPage() {
  const { team, stories } = useProjectStore();

  const activePairs = stories
    .filter((s) => s.pair && s.status !== 'done')
    .map((s) => ({
      story: s.title,
      driver: team.find((m) => m.id === s.pair!.driver)?.name || 'Desconocido',
      navigator: team.find((m) => m.id === s.pair!.navigator)?.name || 'Desconocido',
    }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Equipo y Programación en Parejas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((m) => {
          const assigned = stories.filter((s) => s.assignee === m.id);
          const active = assigned.filter((s) => s.status !== 'done');
          return (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  {active.length} activas · {assigned.length} historias totales
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activePairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Asignaciones de Parejas Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activePairs.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <Badge variant="default" className="text-xs">Conductor</Badge>
                  <span className="font-medium">{p.driver}</span>
                </div>
                <span className="text-muted-foreground">+</span>
                <div className="flex items-center gap-1.5 text-sm">
                  <Badge variant="secondary" className="text-xs">Navegador</Badge>
                  <span className="font-medium">{p.navigator}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">en: {p.story}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}