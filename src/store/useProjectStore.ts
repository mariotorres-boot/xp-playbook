import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStory, Iteration, TeamMember, Group, Status, Board, ActivityLog } from '@/types/xp';

const calcCosts = (salary: number) => ({
  dailyCost: Math.round((salary / 30) * 100) / 100,
  hourlyCost: Math.round((salary / 30 / 8) * 100) / 100,
});

const SAMPLE_TEAM: TeamMember[] = [
  { id: '1', name: 'Alice Chen', role: 'developer', monthlySalary: 3000, ...calcCosts(3000) },
  { id: '2', name: 'Bob Martinez', role: 'developer', monthlySalary: 3200, ...calcCosts(3200) },
  { id: '3', name: 'Carol Kim', role: 'developer', monthlySalary: 2800, ...calcCosts(2800) },
  { id: '4', name: 'Dave Patel', role: 'tester', monthlySalary: 2500, ...calcCosts(2500) },
  { id: '5', name: 'Eve Johnson', role: 'coach', monthlySalary: 4000, ...calcCosts(4000) },
];

const SAMPLE_GROUPS: Group[] = [
  { id: 'g1', name: 'Frontend', members: ['1', '3'] },
  { id: 'g2', name: 'Backend', members: ['2', '4'] },
];

const DEFAULT_BOARD: Board = { id: 'b1', name: 'Tablero Principal' };

const SAMPLE_STORIES: UserStory[] = [
  { id: 's1', title: 'Flujo de autenticación de usuarios', description: 'Como usuario quiero iniciar sesión para acceder a mis proyectos', assignee: '1', groupId: 'g1', priority: 'high', storyPoints: 5, status: 'in-progress', iteration: 1, type: 'user-story', createdAt: '2026-04-01', testCriteria: 'El usuario puede iniciar sesión con correo y contraseña', boardId: 'b1', estimatedHours: 16 },
  { id: 's2', title: 'Widget de analíticas del panel', description: 'Mostrar gráfico de velocidad y progreso de iteración', assignee: '3', priority: 'medium', storyPoints: 3, status: 'todo', iteration: 1, type: 'user-story', createdAt: '2026-04-02', boardId: 'b1', estimatedHours: 8 },
  { id: 's3', title: 'Configurar pipeline CI/CD', description: 'Configurar pruebas automatizadas y despliegue', assignee: '2', priority: 'critical', storyPoints: 8, status: 'done', iteration: 1, type: 'task', createdAt: '2026-03-28', testCriteria: 'Todas las pruebas pasan al hacer push a main', boardId: 'b1', estimatedHours: 24, actualHours: 20 },
  { id: 's4', title: 'Escribir pruebas unitarias para autenticación', description: 'TDD: Escribir pruebas antes de la implementación', assignee: '4', groupId: 'g2', priority: 'high', storyPoints: 3, status: 'in-progress', iteration: 1, type: 'tdd-task', createdAt: '2026-04-03', testCriteria: '90% de cobertura de código en módulo de autenticación', boardId: 'b1', estimatedHours: 12 },
  { id: 's5', title: 'Limitación de tasa en API', description: 'Implementar limitación de tasa para todos los endpoints de la API', priority: 'medium', storyPoints: 5, status: 'backlog', type: 'user-story', createdAt: '2026-04-04', boardId: 'b1', estimatedHours: 16 },
  { id: 's6', title: 'Diseño responsivo móvil', description: 'Asegurar que todas las vistas funcionen en dispositivos móviles', priority: 'low', storyPoints: 3, status: 'backlog', type: 'user-story', createdAt: '2026-04-05', boardId: 'b1', estimatedHours: 10 },
  { id: 's7', title: 'Corregir bug de redirección en login', description: 'Los usuarios no son redirigidos después de iniciar sesión', assignee: '1', priority: 'critical', storyPoints: 2, status: 'todo', iteration: 1, type: 'bug', createdAt: '2026-04-06', boardId: 'b1', estimatedHours: 4 },
  { id: 's8', title: 'Scripts de migración de base de datos', description: 'Crear sistema de migración para cambios de esquema', priority: 'high', storyPoints: 5, status: 'backlog', type: 'task', createdAt: '2026-04-01', boardId: 'b1', estimatedHours: 20 },
];

const SAMPLE_ITERATIONS: Iteration[] = [
  { id: 1, name: 'Iteración 1 - Base', startDate: '2026-04-01', endDate: '2026-04-14', velocity: 18, stories: ['s1', 's2', 's3', 's4', 's7'] },
  { id: 2, name: 'Iteración 2 - Funcionalidades', startDate: '2026-04-15', endDate: '2026-04-28', stories: [] },
  { id: 3, name: 'Iteración 3 - Pulido', startDate: '2026-04-29', endDate: '2026-05-12', stories: [] },
];

