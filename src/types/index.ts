export type EntityStatus =
  | 'pending'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'completed_early'
  | 'paused'
  | 'overdue'
  | 'archived';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: EntityStatus;
  statusUpdatedAt?: string;
  period: 'annual' | 'quarterly';
  startDate?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
  motto?: string;
  affirmation?: string;
  completedAt?: string;
  createdAt: string;
}

export interface UserQuote {
  id: string;
  text: string;
  createdAt: string;
}

export interface AchievementState {
  stars: number;
  medals: number;
  trophies: number;
  totalMinutesInvested: number;
  unlockedIds: string[];
}

export interface Objective {
  id: string;
  goalId: string; // Belongs to Goal
  title: string;
  description?: string;
  period: 'quarterly' | 'monthly' | 'bimonthly';
  status: EntityStatus;
  statusUpdatedAt?: string;
  startDate?: string;
  deadline?: string;
  order: number;
  completedAt?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  objectiveId: string; // Belongs to Objective
  title: string;
  description?: string;
  period: 'semester' | 'quarterly' | 'monthly';
  status: EntityStatus;
  statusUpdatedAt?: string;
  startDate?: string;
  deadline?: string;
  order: number;
  completedAt?: string;
  createdAt: string;
}

export interface Task { // Tactical Task
  id: string;
  activityId: string; // Belongs to Activity
  title: string;
  description?: string;
  period: 'weekly' | 'daily';
  status: EntityStatus;
  statusUpdatedAt?: string;
  startDate?: string;
  deadline?: string;
  order: number;
  completedAt?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  objectiveId: string; // Belongs to Objective
  title: string;
  description?: string;
  period: 'monthly' | 'bimonthly' | 'weekly' | 'daily';
  status: EntityStatus;
  statusUpdatedAt?: string;
  startDate?: string;
  deadline?: string;
  order: number;
  completedAt?: string;
  createdAt: string;

  // 1440 minutes tracking
  plannedDaysOfWeek?: number[];
  plannedMinutesPerSession?: number;
  minutesSpentToday?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface WorkSession {
  id: string;
  activityId: string;
  actionPlanIds?: string[]; // IDs de Tasks/Plan de acción cruzados
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  plannedMinutes: number;
  actualMinutes: number;
  status: 'planned' | 'completed' | 'skipped' | 'partial';
  notes?: string;
}

export interface DailySettings {
  sleepMinutes: number; // e.g. 480 (8 hrs)
  fixedRoutineMinutes: number; // e.g. 120 (meals, transport)
}
