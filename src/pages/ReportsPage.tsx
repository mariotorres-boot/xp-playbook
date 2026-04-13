import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { FileDown, BarChart3, Users, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const statusLabels: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso', done: 'Hecho',
};
const priorityLabels: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja',
};
const typeLabels: Record<string, string> = {
  'user-story': 'Historia', task: 'Tarea', bug: 'Bug', 'tdd-task': 'TDD',
};

export default function ReportsPage() {
  const { stories, iterations, team, groups, boards, currentBoardId } = useProjectStore();
  const [generating, setGenerating] = useState(false);

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

  const currentBoard = boards.find((b) => b.id === currentBoardId);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    // Use setTimeout to let the UI update before heavy work
    await new Promise((r) => setTimeout(r, 50));

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('XP Board', margin, y);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      const dateStr = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Reporte generado el ${dateStr}`, margin, y + 7);
      doc.text(`Tablero: ${currentBoard?.name || 'Todos'}`, margin, y + 13);
      doc.setTextColor(0);

      // Divider
      y += 20;
      doc.setDrawColor(200);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // KPIs
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Métricas Clave', margin, y);
      y += 8;

      const pctGeneral = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
      const kpis = [
        ['Total de Actividades', String(totalStories)],
        ['Completadas', `${doneStories.length} (${pctGeneral}%)`],
        ['En Progreso', String(inProgressStories.length)],
        ['Bugs Críticos Abiertos', String(criticalBugs.length)],
        ['Puntos Totales', String(totalPoints)],
        ['Puntos Completados', String(donePoints)],
      ];

      autoTable(doc, {
        startY: y,
        head: [['Métrica', 'Valor']],
        body: kpis,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Board summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estado por Tablero', margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [['Tablero', 'Actividades', 'Completadas', 'Puntos', 'Avance']],
        body: boardSummaries.map((b) => {
          const pct = b.totalPoints > 0 ? Math.round((b.donePoints / b.totalPoints) * 100) : 0;
          return [b.name, String(b.total), String(b.done), `${b.donePoints}/${b.totalPoints}`, `${pct}%`];
        }),
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Team workload
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Carga de Trabajo del Equipo', margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [['Miembro', 'Rol', 'Activas', 'Totales', 'Puntos']],
        body: teamWorkload.map((m) => [
          m.name,
          m.role === 'developer' ? 'Desarrollador' : m.role === 'tester' ? 'Tester' : 'Coach',
          String(m.active), String(m.total), String(m.points),
        ]),
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Activity table
      if (y > 200) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Actividades', margin, y);
      y += 6;

      autoTable(doc, {
        startY: y,
        head: [['Título', 'Tipo', 'Prioridad', 'Estado', 'SP', 'Asignado']],
        body: stories.map((s) => {
          const assignee = team.find((t) => t.id === s.assignee);
          return [
            s.title,
            typeLabels[s.type] || s.type,
            priorityLabels[s.priority] || s.priority,
            statusLabels[s.status] || s.status,
            String(s.storyPoints),
            assignee?.name || '—',
          ];
        }),
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 55 } },
      });

      // Dynamic filename
      const boardName = (currentBoard?.name || 'General').replace(/\s+/g, '_');
      const dateFile = new Date().toISOString().split('T')[0];
      doc.save(`Reporte_Tablero_${boardName}_${dateFile}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-muted-foreground">Resumen consolidado de todos los tableros</p>
        </div>
        <Button onClick={handleDownloadPDF} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          {generating ? 'Generando...' : 'Descargar Reporte PDF'}
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
