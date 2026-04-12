import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  const { team, iterations, groups, addStory, updateStory } = useProjectStore();
  const isEdit = !!story;

  const [form, setForm] = useState({
    title: '', description: '', assignee: '', groupId: '',
    priority: 'medium' as Priority, storyPoints: 3, status: (defaultStatus || 'backlog') as Status,
    iteration: defaultIteration || 0, type: 'user-story' as CardType, testCriteria: '',
  });

  useEffect(() => {
    if (story) {
      setForm({
        title: story.title, description: story.description, assignee: story.assignee || '',
        groupId: story.groupId || '',
        priority: story.priority, storyPoints: story.storyPoints, status: story.status,
        iteration: story.iteration || 0, type: story.type, testCriteria: story.testCriteria || '',
      });
    } else {
      setForm({ title: '', description: '', assignee: '', groupId: '',
        priority: 'medium', storyPoints: 3, status: defaultStatus || 'backlog',
        iteration: defaultIteration || 0, type: 'user-story', testCriteria: '' });
    }
  }, [story, open, defaultStatus, defaultIteration]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data: UserStory = {
      id: story?.id || `s${Date.now()}`,
      title: form.title, description: form.description, assignee: form.assignee || undefined,
      groupId: form.groupId || undefined,
      priority: form.priority, storyPoints: form.storyPoints, status: form.status,
      iteration: form.iteration || undefined, type: form.type, createdAt: story?.createdAt || new Date().toISOString().split('T')[0],
      testCriteria: form.testCriteria || undefined,
    };
    if (isEdit) updateStory(data.id, data);
    else addStory(data);
    onOpenChange(false);
  };

  const developers = team.filter((m) => m.role === 'developer' || m.role === 'tester');

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
                  <SelectItem value="done">Hecho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Responsable</Label>
              <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent>
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
            <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
              <SelectTrigger><SelectValue placeholder="Sin grupo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin grupo</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(form.type === 'tdd-task' || form.type === 'user-story') && (
            <div>
              <Label>Criterios de Prueba / Aceptación</Label>
              <Textarea value={form.testCriteria} onChange={(e) => setForm({ ...form, testCriteria: e.target.value })} rows={2} placeholder="Definir criterios de prueba..." />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{isEdit ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
