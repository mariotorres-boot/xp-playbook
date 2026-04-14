import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Clock, History } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { UserStory, Priority, Status, CardType } from '@/types/xp';

interface StoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story?: UserStory | null;
  defaultStatus?: Status;
  defaultIteration?: number;
}

export function StoryDialog({ open, onOpenChange, story, defaultStatus, defaultIteration }: StoryDialogProps) {
  const { team, iterations, groups, addStory, updateStory, deleteStory, currentBoardId, activityLogs } = useProjectStore();
  const isEdit = !!story;
  const [showLogs, setShowLogs] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', assignee: '', groupId: '',
    priority: 'medium' as Priority, storyPoints: 3, status: (defaultStatus || 'backlog') as Status,
    iteration: defaultIteration || 0, type: 'user-story' as CardType, testCriteria: '',
    estimatedHours: 0, actualHours: 0,
  });

  useEffect(() => {
    if (story) {
      setForm({
        title: story.title, description: story.description, assignee: story.assignee || '',
        groupId: story.groupId || '',
        priority: story.priority, storyPoints: story.storyPoints, status: story.status,
        iteration: story.iteration || 0, type: story.type, testCriteria: story.testCriteria || '',
        estimatedHours: story.estimatedHours || 0, actualHours: story.actualHours || 0,
      });
    } else {
      setForm({ title: '', description: '', assignee: '', groupId: '',
        priority: 'medium', storyPoints: 3, status: defaultStatus || 'backlog',
        iteration: defaultIteration || 0, type: 'user-story', testCriteria: '',
        estimatedHours: 0, actualHours: 0 });
    }
    setShowLogs(false);
  }, [story, open, defaultStatus, defaultIteration]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data: UserStory = {
      id: story?.id || `s${Date.now()}`,
      title: form.title, description: form.description, assignee: form.assignee || undefined,
      groupId: form.groupId || undefined,
      priority: form.priority, storyPoints: form.storyPoints, status: form.status,
      iteration: form.iteration || undefined, type: form.type,
      createdAt: story?.createdAt || new Date().toISOString().split('T')[0],
      testCriteria: form.testCriteria || undefined,
      boardId: story?.boardId || currentBoardId,
      estimatedHours: form.estimatedHours || undefined,
      actualHours: form.actualHours || undefined,
    };
    if (isEdit) updateStory(data.id, data);
    else addStory(data);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (story) {
      deleteStory(story.id);
      onOpenChange(false);
    }
  };

  // Delete allowed only in todo, in-progress, in-review
  const canDelete = isEdit && story && story.status !== 'done';

  const developers = team;
  const storyLogs = story ? activityLogs.filter(l => l.storyId === story.id) : [];

  // Cost calculation
  const assigneeMember = team.find(m => m.id === form.assignee);
  const estimatedCost = assigneeMember && form.estimatedHours ? (form.estimatedHours * assigneeMember.hourlyCost) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título de la actividad" />
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CardType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-story">Historia de Usuario</SelectItem>
                  <SelectItem value="task">Tarea</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="tdd-task">Tarea TDD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Puntos de Historia</Label>
              <Select value={String(form.storyPoints)} onValueChange={(v) => setForm({ ...form, storyPoints: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 13, 21].map((p) => (
                    <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">Por Hacer</SelectItem>
                  <SelectItem value="in-progress">En Progreso</SelectItem>
                  <SelectItem value="in-review">En Revisión</SelectItem>
                  <SelectItem value="done">Completado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Responsable</Label>
              <Select value={form.assignee || 'none'} onValueChange={(v) => setForm({ ...form, assignee: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {developers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Iteración</Label>
              <Select value={String(form.iteration)} onValueChange={(v) => setForm({ ...form, iteration: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="Ninguna" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ninguna</SelectItem>
                  {iterations.map((it) => (
                    <SelectItem key={it.id} value={String(it.id)}>{it.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Grupo</Label>
            <Select value={form.groupId || 'none'} onValueChange={(v) => setForm({ ...form, groupId: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Sin grupo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin grupo</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Time & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Horas Estimadas</Label>
              <Input type="number" min={0} value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Horas Reales</Label>
              <Input type="number" min={0} value={form.actualHours} onChange={(e) => setForm({ ...form, actualHours: Number(e.target.value) })} />
            </div>
          </div>
          {estimatedCost > 0 && (
            <div className="p-2 bg-secondary/50 rounded-lg text-sm">
              <strong>Costo estimado:</strong> ${estimatedCost.toFixed(2)} ({form.estimatedHours}h × ${assigneeMember?.hourlyCost.toFixed(2)}/h)
              {form.actualHours > form.estimatedHours && (
                <Badge variant="destructive" className="ml-2 text-xs">⚠ Excede tiempo</Badge>
              )}
            </div>
          )}
          {(form.type === 'tdd-task' || form.type === 'user-story') && (
            <div>
              <Label>Criterios de Prueba / Aceptación</Label>
              <Textarea value={form.testCriteria} onChange={(e) => setForm({ ...form, testCriteria: e.target.value })} rows={2} placeholder="Definir criterios de prueba..." />
            </div>
          )}

          {/* Activity log */}
          {isEdit && storyLogs.length > 0 && (
            <div>
              <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setShowLogs(!showLogs)}>
                <History className="h-3.5 w-3.5" /> Historial ({storyLogs.length})
              </Button>
              {showLogs && (
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {storyLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{log.action}</span>
                      {' · '}{log.user || 'Sistema'} · {new Date(log.timestamp).toLocaleString('es-ES')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. La actividad será eliminada permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{isEdit ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
