import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/useProjectStore';
import { FileDown, BarChart3, Users, CheckCircle2, Clock, AlertTriangle, Loader2, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// Wait until web fonts and all <img> resources are loaded before capture.
async function waitForResources(root: HTMLElement) {
  try {
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  } catch { /* noop */ }
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalHeight !== 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          }),
    ),
  );
}

async function captureChart(el: HTMLElement | null): Promise<string | null> {
  if (!el) return null;
  await waitForResources(el);
  // Give the browser a frame + 500ms so Recharts SVG is fully painted.
  await new Promise((r) => setTimeout(r, 500));
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
  return canvas.toDataURL('image/png');
}

const statusLabels: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso', 'in-review': 'En Revisión', done: 'Completado',
};
const priorityLabels: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja',
};
const typeLabels: Record<string, string> = {
  'user-story': 'Historia', task: 'Tarea', bug: 'Bug', 'tdd-task': 'TDD',
};

export default function ReportsPage() {
  const { stories, iterations, team, groups, boards, currentBoardId, penaltyRate } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const progressChartRef = useRef<HTMLDivElement>(null);
  const workloadChartRef = useRef<HTMLDivElement>(null);
  const costChartRef = useRef<HTMLDivElement>(null);

  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === 'done');
  const inProgressStories = stories.filter((s) => s.status === 'in-progress');
  const criticalBugs = stories.filter((s) => s.type === 'bug' && s.priority === 'critical' && s.status !== 'done');
  const totalPoints = stories.reduce((sum, s) => sum + s.storyPoints, 0);
  const donePoints = doneStories.reduce((sum, s) => sum + s.storyPoints, 0);

  // Cost metrics
  const totalEstimatedCost = stories.reduce((sum, s) => {
    const m = team.find(t => t.id === s.assignee);
    return sum + (m && s.estimatedHours ? s.estimatedHours * m.hourlyCost : 0);
  }, 0);
  const totalActualCost = stories.reduce((sum, s) => {
    const m = team.find(t => t.id === s.assignee);
    return sum + (m && s.actualHours ? s.actualHours * m.hourlyCost : 0);
  }, 0);

  // Penalty details
  const penaltyDetails = stories
    .map((s) => {
      const m = team.find(t => t.id === s.assignee);
      if (!m || !s.actualHours || !s.estimatedHours || s.actualHours <= s.estimatedHours) return null;
      const delay = s.actualHours - s.estimatedHours;
      const amount = delay * m.hourlyCost * (penaltyRate / 100);
      return { story: s, member: m, delay, amount };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const totalPenalties = penaltyDetails.reduce((sum, p) => sum + p.amount, 0);
  const realExecutedBudget = totalEstimatedCost - totalPenalties;

  const teamWorkload = team.map((m) => {
    const assigned = stories.filter((s) => s.assignee === m.id);
    const active = assigned.filter((s) => s.status !== 'done');
    const points = assigned.reduce((sum, s) => sum + s.storyPoints, 0);
    const estCost = assigned.reduce((sum, s) => sum + (s.estimatedHours || 0) * m.hourlyCost, 0);
    const penalties = assigned.reduce((sum, s) => {
      if (s.actualHours && s.estimatedHours && s.actualHours > s.estimatedHours) {
        return sum + (s.actualHours - s.estimatedHours) * m.hourlyCost * (penaltyRate / 100);
      }
      return sum;
    }, 0);
    return { ...m, total: assigned.length, active: active.length, points, estCost, penalties };
  });

  const boardSummaries = boards.map((b) => {
    const bStories = stories.filter((s) => s.boardId === b.id || (!s.boardId && b.id === 'b1'));
    const bDone = bStories.filter((s) => s.status === 'done');
    const bTotal = bStories.reduce((sum, s) => sum + s.storyPoints, 0);
    const bDoneP = bDone.reduce((sum, s) => sum + s.storyPoints, 0);
    const bCost = bStories.reduce((sum, s) => {
      const m = team.find(t => t.id === s.assignee);
      return sum + (m && s.estimatedHours ? s.estimatedHours * m.hourlyCost : 0);
    }, 0);
    return { ...b, total: bStories.length, done: bDone.length, totalPoints: bTotal, donePoints: bDoneP, cost: bCost };
  });

  const currentBoard = boards.find((b) => b.id === currentBoardId);

  // Datasets para los gráficos del PDF
  const progressChartData = boardSummaries.map((b) => ({
    name: b.name.length > 14 ? b.name.slice(0, 12) + '…' : b.name,
    Completados: b.donePoints,
    Pendientes: Math.max(b.totalPoints - b.donePoints, 0),
  }));
  const workloadChartData = teamWorkload.map((m) => ({
    name: m.name.split(' ')[0],
    Activas: m.active,
    Total: m.total,
  }));
  const costChartData = teamWorkload
    .filter((m) => m.estCost > 0 || m.penalties > 0)
    .map((m) => ({ name: m.name.split(' ')[0], value: Math.round(m.estCost) }));

  const handleDownloadPDF = async () => {
    setGenerating(true);
    // Permite que React renderice el contenedor de captura visible.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => setTimeout(r, 50));

    try {
      // Capturar gráficos en paralelo (animaciones desactivadas en los componentes)
      const [progressImg, workloadImg, costImg] = await Promise.all([
        captureChart(progressChartRef.current),
        captureChart(workloadChartRef.current),
        captureChart(costChartRef.current),
      ]);

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      let y = 20;

      const addChart = (img: string | null, title: string, analysis: string) => {
        if (!img) return;
        const imgW = pageW - margin * 2;
        const imgH = imgW * 0.45; // proporción cómoda para gráficos
        if (y + imgH + 20 > pageH) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(title, margin, y);
        y += 4;
        doc.addImage(img, 'PNG', margin, y, imgW, imgH);
        y += imgH + 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        const lines = doc.splitTextToSize(analysis, pageW - margin * 2);
        doc.text(lines, margin, y + 2);
        doc.setTextColor(0);
        y += lines.length * 4 + 8;
      };

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
      autoTable(doc, {
        startY: y,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de Actividades', String(totalStories)],
          ['Completadas', `${doneStories.length} (${pctGeneral}%)`],
          ['En Progreso', String(inProgressStories.length)],
          ['Bugs Críticos Abiertos', String(criticalBugs.length)],
          ['Puntos Totales', String(totalPoints)],
          ['Puntos Completados', String(donePoints)],
        ],
        margin: { left: margin, right: margin }, theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' }, styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      const progressMsg = pctGeneral >= 80
        ? `Análisis: Excelente cumplimiento del ${pctGeneral}%, indicando alta eficiencia en esta iteración.`
        : pctGeneral >= 50
        ? `Análisis: Avance moderado del ${pctGeneral}%. Se recomienda revisar bloqueos en tareas en progreso.`
        : `Análisis: Avance bajo del ${pctGeneral}%. Es necesario reorganizar prioridades y atender bugs críticos.`;
      const progressLines = doc.splitTextToSize(progressMsg, pageW - margin * 2);
      doc.text(progressLines, margin, y + 4);
      doc.setTextColor(0);
      y += 4 + progressLines.length * 4 + 6;

      // Gráfico de progreso por tablero
      addChart(
        progressImg,
        'Gráfico: Progreso por Tablero (Story Points)',
        `Análisis: La gráfica compara puntos completados vs. pendientes por tablero. ` +
          (totalPoints > 0
            ? `Avance global: ${pctGeneral}% (${donePoints} de ${totalPoints} SP).`
            : 'No hay puntos asignados todavía.'),
      );

      // Cost Analysis
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Análisis de Costos', margin, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Concepto', 'Monto']],
        body: [
          ['Presupuesto Estimado Total', `$${totalEstimatedCost.toFixed(2)}`],
          ['Costo Real Actual', `$${totalActualCost.toFixed(2)}`],
          ['Total Descuentos Aplicados', `-$${totalPenalties.toFixed(2)}`],
          ['Presupuesto Real Ejecutado', `$${realExecutedBudget.toFixed(2)}`],
          ['Costo Mensual Equipo', `$${team.reduce((s, m) => s + m.monthlySalary, 0).toLocaleString()}`],
          ['Costo Diario Equipo', `$${team.reduce((s, m) => s + m.dailyCost, 0).toFixed(2)}`],
          ['Costo Horario Equipo', `$${team.reduce((s, m) => s + m.hourlyCost, 0).toFixed(2)}`],
        ],
        margin: { left: margin, right: margin }, theme: 'grid',
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' }, styles: { fontSize: 10 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      const costPct = totalEstimatedCost > 0 ? Math.round((totalActualCost / totalEstimatedCost) * 100) : 0;
      const costMsg = `Análisis: Se ha consumido el ${costPct}% del presupuesto estimado con un avance del ${pctGeneral}%. ` +
        (totalPenalties > 0
          ? `Las penalizaciones por retraso reducen el presupuesto en $${totalPenalties.toFixed(2)} (${penaltyDetails.length} ${penaltyDetails.length === 1 ? 'tarea afectada' : 'tareas afectadas'}).`
          : 'No se han aplicado descuentos por retraso en este periodo.');
      const costLines = doc.splitTextToSize(costMsg, pageW - margin * 2);
      doc.text(costLines, margin, y + 4);
      doc.setTextColor(0);
      y += 4 + costLines.length * 4 + 6;

      // Board summary
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Estado por Tablero', margin, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Tablero', 'Actividades', 'Completadas', 'Puntos', 'Avance', 'Costo Est.']],
        body: boardSummaries.map((b) => {
          const pct = b.totalPoints > 0 ? Math.round((b.donePoints / b.totalPoints) * 100) : 0;
          return [b.name, String(b.total), String(b.done), `${b.donePoints}/${b.totalPoints}`, `${pct}%`, `$${b.cost.toFixed(2)}`];
        }),
        margin: { left: margin, right: margin }, theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' }, styles: { fontSize: 9 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      // Team workload with costs
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Carga de Trabajo y Costos del Equipo', margin, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Miembro', 'Rol', 'Salario', 'Costo Est.', 'Descuentos', 'Activas', 'Puntos']],
        body: teamWorkload.map((m) => [
          m.name,
          m.role === 'developer' ? 'Desarrollador' : m.role === 'tester' ? 'Tester' : 'Coach',
          `$${m.monthlySalary.toLocaleString()}`,
          `$${m.estCost.toFixed(2)}`,
          m.penalties > 0 ? `-$${m.penalties.toFixed(2)}` : '$0.00',
          String(m.active),
          String(m.points),
        ]),
        margin: { left: margin, right: margin }, theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' }, styles: { fontSize: 8 },
      });
      y = (doc as any).lastAutoTable.finalY + 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      const topLoad = [...teamWorkload].sort((a, b) => b.active - a.active)[0];
      const workloadMsg = topLoad
        ? `Análisis: ${topLoad.name} concentra la mayor carga con ${topLoad.active} tareas activas. Distribuir el trabajo equilibradamente mejora la velocidad del equipo.`
        : 'Análisis: No hay tareas activas asignadas en este momento.';
      const wlLines = doc.splitTextToSize(workloadMsg, pageW - margin * 2);
      doc.text(wlLines, margin, y + 4);
      doc.setTextColor(0);
      y += 4 + wlLines.length * 4 + 6;

      // Penalties detail
      if (y > 200) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Penalizaciones y Descuentos', margin, y);
      y += 6;
      if (penaltyDetails.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        doc.text('No se han registrado descuentos por incumplimiento en este periodo.', margin, y + 4);
        doc.setTextColor(0);
        y += 12;
      } else {
        autoTable(doc, {
          startY: y,
          head: [['Actividad', 'Empleado', 'Hrs Est.', 'Hrs Real', 'Retraso', 'Monto']],
          body: penaltyDetails.map((p) => [
            p.story.title,
            p.member.name,
            String(p.story.estimatedHours),
            String(p.story.actualHours),
            `${p.delay} h`,
            `-$${p.amount.toFixed(2)}`,
          ]),
          foot: [['', '', '', '', 'Total', `-$${totalPenalties.toFixed(2)}`]],
          margin: { left: margin, right: margin }, theme: 'grid',
          headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
          footStyles: { fillColor: [254, 226, 226], textColor: [127, 29, 29], fontStyle: 'bold' },
          styles: { fontSize: 8 },
        });
        y = (doc as any).lastAutoTable.finalY + 4;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100);
        const penaltyMsg = `Análisis: Se aplicaron descuentos por un total de $${totalPenalties.toFixed(2)} sobre ${penaltyDetails.length} ${penaltyDetails.length === 1 ? 'actividad' : 'actividades'} con tiempo real superior al estipulado (tasa de penalización: ${penaltyRate}%).`;
        const pLines = doc.splitTextToSize(penaltyMsg, pageW - margin * 2);
        doc.text(pLines, margin, y + 4);
        doc.setTextColor(0);
        y += 4 + pLines.length * 4 + 6;
      }

      // Activity table
      if (y > 200) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalle de Actividades', margin, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [['Título', 'Tipo', 'Prioridad', 'Estado', 'SP', 'Hrs Est.', 'Hrs Real', 'Costo', 'Asignado']],
        body: stories.map((s) => {
          const assignee = team.find((t) => t.id === s.assignee);
          const cost = assignee && s.estimatedHours ? (s.estimatedHours * assignee.hourlyCost) : 0;
          return [
            s.title, typeLabels[s.type] || s.type, priorityLabels[s.priority] || s.priority,
            statusLabels[s.status] || s.status, String(s.storyPoints),
            s.estimatedHours ? String(s.estimatedHours) : '—',
            s.actualHours ? String(s.actualHours) : '—',
            cost > 0 ? `$${cost.toFixed(2)}` : '—',
            assignee?.name || '—',
          ];
        }),
        margin: { left: margin, right: margin }, theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 40 } },
      });

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-primary"><CheckCircle2 className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{donePoints}/{totalPoints} SP</p><p className="text-xs text-muted-foreground">Completados</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-accent-foreground"><Clock className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{inProgressStories.length}</p><p className="text-xs text-muted-foreground">En Progreso</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-destructive"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">{criticalBugs.length}</p><p className="text-xs text-muted-foreground">Bugs Críticos</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-primary"><DollarSign className="h-5 w-5" /></div>
            <div><p className="text-2xl font-bold">${totalEstimatedCost.toFixed(0)}</p><p className="text-xs text-muted-foreground">Presupuesto Est.</p></div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-destructive">-${totalPenalties.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Descuentos · Real: ${realExecutedBudget.toFixed(0)}</p>
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">${b.cost.toFixed(0)}</span>
                      <Badge variant="outline" className="text-xs">{pct}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{b.done}/{b.total} actividades · {b.donePoints}/{b.totalPoints} SP</p>
                </div>
              );
            })}
            <div className="mt-2 p-2 bg-muted/40 border-l-2 border-primary rounded text-xs text-muted-foreground italic">
              {(() => {
                const best = [...boardSummaries].sort((a, b) => {
                  const pa = a.totalPoints > 0 ? a.donePoints / a.totalPoints : 0;
                  const pb = b.totalPoints > 0 ? b.donePoints / b.totalPoints : 0;
                  return pb - pa;
                })[0];
                if (!best || best.totalPoints === 0) return 'Análisis: Aún no hay puntos asignados a los tableros para evaluar el progreso.';
                const pct = Math.round((best.donePoints / best.totalPoints) * 100);
                return `Análisis: "${best.name}" lidera el avance con ${pct}% completado. Total estimado de inversión: $${boardSummaries.reduce((s, b) => s + b.cost, 0).toFixed(2)}.`;
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Carga de Trabajo y Costos
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
                    <p className="text-xs text-muted-foreground">${m.estCost.toFixed(0)} est. · {m.points} SP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{m.active}</p>
                  <p className="text-xs text-muted-foreground">activas</p>
                  {m.penalties > 0 && <p className="text-xs text-destructive">-${m.penalties.toFixed(0)}</p>}
                </div>
              </div>
            ))}
            <div className="mt-2 p-2 bg-muted/40 border-l-2 border-primary rounded text-xs text-muted-foreground italic">
              {(() => {
                const top = [...teamWorkload].sort((a, b) => b.active - a.active)[0];
                if (!top || top.active === 0) return 'Análisis: No hay tareas activas en el equipo en este momento.';
                return `Análisis: ${top.name} concentra la mayor carga (${top.active} activas). Distribuir el trabajo equilibradamente acelera la entrega.`;
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={totalPenalties > 0 ? 'border-destructive/30' : undefined}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${totalPenalties > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            Detalle de Penalizaciones y Descuentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {penaltyDetails.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No se han registrado descuentos por incumplimiento en este periodo.</p>
          ) : (
            <div className="space-y-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b text-xs text-muted-foreground">
                      <th className="py-2 pr-2">Actividad</th>
                      <th className="py-2 pr-2">Empleado</th>
                      <th className="py-2 pr-2 text-right">Retraso</th>
                      <th className="py-2 pr-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {penaltyDetails.map((p) => (
                      <tr key={p.story.id} className="border-b last:border-0">
                        <td className="py-2 pr-2">{p.story.title}</td>
                        <td className="py-2 pr-2 text-muted-foreground">{p.member.name}</td>
                        <td className="py-2 pr-2 text-right">{p.delay} h</td>
                        <td className="py-2 pr-2 text-right text-destructive font-medium">-${p.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-destructive/10">
                      <td colSpan={3} className="py-2 px-2 text-right font-bold">Total Acumulado</td>
                      <td className="py-2 pr-2 text-right font-bold text-destructive">-${totalPenalties.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-muted-foreground italic mt-2">
                Análisis: {penaltyDetails.length} {penaltyDetails.length === 1 ? 'actividad excedió' : 'actividades excedieron'} el tiempo estipulado, generando descuentos a una tasa del {penaltyRate}%.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
