import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { FileDown, BarChart3, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const statusLabels: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso', done: 'Hecho',
};

export default function ReportsPage() {
  const { stories, iterations, team, groups, boards } = useProjectStore();

  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === 'done');
  const inProgressStories = stories.filter((s) => s.status === 'in-progress');
  const criticalBugs = stories.filter((s) => s.type === 'bug' && s.priority === 'critical' && s.status !== 'done');
  const totalPoints = stories.reduce((sum, s) => sum + s.storyPoints, 0);
  const donePoints = doneStories.reduce((sum, s) => sum + s.storyPoints, 0);

  const teamWorkload = team.map((m) => {
    const assigned = stories.filter((s) => s.assignee === m.id);
    const active = assigned.filter((s) => s.status !== 'done');
    const points = assigned.reduce((sum, s) => sum + s.storyPoints, 0);
    return { ...m, total: assigned.length, active: active.length, points };
  });

  const boardSummaries = boards.map((b) => {
    const bStories = stories.filter((s) => s.boardId === b.id || (!s.boardId && b.id === 'b1'));
    const bDone = bStories.filter((s) => s.status === 'done');
    const bTotal = bStories.reduce((sum, s) => sum + s.storyPoints, 0);
    const bDoneP = bDone.reduce((sum, s) => sum + s.storyPoints, 0);
    return { ...b, total: bStories.length, done: bDone.length, totalPoints: bTotal, donePoints: bDoneP };
  });

  const handleDownloadPDF = () => {
    const content = generateReportText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-proyecto-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReportText = () => {
    let report = '=== REPORTE DE PROYECTO ===\n';
    report += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    report += `--- RESUMEN GENERAL ---\n`;
    report += `Total de actividades: ${totalStories}\n`;
    report += `Completadas: ${doneStories.length} (${totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0}%)\n`;
    report += `En progreso: ${inProgressStories.length}\n`;
    report += `Bugs críticos abiertos: ${criticalBugs.length}\n`;
    report += `Puntos totales: ${totalPoints} | Completados: ${donePoints}\n\n`;

    report += `--- TABLEROS ---\n`;
    boardSummaries.forEach((b) => {
      report += `${b.name}: ${b.done}/${b.total} actividades (${b.donePoints}/${b.totalPoints} SP)\n`;
    });

    report += `\n--- CARGA DE TRABAJO POR EQUIPO ---\n`;
    teamWorkload.forEach((m) => {
      report += `${m.name} (${m.role}): ${m.active} activas, ${m.total} totales, ${m.points} SP\n`;
    });

    report += `\n--- ITERACIONES ---\n`;
    iterations.forEach((it) => {
      const itStories = stories.filter((s) => s.iteration === it.id);
      const itDone = itStories.filter((s) => s.status === 'done');
      report += `${it.name}: ${itDone.length}/${itStories.length} completadas | Velocidad: ${it.velocity || '—'}\n`;
    });

    return report;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-muted-foreground">Resumen consolidado de todos los tableros</p>
        </div>
        <Button onClick={handleDownloadPDF}>
          <FileDown className="h-4 w-4 mr-1" /> Descargar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-primary"><CheckCircle2 className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{donePoints}/{totalPoints} SP</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-accent-foreground"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{inProgressStories.length}</p>
              <p className="text-xs text-muted-foreground">En Progreso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-destructive"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{criticalBugs.length}</p>
              <p className="text-xs text-muted-foreground">Bugs Críticos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{team.length}</p>
              <p className="text-xs text-muted-foreground">Miembros del Equipo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Estado por Tablero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {boardSummaries.map((b) => {
              const pct = b.totalPoints > 0 ? Math.round((b.donePoints / b.totalPoints) * 100) : 0;
              return (
                <div key={b.id} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{b.name}</p>
                    <Badge variant="outline" className="text-xs">{pct}%</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{b.done}/{b.total} actividades · {b.donePoints}/{b.totalPoints} SP</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Carga de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teamWorkload.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.points} SP asignados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{m.active}</p>
                  <p className="text-xs text-muted-foreground">activas</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cumplimiento de Iteraciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {iterations.map((it) => {
              const itStories = stories.filter((s) => s.iteration === it.id);
              const itDone = itStories.filter((s) => s.status === 'done');
              const pct = itStories.length > 0 ? Math.round((itDone.length / itStories.length) * 100) : 0;
              return (
                <div key={it.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">{it.startDate} → {it.endDate}</p>
                  </div>
                  <div className="w-32">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Badge variant={pct === 100 ? 'default' : 'outline'} className="text-xs w-12 justify-center">{pct}%</Badge>
                  <span className="text-xs text-muted-foreground">{itDone.length}/{itStories.length}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
