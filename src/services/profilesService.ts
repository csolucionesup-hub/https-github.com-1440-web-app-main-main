import { supabase } from '../lib/supabaseClient';

export const profilesService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
