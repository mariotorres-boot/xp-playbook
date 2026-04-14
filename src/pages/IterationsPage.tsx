import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProjectStore } from '@/store/useProjectStore';
import { CalendarDays } from 'lucide-react';
import type { UserStory } from '@/types/xp';

const statusLabels: Record<string, string> = {
  backlog: 'Backlog', todo: 'Por Hacer', 'in-progress': 'En Progreso', 'in-review': 'En Revisión', done: 'Completado',
};
const priorityLabels: Record<string, string> = {
  critical: 'Crítica', high: 'Alta', medium: 'Media', low: 'Baja',
};

export default function IterationsPage() {
  const { iterations, stories, currentIteration, team, groups } = useProjectStore();
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Iteraciones</h1>
      <div className="space-y-4">
        {iterations.map((iter) => {
          const iterStories = stories.filter((s) => s.iteration === iter.id);
          const done = iterStories.filter((s) => s.status === 'done');
          const totalPoints = iterStories.reduce((sum, s) => sum + s.storyPoints, 0);
          const donePoints = done.reduce((sum, s) => sum + s.storyPoints, 0);
          const progress = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;
          const isCurrent = iter.id === currentIteration;

          return (
            <Card key={iter.id} className={isCurrent ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {iter.name}
                    {isCurrent && <Badge className="bg-primary text-primary-foreground text-[10px]">Actual</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {iter.startDate} → {iter.endDate}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex gap-4 text-sm">
                  <span><strong>{iterStories.length}</strong> actividades</span>
                  <span><strong>{donePoints}/{totalPoints}</strong> SP completados</span>
                  <span>Velocidad: <strong>{iter.velocity || '—'}</strong></span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {iterStories.map((s) => (
                    <Badge
                      key={s.id}
                      variant={s.status === 'done' ? 'default' : 'outline'}
                      className="text-xs cursor-pointer hover:ring-1 hover:ring-primary transition-all"
                      onClick={() => setSelectedStory(s)}
                    >
                      {s.title.slice(0, 30)}{s.title.length > 30 ? '…' : ''}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedStory?.title}</DialogTitle>
          </DialogHeader>
          {selectedStory && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{selectedStory.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Estado:</strong> {statusLabels[selectedStory.status]}</div>
                <div><strong>Prioridad:</strong> {priorityLabels[selectedStory.priority]}</div>
                <div><strong>Tipo:</strong> {{ 'user-story': 'Historia de Usuario', 'task': 'Tarea', 'bug': 'Bug', 'tdd-task': 'Tarea TDD' }[selectedStory.type] || selectedStory.type}</div>
                <div><strong>Puntos:</strong> {selectedStory.storyPoints} SP</div>
                <div><strong>Responsable:</strong> {team.find(m => m.id === selectedStory.assignee)?.name || 'Sin asignar'}</div>
                <div><strong>Grupo:</strong> {groups.find(g => g.id === selectedStory.groupId)?.name || 'Sin grupo'}</div>
                {selectedStory.estimatedHours && <div><strong>Hrs Estimadas:</strong> {selectedStory.estimatedHours}</div>}
                {selectedStory.actualHours && <div><strong>Hrs Reales:</strong> {selectedStory.actualHours}</div>}
              </div>
              {selectedStory.testCriteria && (
                <div>
                  <strong>Criterios de Prueba:</strong>
                  <p className="text-muted-foreground mt-1">{selectedStory.testCriteria}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground">Creado: {selectedStory.createdAt}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
