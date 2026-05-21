import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStory, Iteration, TeamMember, Group, Status, Board, ActivityLog } from '@/types/xp';

const calcCosts = (salary: number) => ({
  dailyCost: Math.round((salary / 30) * 100) / 100,
  hourlyCost: Math.round((salary / 30 / 8) * 100) / 100,
});

const SAMPLE_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Melissa Méndez',
    role: 'developer',
    roleTitle: 'UI/UX, Frontend & Project Management',
    responsibilities: 'Gestión del tablero, diseño de vistas, maquetación, experiencia del usuario y flujos de negocio.',
    monthlySalary: 3500,
    ...calcCosts(3500),
  },
  {
    id: '2',
    name: 'Mario Torres',
    role: 'developer',
    roleTitle: 'Backend & Arquitectura de BD',
    responsibilities: 'Estructura de la base de datos, seguridad, creación de APIs y lógica matemática (fórmulas de inventario).',
    monthlySalary: 3500,
    ...calcCosts(3500),
  },
  {
    id: '3',
    name: 'Daviz Azucena',
    role: 'tester',
    roleTitle: 'Full-Stack & QA (Pruebas)',
    responsibilities: 'Conexión entre el frontend y backend, desarrollo de la carga masiva y pruebas de estrés del sistema.',
    monthlySalary: 3500,
    ...calcCosts(3500),
  },
];

const SAMPLE_GROUPS: Group[] = [
  { id: 'g1', name: 'Equipo de Desarrollo', members: ['1', '2', '3'] },
];

const SPRINT_BOARDS: Board[] = [
  { id: 'b1', name: 'Sprint 1 · Cimientos y Acceso' },
  { id: 'b2', name: 'Sprint 2 · Catálogo y Carga Masiva' },
  { id: 'b3', name: 'Sprint 3 · Compras e Inventario' },
  { id: 'b4', name: 'Sprint 4 · Ventas a Medida' },
  { id: 'b5', name: 'Sprint 5 · Finanzas y Cierre' },
];

// Sprint task definitions: [boardId, iteration, member, title, description, estHours, status]
type SprintTaskDef = [string, number, string, string, string, number, Status];
const SPRINT_TASKS: SprintTaskDef[] = [
  // Sprint 1 (done)
  ['b1', 1, '1', 'Adaptar dashboard y menú lateral', 'Adaptar la plantilla del dashboard en Lovable, crear el menú lateral y diseñar las pantallas de Login e Inicio.', 16, 'done'],
  ['b1', 1, '2', 'Modelar base de datos y servidor', 'Diseñar el modelo de la base de datos (tablas, relaciones) y configurar el servidor y los repositorios.', 18, 'done'],
  ['b1', 1, '3', 'Autenticación y permisos por rol', 'Desarrollar la lógica de autenticación, conectar el Login con la base de datos y configurar los permisos de los 3 roles.', 14, 'done'],
  // Sprint 2 (done)
  ['b2', 2, '1', 'Interfaz de carga (Drag & Drop) y catálogo', 'Diseñar la interfaz de carga de archivos drag & drop y la tabla visual del catálogo general.', 14, 'done'],
  ['b2', 2, '2', 'CRUD de productos y servicios', 'Desarrollar el CRUD para gestionar productos físicos y servicios en la base de datos.', 16, 'done'],
  ['b2', 2, '3', 'Importación CSV con validaciones', 'Programar el script de importación CSV con validaciones de errores y campos obligatorios.', 16, 'done'],
  // Sprint 3 (done)
  ['b3', 3, '1', 'UI Proveedores, Compras e Inventario', 'Diseñar el directorio de proveedores, el formulario de nueva compra y el visor de inventario con alertas de stock bajo.', 16, 'done'],
  ['b3', 3, '2', 'Cálculo de inventario en tiempo real', 'Programar la consulta que calcula inventario: (Carga Inicial + Compras) − Ventas.', 18, 'done'],
  ['b3', 3, '3', 'CRUD Proveedores y conexión de compras', 'Desarrollar CRUD de proveedores, conectar el formulario de compras y verificar suma al inventario.', 14, 'done'],
  // Sprint 4 (done)
  ['b4', 4, '1', 'Carrito de cotizaciones y contrato', 'Diseñar el carrito de cotizaciones a medida y la vista del contrato/ticket.', 16, 'done'],
  ['b4', 4, '2', 'Trigger de descuento de stock físico', 'Programar el trigger que identifica ítems físicos y los resta del inventario al confirmar venta.', 16, 'done'],
  ['b4', 4, '3', 'Constructor de cotizaciones y PDF', 'Conectar el constructor de cotizaciones, calcular totales y generar el PDF del contrato.', 18, 'done'],
  // Sprint 5 (current)
  ['b5', 5, '1', 'Panel de Reportes y manuales', 'Diseñar el panel de reportes financieros, la vista de cuentas por cobrar y redactar manuales de usuario.', 16, 'in-progress'],
  ['b5', 5, '2', 'Libro mayor interno', 'Estructurar el libro mayor conectando ventas aprobadas (ingresos) y compras (egresos) automáticamente.', 18, 'in-progress'],
  ['b5', 5, '3', 'Pruebas de estrés y bugfixing', 'Pruebas de estrés del ciclo completo (CSV → compra → venta → estado contable e inventario) y solución de bugs.', 20, 'todo'],
];

const SAMPLE_STORIES: UserStory[] = SPRINT_TASKS.map(([boardId, iter, assignee, title, description, estimatedHours, status], idx) => ({
  id: `s${idx + 1}`,
  title,
  description,
  assignee,
  groupId: 'g1',
  priority: 'high',
  storyPoints: Math.max(2, Math.round(estimatedHours / 4)),
  status,
  iteration: iter,
  type: 'user-story',
  createdAt: '2026-05-01',
  boardId,
  estimatedHours,
  actualHours: status === 'done' ? estimatedHours : undefined,
  testCriteria: 'Funcionalidad validada y aceptada por el equipo.',
}));

const SAMPLE_ITERATIONS: Iteration[] = [
  { id: 1, name: 'Sprint 1 · Cimientos y Acceso', startDate: '2026-05-01', endDate: '2026-05-05', velocity: 12, stories: SAMPLE_STORIES.filter(s => s.iteration === 1).map(s => s.id) },
  { id: 2, name: 'Sprint 2 · Catálogo y Carga Masiva', startDate: '2026-05-06', endDate: '2026-05-10', velocity: 12, stories: SAMPLE_STORIES.filter(s => s.iteration === 2).map(s => s.id) },
  { id: 3, name: 'Sprint 3 · Compras e Inventario', startDate: '2026-05-11', endDate: '2026-05-15', velocity: 12, stories: SAMPLE_STORIES.filter(s => s.iteration === 3).map(s => s.id) },
  { id: 4, name: 'Sprint 4 · Ventas a Medida', startDate: '2026-05-16', endDate: '2026-05-20', velocity: 12, stories: SAMPLE_STORIES.filter(s => s.iteration === 4).map(s => s.id) },
  { id: 5, name: 'Sprint 5 · Finanzas y Cierre', startDate: '2026-05-21', endDate: '2026-05-26', stories: SAMPLE_STORIES.filter(s => s.iteration === 5).map(s => s.id) },
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
      boards: SPRINT_BOARDS,
      activityLogs: [],
      currentIteration: 5,
      currentBoardId: 'b5',
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
    { name: 'xp-project-store-v4' }
  )
);
