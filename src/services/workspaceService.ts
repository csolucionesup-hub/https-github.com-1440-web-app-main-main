import { Workspace } from '../types';
import { supabase } from '../lib/supabaseClient';

export const workspaceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      color: w.color,
      icon: w.icon,
      createdAt: w.created_at
    }));
  },

  async create(workspace: Omit<Workspace, 'id' | 'createdAt'>, userId: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        user_id: userId,
        name: workspace.name,
        description: workspace.description,
        color: workspace.color,
        icon: workspace.icon
      })
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      createdAt: data.created_at
    };
  },

  async createOrGetByName(name: string, userId: string, defaults: Partial<Workspace>) {
    const { data: existing } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', userId)
      .eq('name', name)
      .maybeSingle();

    if (existing) return {
      id: existing.id,
      name: existing.name,
      description: existing.description,
      color: existing.color,
      icon: existing.icon,
      createdAt: existing.created_at
    };

    return this.create({ name, ...defaults } as any, userId);
  },

  async update(id: string, updates: Partial<Workspace>) {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
