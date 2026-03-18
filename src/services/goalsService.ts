import { Goal } from '../types';
import { supabase } from '../lib/supabaseClient';

export const goalsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map((g: any) => this.mapGoal(g));
  },

  async create(goal: Omit<Goal, 'id' | 'createdAt'>, userId: string) {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        priority: goal.priority,
        color: goal.color,
        workspace_id: goal.workspaceId 
      })
      .select()
      .single();
    
    if (error) throw error;
    return this.mapGoal(data);
  },

  async update(id: string, updates: Partial<Goal>) {
    const dbUpdates: any = { ...updates };
    if (updates.workspaceId !== undefined) {
      dbUpdates.workspace_id = updates.workspaceId;
      delete dbUpdates.workspaceId;
    }
    if (updates.statusUpdatedAt !== undefined) {
      dbUpdates.updated_at = updates.statusUpdatedAt;
      delete dbUpdates.statusUpdatedAt;
    }

    const { data, error } = await supabase
      .from('goals')
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.mapGoal(data);
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Mappers
  mapGoal(db: any): Goal {
    return {
      id: db.id,
      title: db.title,
      description: db.description,
      category: db.category,
      status: db.status,
      priority: db.priority,
      color: db.color,
      createdAt: db.created_at,
      statusUpdatedAt: db.updated_at,
      workspaceId: db.workspace_id,
      period: 'quarterly', 
    };
  }
};
