import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { Group } from '@/types/xp';

export default function TeamPage() {
  const { team, stories, groups, addGroup, updateGroup, deleteGroup } = useProjectStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const openNewGroup = () => {
    setEditGroup(null);
    setGroupName('');
    setSelectedMembers([]);
    setDialogOpen(true);
  };

  const openEditGroup = (g: Group) => {
    setEditGroup(g);
    setGroupName(g.name);
    setSelectedMembers(g.members);
    setDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) return;
    if (editGroup) {
      updateGroup(editGroup.id, { name: groupName, members: selectedMembers });
    } else {
      addGroup({ id: `g${Date.now()}`, name: groupName, members: selectedMembers });
    }
    setDialogOpen(false);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Equipo y Grupos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((m) => {
          const assigned = stories.filter((s) => s.assignee === m.id);
          const active = assigned.filter((s) => s.status !== 'done');
          const memberGroups = groups.filter((g) => g.members.includes(m.id));
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
                  {active.length} activas · {assigned.length} actividades totales
                </div>
                {memberGroups.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {memberGroups.map((g) => (
                      <Badge key={g.id} variant="secondary" className="text-xs">{g.name}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Grupos
            </CardTitle>
            <Button size="sm" onClick={openNewGroup}>
              <Plus className="h-4 w-4 mr-1" /> Nuevo Grupo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {groups.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay grupos creados.</p>
          )}
          {groups.map((g) => (
            <div key={g.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{g.name}</p>
                <p className="text-xs text-muted-foreground">
                  {g.members.map((mid) => team.find((t) => t.id === mid)?.name || mid).join(', ') || 'Sin miembros'}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditGroup(g)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteGroup(g.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del grupo</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ej: Frontend" />
            </div>
            <div>
              <Label>Miembros</Label>
              <div className="space-y-2 mt-1">
                {team.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedMembers.includes(m.id)}
                      onCheckedChange={() => toggleMember(m.id)}
                    />
                    <span className="text-sm">{m.name}</span>
                    <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveGroup}>{editGroup ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
