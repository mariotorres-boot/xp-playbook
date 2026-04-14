export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';
export type CardType = 'user-story' | 'task' | 'bug' | 'tdd-task';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'developer' | 'tester' | 'coach';
  monthlySalary: number;
  dailyCost: number;
  hourlyCost: number;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
}

export interface ActivityLog {
  id: string;
  storyId: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  assignee?: string;
  groupId?: string;
  priority: Priority;
  storyPoints: number;
  status: Status;
  iteration?: number;
  type: CardType;
  createdAt: string;
  labels?: string[];
  testCriteria?: string;
  boardId?: string;
  estimatedHours?: number;
  actualHours?: number;
  penaltyRate?: number;
}

export interface Iteration {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  velocity?: number;
  stories: string[];
}

export interface Release {
  id: string;
  name: string;
  targetDate: string;
  iterations: number[];
}

export interface Board {
  id: string;
  name: string;
}
