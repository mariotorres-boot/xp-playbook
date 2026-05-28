import { useState } from 'react';
import { HelpCircle, LayoutDashboard, Columns3, List, RotateCcw, CalendarRange, Users, FileBarChart, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const SECTIONS = [
  { icon: LayoutDashboard, title: 'Panel', text: 'Resumen general del proyecto: velocidad, progreso del sprint actual y métricas clave del equipo.' },
  { icon: Columns3, title: 'Tableros (Sprints)', text: 'Visualiza cada sprint como un tablero Kanban. Arrastra tarjetas entre Backlog, Por Hacer, En Progreso, En Revisión y Hecho.' },
  { icon: List, title: 'Backlog', text: 'Lista completa de historias del producto. Crea nuevas actividades con "Nueva actividad" y asígnalas a un miembro y sprint.' },
  { icon: RotateCcw, title: 'Iteraciones', text: 'Vista detallada de cada iteración: tareas, responsable, horas estimadas vs reales y estado.' },
  { icon: CalendarRange, title: 'Planificación', text: 'Calendario de releases con fechas de inicio y fin de cada sprint del proyecto.' },
  { icon: Users, title: 'Equipo y Grupos', text: 'Gestiona miembros del equipo, salarios y grupos. Los costos por hora se calculan automáticamente.' },
  { icon: FileBarChart, title: 'Reportes', text: 'Reportes financieros, carga de trabajo y costos por persona. Exporta a PDF y revisa el detalle de actividades por miembro.' },
  { icon: Database, title: 'Respaldos', text: 'Descarga toda la información del sistema en JSON o CSV, y restaura desde un archivo previamente exportado.' },
];

const TIPS = [
  'Las tareas en la columna "Hecho" no se pueden eliminar (quedan como histórico).',
  'Usa el selector de sprint en Tableros para cambiar entre Sprint 1 a Sprint 5.',
  'Todos los datos se guardan localmente en tu navegador. Haz respaldos periódicos.',
  'Los costos se calculan a partir del salario mensual del miembro asignado.',
];

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Guía rápida del sistema
            </DialogTitle>
            <DialogDescription>
              Conoce cada sección de XP Manager y cómo aprovecharla mejor.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3">
              {SECTIONS.map((s) => (
                <div key={s.title} className="flex gap-3 p-3 rounded-md border bg-card">
                  <s.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-md bg-accent/30 border">
                <h3 className="font-semibold text-sm mb-2">Consejos útiles</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {TIPS.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
