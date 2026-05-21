import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Plus, Pencil, Trash2, UserPlus, DollarSign } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import type { Group, TeamMember } from '@/types/xp';

const roleLabels: Record<string, string> = { developer: 'Desarrollador', tester: 'Probador', coach: 'Coach' };

export default function TeamPage() {
  const { team, stories, groups, addGroup, updateGroup, deleteGroup, addTeamMember, updateTeamMember, deleteTeamMember, penaltyRate, setPenaltyRate } = useProjectStore();

  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<'developer' | 'tester' | 'coach'>('developer');
  const [memberRoleTitle, setMemberRoleTitle] = useState('');
  const [memberResponsibilities, setMemberResponsibilities] = useState('');
  const [memberSalary, setMemberSalary] = useState(0);

  const openNewGroup = () => { setEditGroup(null); setGroupName(''); setSelectedMembers([]); setGroupDialogOpen(true); };
  const openEditGroup = (g: Group) => { setEditGroup(g); setGroupName(g.name); setSelectedMembers(g.members); setGroupDialogOpen(true); };
  const handleSaveGroup = () => {
    if (!groupName.trim()) return;
    if (editGroup) updateGroup(editGroup.id, { name: groupName, members: selectedMembers });
    else addGroup({ id: `g${Date.now()}`, name: groupName, members: selectedMembers });
    setGroupDialogOpen(false);
  };
  const toggleMember = (id: string) => setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const openNewMember = () => { setEditMember(null); setMemberName(''); setMemberRole('developer'); setMemberRoleTitle(''); setMemberResponsibilities(''); setMemberSalary(0); setMemberDialogOpen(true); };
  const openEditMember = (m: TeamMember) => { setEditMember(m); setMemberName(m.name); setMemberRole(m.role); setMemberRoleTitle(m.roleTitle || ''); setMemberResponsibilities(m.responsibilities || ''); setMemberSalary(m.monthlySalary); setMemberDialogOpen(true); };
  const handleSaveMember = () => {
    if (!memberName.trim()) return;
    const dailyCost = Math.round((memberSalary / 30) * 100) / 100;
    const hourlyCost = Math.round((memberSalary / 30 / 8) * 100) / 100;
    const payload = { name: memberName, role: memberRole, roleTitle: memberRoleTitle, responsibilities: memberResponsibilities, monthlySalary: memberSalary, dailyCost, hourlyCost };
    if (editMember) updateTeamMember(editMember.id, payload);
    else addTeamMember({ id: `m${Date.now()}`, ...payload });
    setMemberDialogOpen(false);
  };
  const handleDeleteMember = (id: string) => deleteTeamMember(id);

  const computedDailyCost = Math.round((memberSalary / 30) * 100) / 100;
  const computedHourlyCost = Math.round((memberSalary / 30 / 8) * 100) / 100;

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
          const totalEstCost = assigned.reduce((sum, s) => sum + (s.estimatedHours || 0) * m.hourlyCost, 0);
          // Penalty calc
          const penalties = assigned.filter(s => s.actualHours && s.estimatedHours && s.actualHours > s.estimatedHours);
          const penaltyAmount = penalties.reduce((sum, s) => {
            const excess = (s.actualHours! - s.estimatedHours!) * m.hourlyCost;
            return sum + excess * (penaltyRate / 100);
          }, 0);

          return (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                    {m.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    {m.roleTitle ? (
                      <p className="text-xs text-primary font-medium">{m.roleTitle}</p>
                    ) : null}
                    <Badge variant="outline" className="text-xs capitalize mt-1">{roleLabels[m.role] || m.role}</Badge>
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
                  {active.length} activas · {assigned.length} totales
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Salario: ${m.monthlySalary.toLocaleString()}/mes · ${m.dailyCost.toFixed(0)}/día · ${m.hourlyCost.toFixed(2)}/hr
                </div>
                {totalEstCost > 0 && (
                  <div className="mt-1 text-xs font-medium text-primary">
                    Costo estimado asignado: ${totalEstCost.toFixed(2)}
                  </div>
                )}
                {penaltyAmount > 0 && (
                  <div className="mt-1 text-xs font-medium text-destructive">
                    Descuento por retraso: -${penaltyAmount.toFixed(2)}
                  </div>
                )}
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

      {/* Penalty rate config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Configuración de Nómina
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 max-w-sm">
            <Label className="whitespace-nowrap">Penalización por retraso (%)</Label>
            <Input type="number" min={0} max={100} value={penaltyRate} onChange={(e) => setPenaltyRate(Number(e.target.value))} className="w-24" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Porcentaje de descuento aplicado cuando una actividad excede el tiempo estipulado.</p>
        </CardContent>
      </Card>

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
            <div>
              <Label>Salario Mensual ($)</Label>
              <Input type="number" min={0} value={memberSalary} onChange={(e) => setMemberSalary(Number(e.target.value))} placeholder="Ej: 3000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Costo por Día</Label>
                <Input value={`$${computedDailyCost.toFixed(2)}`} readOnly className="bg-muted" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Costo por Hora</Label>
                <Input value={`$${computedHourlyCost.toFixed(2)}`} readOnly className="bg-muted" />
              </div>
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