interface ProjectState {
  stories: UserStory[];
  iterations: Iteration[];
  team: TeamMember[];
  groups: Group[];
  boards: Board[];
  activityLogs: ActivityLog[];
  currentIteration: number;
  currentBoardId: string;
  isLoggedIn: boolean;
  currentUser: string;
  penaltyRate: number;
  addStory: (story: UserStory) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  moveStory: (id: string, status: Status) => void;
  reorderStories: (status: Status, sourceIndex: number, destIndex: number) => void;
  deleteStory: (id: string) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setCurrentBoard: (id: string) => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  setPenaltyRate: (rate: number) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      stories: SAMPLE_STORIES,
      iterations: SAMPLE_ITERATIONS,
      team: SAMPLE_TEAM,
      groups: SAMPLE_GROUPS,
      boards: [DEFAULT_BOARD],
      activityLogs: [],
      currentIteration: 1,
      currentBoardId: 'b1',
      isLoggedIn: false,
      currentUser: '',
      penaltyRate: 10,
      addStory: (story) => set((s) => {
        const logs = [...s.activityLogs, { id: `log${Date.now()}`, storyId: story.id, action: 'Creada', user: s.currentUser, timestamp: new Date().toISOString() }];
        return { stories: [...s.stories, story], activityLogs: logs };
      }),
      updateStory: (id, updates) => set((s) => {
        const logs = [...s.activityLogs, { id: `log${Date.now()}`, storyId: id, action: 'Editada', user: s.currentUser, timestamp: new Date().toISOString(), details: Object.keys(updates).join(', ') }];
        return { stories: s.stories.map((st) => (st.id === id ? { ...st, ...updates } : st)), activityLogs: logs };
      }),
      moveStory: (id, status) => set((s) => {
        const old = s.stories.find(st => st.id === id);
        const logs = [...s.activityLogs, { id: `log${Date.now()}`, storyId: id, action: `Movida de "${old?.status}" a "${status}"`, user: s.currentUser, timestamp: new Date().toISOString() }];
        return { stories: s.stories.map((st) => (st.id === id ? { ...st, status } : st)), activityLogs: logs };
      }),
      reorderStories: (status, sourceIndex, destIndex) => set((s) => {
        const filtered = s.stories.filter((st) => st.status === status);
        const others = s.stories.filter((st) => st.status !== status);
        const [moved] = filtered.splice(sourceIndex, 1);
        filtered.splice(destIndex, 0, moved);
        return { stories: [...others, ...filtered] };
      }),
      deleteStory: (id) => set((s) => {
        const story = s.stories.find(st => st.id === id);
        const logs = [...s.activityLogs, { id: `log${Date.now()}`, storyId: id, action: `Eliminada: "${story?.title}"`, user: s.currentUser, timestamp: new Date().toISOString() }];
        return { stories: s.stories.filter((st) => st.id !== id), activityLogs: logs };
      }),
      addGroup: (group) => set((s) => ({ groups: [...s.groups, group] })),
      updateGroup: (id, updates) => set((s) => ({
        groups: s.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      })),
      deleteGroup: (id) => set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
      })),
      addTeamMember: (member) => set((s) => ({ team: [...s.team, member] })),
      updateTeamMember: (id, updates) => set((s) => ({
        team: s.team.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      deleteTeamMember: (id) => set((s) => ({
        team: s.team.filter((m) => m.id !== id),
      })),
      addBoard: (board) => set((s) => ({ boards: [...s.boards, board] })),
      updateBoard: (id, updates) => set((s) => ({
        boards: s.boards.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      })),
      deleteBoard: (id) => set((s) => ({
        boards: s.boards.filter((b) => b.id !== id),
        currentBoardId: s.currentBoardId === id ? (s.boards.find(b => b.id !== id)?.id || '') : s.currentBoardId,
      })),
      setCurrentBoard: (id) => set({ currentBoardId: id }),
      addLog: (log) => set((s) => ({
        activityLogs: [...s.activityLogs, { ...log, id: `log${Date.now()}`, timestamp: new Date().toISOString() }],
      })),
      setPenaltyRate: (rate) => set({ penaltyRate: rate }),
      login: (email) => set({ isLoggedIn: true, currentUser: email }),
      logout: () => set({ isLoggedIn: false, currentUser: '' }),
    }),
    { name: 'xp-project-store-v3' }
  )
);
