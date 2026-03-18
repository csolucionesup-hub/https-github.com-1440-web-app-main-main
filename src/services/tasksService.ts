import { Project, Objective, Activity } from '../types';
import { supabase } from '../lib/supabaseClient';

export const tasksService = {
  // Objectives
  async getObjectives() {
    const { data, error } = await supabase.from('objectives').select('*').order('order_index');
    if (error) throw error;
    return data.map(this.mapObjective);
  },
  async createObjective(obj: Omit<Objective, 'id' | 'createdAt'>, userId: string, goalId: string) {
    const { data, error } = await supabase
      .from('objectives')
      .insert({ 
        user_id: userId,
        goal_id: goalId, 
        title: obj.title,
        description: obj.description,
        status: obj.status,
        order_index: obj.order,
        workspace_id: obj.workspaceId
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapObjective(data);
  },
  async updateObjective(id: string, updates: Partial<Objective>) {
    const dbUpdates: any = { ...updates };
    if (updates.order !== undefined) {
      dbUpdates.order_index = updates.order;
      delete dbUpdates.order;
    }
    if (updates.goalId !== undefined) {
      dbUpdates.goal_id = updates.goalId;
      delete dbUpdates.goalId;
    }
    if (updates.workspaceId !== undefined) {
      dbUpdates.workspace_id = updates.workspaceId;
      delete dbUpdates.workspaceId;
    }

    const { data, error } = await supabase
      .from('objectives')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapObjective(data);
  },
  async deleteObjective(id: string) {
    const { error } = await supabase.from('objectives').delete().eq('id', id);
    if (error) throw error;
  },

  // Projects
  async getProjects() {
    const { data, error } = await supabase.from('projects').select('*').order('order_index');
    if (error) throw error;
    return data.map(this.mapProject);
  },
  async createProject(proj: Omit<Project, 'id' | 'createdAt'>, userId: string, objectiveId: string) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        user_id: userId,
        objective_id: objectiveId, 
        title: proj.title,
        status: proj.status,
        order_index: proj.order,
        workspace_id: proj.workspaceId
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapProject(data);
  },
  async updateProject(id: string, updates: Partial<Project>) {
    const dbUpdates: any = { ...updates };
    if (updates.order !== undefined) {
      dbUpdates.order_index = updates.order;
      delete dbUpdates.order;
    }
    if (updates.objectiveId !== undefined) {
      dbUpdates.objective_id = updates.objectiveId;
      delete dbUpdates.objectiveId;
    }
    if (updates.workspaceId !== undefined) {
      dbUpdates.workspace_id = updates.workspaceId;
      delete dbUpdates.workspaceId;
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapProject(data);
  },
  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  // Activities
  async getActivities() {
    const { data, error } = await supabase.from('activities').select('*').order('order_index');
    if (error) throw error;
    return data.map((a: any) => this.mapActivity(a));
  },
  async createActivity(activity: Omit<Activity, 'id' | 'createdAt'>, userId: string, taskId: string | null | undefined, objectiveId: string, projectId?: string) {
    const { data, error } = await supabase
      .from('activities')
      .insert({ 
        user_id: userId,
        task_id: taskId || null,
        objective_id: objectiveId,
        project_id: projectId || null,
        title: activity.title,
        planned_minutes: activity.plannedMinutesPerSession,
        executed_minutes: activity.minutesSpentToday,
        status: activity.status,
        order_index: activity.order
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapActivity(data);
  },
  async updateActivity(id: string, updates: Partial<Activity>) {
    const { data, error } = await supabase.from('activities').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return this.mapActivity(data);
  },
  async deleteActivity(id: string) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) throw error;
  },

  // Mappers
  mapObjective(db: any): Objective {
    return {
      id: db.id,
      goalId: db.goal_id,
      title: db.title,
      description: db.description,
      status: db.status,
      order: db.order_index,
      period: db.period || 'monthly',
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at,
      workspaceId: db.workspace_id
    };
  },
  mapProject(db: any): Project {
    return {
      id: db.id,
      objectiveId: db.objective_id,
      title: db.title,
      status: db.status,
      order: db.order_index,
      period: db.period || 'monthly',
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at,
      workspaceId: db.workspace_id
    };
  },

  mapActivity(db: any): Activity {
    return {
      id: db.id,
      objectiveId: db.objective_id,
      projectId: db.project_id,
      title: db.title,
      plannedMinutesPerSession: db.planned_minutes,
      minutesSpentToday: db.executed_minutes,
      status: db.status,
      order: db.order_index,
      period: db.period || 'daily',
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at
    };
  }
};
