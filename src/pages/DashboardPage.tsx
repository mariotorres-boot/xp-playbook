import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/store/useProjectStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react';

export default function DashboardPage() {
  const { stories, iterations, team, groups, currentIteration } = useProjectStore();

  const iter = iterations.find((i) => i.id === currentIteration);
  const iterStories = stories.filter((s) => s.iteration === currentIteration);
  const done = iterStories.filter((s) => s.status === 'done');
  const inProgress = iterStories.filter((s) => s.status === 'in-progress');
  const donePoints = done.reduce((sum, s) => sum + s.storyPoints, 0);
  const totalPoints = iterStories.reduce((sum, s) => sum + s.storyPoints, 0);
  const criticalBugs = stories.filter((s) => s.type === 'bug' && s.priority === 'critical' && s.status !== 'done');

  const velocityData = iterations.map((it) => ({
    name: `Iter ${it.id}`,
    velocidad: it.velocity || 0,
    planificado: stories.filter((s) => s.iteration === it.id).reduce((sum, s) => sum + s.storyPoints, 0),
  }));

  const stats = [
    { label: 'Completados', value: `${donePoints}/${totalPoints} SP`, icon: CheckCircle2, color: 'text-success' },
    { label: 'En Progreso', value: inProgress.length, icon: Clock, color: 'text-accent' },
    { label: 'Bugs Críticos', value: criticalBugs.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Grupos', value: groups.length, icon: Users, color: 'text-primary' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel</h1>
        <p className="text-muted-foreground text-sm">{iter?.name || 'Sin iteración activa'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-secondary ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Seguimiento de Velocidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="velocidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Velocidad" />
                <Bar dataKey="planificado" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Planificado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actividades Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stories.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{{ 'user-story': 'Historia', 'task': 'Tarea', 'bug': 'Bug', 'tdd-task': 'TDD' }[s.type] || s.type}</Badge>
                  <span className="text-sm">{s.title}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{{ backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso', done: 'Hecho' }[s.status] || s.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {team.map((m) => {
              const assigned = stories.filter((s) => s.assignee === m.id && s.status !== 'done');
              return (
                <div key={m.id} className="text-center p-3 bg-secondary/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto text-sm">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <p className="text-sm font-medium mt-1.5">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{assigned.length} activas</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
