import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { Group, TeamMember } from '@/types/xp';

const roleLabels: Record<string, string> = { developer: 'Desarrollador', tester: 'Probador', coach: 'Coach' };

export default function TeamPage() {
  const { team, stories, groups, addGroup, updateGroup, deleteGroup, addTeamMember, updateTeamMember, deleteTeamMember } = useProjectStore();

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<'developer' | 'tester' | 'coach'>('developer');

  const openNewGroup = () => { setEditGroup(null); setGroupName(''); setSelectedMembers([]); setGroupDialogOpen(true); };
  const openEditGroup = (g: Group) => { setEditGroup(g); setGroupName(g.name); setSelectedMembers(g.members); setGroupDialogOpen(true); };
  const handleSaveGroup = () => {
    if (!groupName.trim()) return;
    if (editGroup) updateGroup(editGroup.id, { name: groupName, members: selectedMembers });
    else addGroup({ id: `g${Date.now()}`, name: groupName, members: selectedMembers });
    setGroupDialogOpen(false);
  };
  const toggleMember = (id: string) => setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const openNewMember = () => { setEditMember(null); setMemberName(''); setMemberRole('developer'); setMemberDialogOpen(true); };
  const openEditMember = (m: TeamMember) => { setEditMember(m); setMemberName(m.name); setMemberRole(m.role); setMemberDialogOpen(true); };
  const handleSaveMember = () => {
    if (!memberName.trim()) return;
    if (editMember) updateTeamMember(editMember.id, { name: memberName, role: memberRole });
    else addTeamMember({ id: `m${Date.now()}`, name: memberName, role: memberRole });
    setMemberDialogOpen(false);
  };
  const handleDeleteMember = (id: string) => deleteTeamMember(id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipo y Grupos</h1>
        <Button onClick={openNewMember}>
          <UserPlus className="h-4 w-4 mr-1" /> Añadir Miembro
        </Button>
      </div>

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
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">{roleLabels[m.role] || m.role}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditMember(m)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteMember(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
          {groups.length === 0 && <p className="text-sm text-muted-foreground">No hay grupos creados.</p>}
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

      {/* Diálogo de Grupo */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del grupo</Label>
              <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ej: Equipo Frontend" />
            </div>
            <div>
              <Label>Miembros</Label>
              <div className="space-y-2 mt-1">
                {team.map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox checked={selectedMembers.includes(m.id)} onCheckedChange={() => toggleMember(m.id)} />
                    <span className="text-sm">{m.name}</span>
                    <Badge variant="outline" className="text-[10px]">{roleLabels[m.role] || m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveGroup}>{editGroup ? 'Actualizar' : 'Crear'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Miembro */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editMember ? 'Editar Miembro' : 'Nuevo Miembro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre completo</Label>
              <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Ej: Juan Pérez" />
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={memberRole} onValueChange={(v) => setMemberRole(v as 'developer' | 'tester' | 'coach')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Desarrollador</SelectItem>
                  <SelectItem value="tester">Probador</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMemberDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveMember}>{editMember ? 'Actualizar' : 'Añadir'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
