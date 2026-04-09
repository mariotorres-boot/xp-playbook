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
}

export function StoryDialog({ open, onOpenChange, story }: StoryDialogProps) {
  const { team, iterations, addStory, updateStory } = useProjectStore();
  const isEdit = !!story;

  const [form, setForm] = useState({
    title: '', description: '', assignee: '', pairDriver: '', pairNavigator: '',
    priority: 'medium' as Priority, storyPoints: 3, status: 'backlog' as Status,
    iteration: 0, type: 'user-story' as CardType, testCriteria: '',
  });

  useEffect(() => {
    if (story) {
      setForm({
        title: story.title, description: story.description, assignee: story.assignee || '',
        pairDriver: story.pair?.driver || '', pairNavigator: story.pair?.navigator || '',
        priority: story.priority, storyPoints: story.storyPoints, status: story.status,
        iteration: story.iteration || 0, type: story.type, testCriteria: story.testCriteria || '',
      });
    } else {
      setForm({ title: '', description: '', assignee: '', pairDriver: '', pairNavigator: '',
        priority: 'medium', storyPoints: 3, status: 'backlog', iteration: 0, type: 'user-story', testCriteria: '' });
    }
  }, [story, open]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data: UserStory = {
      id: story?.id || `s${Date.now()}`,
      title: form.title, description: form.description, assignee: form.assignee || undefined,
      pair: form.pairDriver && form.pairNavigator ? { driver: form.pairDriver, navigator: form.pairNavigator } : undefined,
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
          <DialogTitle>{isEdit ? 'Edit Story' : 'New Story'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Story title" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CardType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-story">User Story</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="tdd-task">TDD Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Story Points</Label>
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
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Status })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Assignee</Label>
              <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {developers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Iteration</Label>
              <Select value={String(form.iteration)} onValueChange={(v) => setForm({ ...form, iteration: Number(v) })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {iterations.map((it) => (
                    <SelectItem key={it.id} value={String(it.id)}>{it.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Pair: Driver</Label>
              <Select value={form.pairDriver} onValueChange={(v) => setForm({ ...form, pairDriver: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {developers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pair: Navigator</Label>
              <Select value={form.pairNavigator} onValueChange={(v) => setForm({ ...form, pairNavigator: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {developers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(form.type === 'tdd-task' || form.type === 'user-story') && (
            <div>
              <Label>Test / Acceptance Criteria</Label>
              <Textarea value={form.testCriteria} onChange={(e) => setForm({ ...form, testCriteria: e.target.value })} rows={2} placeholder="Define test criteria..." />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>{isEdit ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
