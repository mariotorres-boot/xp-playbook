export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'done';
export type CardType = 'user-story' | 'task' | 'bug' | 'tdd-task';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'developer' | 'tester' | 'coach';
}

export interface PairAssignment {
  driver: string;
  navigator: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  pair?: PairAssignment;
  priority: Priority;
  storyPoints: number;
  status: Status;
  iteration?: number;
  type: CardType;
  createdAt: string;
  labels?: string[];
  testCriteria?: string;
}

export interface Iteration {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  velocity?: number;
  stories: string[]; // story IDs
}

export interface Release {
  id: string;
  name: string;
  targetDate: string;
  iterations: number[];
}
