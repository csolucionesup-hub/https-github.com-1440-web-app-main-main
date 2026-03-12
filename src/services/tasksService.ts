import { Project, Objective, Task, Activity } from '../types';
import { supabase } from '../lib/supabaseClient';

export const tasksService = {
  // Objectives
  async getObjectives() {
    const { data, error } = await supabase.from('objectives').select('*').order('order_index');
    if (error) throw error;
    return data.map(this.mapObjective);
  },
  async createObjective(obj: Omit<Objective, 'id' | 'createdAt'>, userId: string, projectId: string) {
    const { data, error } = await supabase
      .from('objectives')
      .insert({ 
        user_id: userId,
        goal_id: projectId, // Reusing goal_id slot for projectId in new hierarchy
        title: obj.title,
        description: obj.description,
        status: obj.status,
        order_index: obj.order
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapObjective(data);
  },
  async updateObjective(id: string, updates: Partial<Objective>) {
    const { data, error } = await supabase
      .from('objectives')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        order_index: updates.order,
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
  async createProject(proj: Omit<Project, 'id' | 'createdAt'>, userId: string, goalId: string) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ 
        user_id: userId,
        objective_id: goalId, // Reusing objective_id slot for goalId in new hierarchy
        title: proj.title,
        status: proj.status,
        order_index: proj.order
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapProject(data);
  },
  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: updates.title,
        status: updates.status,
        order_index: updates.order,
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

  // Tasks (Action Plan)
  async getTasks() {
    const { data, error } = await supabase.from('tasks').select('*').order('order_index');
    if (error) throw error;
    return data.map(this.mapTask);
  },
  async createTask(task: Omit<Task, 'id' | 'createdAt'>, userId: string, activityId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ 
        user_id: userId,
        project_id: activityId, // Reusing project_id slot for activityId
        title: task.title,
        description: task.description,
        status: task.status,
        period: task.period,
        order_index: task.order
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapTask(data);
  },
  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        period: updates.period,
        order_index: updates.order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return this.mapTask(data);
  },
  async deleteTask(id: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  // Activities
  async getActivities() {
    const { data, error } = await supabase.from('activities').select('*').order('order_index');
    if (error) throw error;
    return data.map((a: any) => this.mapActivity(a));
  },
  async createActivity(activity: Omit<Activity, 'id' | 'createdAt'>, userId: string, taskId: string | undefined, objectiveId: string) {
    const { data, error } = await supabase
      .from('activities')
      .insert({ 
        user_id: userId,
        task_id: taskId || null,
        objective_id: objectiveId,
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
      projectId: db.goal_id, // Map DB goal_id -> projectId
      title: db.title,
      description: db.description,
      status: db.status,
      order: db.order_index,
      period: db.period || 'monthly',
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at
    };
  },
  mapProject(db: any): Project {
    return {
      id: db.id,
      goalId: db.objective_id, // Map DB objective_id -> goalId
      title: db.title,
      status: db.status,
      order: db.order_index,
      period: db.period || 'monthly',
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at
    };
  },
  mapTask(db: any): Task {
    return {
      id: db.id,
      activityId: db.project_id, // Map DB project_id -> activityId
      title: db.title,
      description: db.description,
      status: db.status,
      period: db.period || 'daily',
      order: db.order_index,
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at
    };
  },
  mapActivity(db: any): Activity {
    return {
      id: db.id,
      objectiveId: db.objective_id,
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
