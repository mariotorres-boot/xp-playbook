import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserStory, Iteration, TeamMember, Status } from '@/types/xp';

const SAMPLE_TEAM: TeamMember[] = [
  { id: '1', name: 'Alice Chen', role: 'developer' },
  { id: '2', name: 'Bob Martinez', role: 'developer' },
  { id: '3', name: 'Carol Kim', role: 'developer' },
  { id: '4', name: 'Dave Patel', role: 'tester' },
  { id: '5', name: 'Eve Johnson', role: 'coach' },
];

const SAMPLE_STORIES: UserStory[] = [
  { id: 's1', title: 'User authentication flow', description: 'As a user I want to log in so I can access my projects', assignee: '1', pair: { driver: '1', navigator: '2' }, priority: 'high', storyPoints: 5, status: 'in-progress', iteration: 1, type: 'user-story', createdAt: '2026-04-01', testCriteria: 'User can sign in with email and password' },
  { id: 's2', title: 'Dashboard analytics widget', description: 'Display velocity chart and iteration progress', assignee: '3', priority: 'medium', storyPoints: 3, status: 'todo', iteration: 1, type: 'user-story', createdAt: '2026-04-02' },
  { id: 's3', title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment', assignee: '2', priority: 'critical', storyPoints: 8, status: 'done', iteration: 1, type: 'task', createdAt: '2026-03-28', testCriteria: 'All tests pass on push to main' },
  { id: 's4', title: 'Write unit tests for auth module', description: 'TDD: Write tests before implementation', assignee: '4', pair: { driver: '4', navigator: '1' }, priority: 'high', storyPoints: 3, status: 'in-progress', iteration: 1, type: 'tdd-task', createdAt: '2026-04-03', testCriteria: '90% code coverage on auth module' },
  { id: 's5', title: 'API rate limiting', description: 'Implement rate limiting for all API endpoints', priority: 'medium', storyPoints: 5, status: 'backlog', type: 'user-story', createdAt: '2026-04-04' },
  { id: 's6', title: 'Mobile responsive layout', description: 'Ensure all views work on mobile devices', priority: 'low', storyPoints: 3, status: 'backlog', type: 'user-story', createdAt: '2026-04-05' },
  { id: 's7', title: 'Fix login redirect bug', description: 'Users are not redirected after login', assignee: '1', priority: 'critical', storyPoints: 2, status: 'todo', iteration: 1, type: 'bug', createdAt: '2026-04-06' },
  { id: 's8', title: 'Database migration scripts', description: 'Create migration system for schema changes', priority: 'high', storyPoints: 5, status: 'backlog', type: 'task', createdAt: '2026-04-01' },
];

const SAMPLE_ITERATIONS: Iteration[] = [
  { id: 1, name: 'Iteration 1 - Foundation', startDate: '2026-04-01', endDate: '2026-04-14', velocity: 18, stories: ['s1', 's2', 's3', 's4', 's7'] },
  { id: 2, name: 'Iteration 2 - Features', startDate: '2026-04-15', endDate: '2026-04-28', stories: [] },
  { id: 3, name: 'Iteration 3 - Polish', startDate: '2026-04-29', endDate: '2026-05-12', stories: [] },
];

interface ProjectState {
  stories: UserStory[];
  iterations: Iteration[];
  team: TeamMember[];
  currentIteration: number;
  isLoggedIn: boolean;
  currentUser: string;
  addStory: (story: UserStory) => void;
  updateStory: (id: string, updates: Partial<UserStory>) => void;
  moveStory: (id: string, status: Status) => void;
  reorderStories: (status: Status, sourceIndex: number, destIndex: number) => void;
  deleteStory: (id: string) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      stories: SAMPLE_STORIES,
      iterations: SAMPLE_ITERATIONS,
      team: SAMPLE_TEAM,
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
      login: (email) => set({ isLoggedIn: true, currentUser: email }),
      logout: () => set({ isLoggedIn: false, currentUser: '' }),
    }),
    { name: 'xp-project-store' }
  )
);
