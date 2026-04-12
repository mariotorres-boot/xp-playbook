import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStory, Iteration, TeamMember, Group, Status } from '@/types/xp';

const SAMPLE_TEAM: TeamMember[] = [
  { id: '1', name: 'Alice Chen', role: 'developer' },
  { id: '2', name: 'Bob Martinez', role: 'developer' },
  { id: '3', name: 'Carol Kim', role: 'developer' },
  { id: '4', name: 'Dave Patel', role: 'tester' },
  { id: '5', name: 'Eve Johnson', role: 'coach' },
];

const SAMPLE_GROUPS: Group[] = [
  { id: 'g1', name: 'Frontend', members: ['1', '3'] },
  { id: 'g2', name: 'Backend', members: ['2', '4'] },
];

const SAMPLE_STORIES: UserStory[] = [
  { id: 's1', title: 'Flujo de autenticación de usuarios', description: 'Como usuario quiero iniciar sesión para acceder a mis proyectos', assignee: '1', groupId: 'g1', priority: 'high', storyPoints: 5, status: 'in-progress', iteration: 1, type: 'user-story', createdAt: '2026-04-01', testCriteria: 'El usuario puede iniciar sesión con correo y contraseña' },
  { id: 's2', title: 'Widget de analíticas del panel', description: 'Mostrar gráfico de velocidad y progreso de iteración', assignee: '3', priority: 'medium', storyPoints: 3, status: 'todo', iteration: 1, type: 'user-story', createdAt: '2026-04-02' },
  { id: 's3', title: 'Configurar pipeline CI/CD', description: 'Configurar pruebas automatizadas y despliegue', assignee: '2', priority: 'critical', storyPoints: 8, status: 'done', iteration: 1, type: 'task', createdAt: '2026-03-28', testCriteria: 'Todas las pruebas pasan al hacer push a main' },
  { id: 's4', title: 'Escribir pruebas unitarias para autenticación', description: 'TDD: Escribir pruebas antes de la implementación', assignee: '4', groupId: 'g2', priority: 'high', storyPoints: 3, status: 'in-progress', iteration: 1, type: 'tdd-task', createdAt: '2026-04-03', testCriteria: '90% de cobertura de código en módulo de autenticación' },
  { id: 's5', title: 'Limitación de tasa en API', description: 'Implementar limitación de tasa para todos los endpoints de la API', priority: 'medium', storyPoints: 5, status: 'backlog', type: 'user-story', createdAt: '2026-04-04' },
  { id: 's6', title: 'Diseño responsivo móvil', description: 'Asegurar que todas las vistas funcionen en dispositivos móviles', priority: 'low', storyPoints: 3, status: 'backlog', type: 'user-story', createdAt: '2026-04-05' },
  { id: 's7', title: 'Corregir bug de redirección en login', description: 'Los usuarios no son redirigidos después de iniciar sesión', assignee: '1', priority: 'critical', storyPoints: 2, status: 'todo', iteration: 1, type: 'bug', createdAt: '2026-04-06' },
  { id: 's8', title: 'Scripts de migración de base de datos', description: 'Crear sistema de migración para cambios de esquema', priority: 'high', storyPoints: 5, status: 'backlog', type: 'task', createdAt: '2026-04-01' },
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
  currentIteration: number;
  isLoggedIn: boolean;
  currentUser: string;
  addStory: (story: UserStory) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  moveStory: (id: string, status: Status) => void;
  reorderStories: (status: Status, sourceIndex: number, destIndex: number) => void;
  deleteStory: (id: string) => void;
  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      stories: SAMPLE_STORIES,
      iterations: SAMPLE_ITERATIONS,
      team: SAMPLE_TEAM,
      groups: SAMPLE_GROUPS,
      currentIteration: 1,
      isLoggedIn: false,
      currentUser: '',
      addStory: (story) => set((s) => ({ stories: [...s.stories, story] })),
      updateStory: (id, updates) => set((s) => ({
        stories: s.stories.map((st) => (st.id === id ? { ...st, ...updates } : st)),
      })),
      moveStory: (id, status) => set((s) => ({
        stories: s.stories.map((st) => (st.id === id ? { ...st, status } : st)),
      })),
      reorderStories: (status, sourceIndex, destIndex) => set((s) => {
        const filtered = s.stories.filter((st) => st.status === status);
        const others = s.stories.filter((st) => st.status !== status);
        const [moved] = filtered.splice(sourceIndex, 1);
        filtered.splice(destIndex, 0, moved);
        return { stories: [...others, ...filtered] };
      }),
      deleteStory: (id) => set((s) => ({
        stories: s.stories.filter((st) => st.id !== id),
      })),
      addGroup: (group) => set((s) => ({ groups: [...s.groups, group] })),
      updateGroup: (id, updates) => set((s) => ({
        groups: s.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
      })),
      deleteGroup: (id) => set((s) => ({
        groups: s.groups.filter((g) => g.id !== id),
      })),
      login: (email) => set({ isLoggedIn: true, currentUser: email }),
      logout: () => set({ isLoggedIn: false, currentUser: '' }),
    }),
    { name: 'xp-project-store-es' }
  )
);
