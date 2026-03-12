import { supabase } from '../lib/supabaseClient';

export const analyticsService = {
  async logTime(userId: string, activityId: string, minutes: number) {
    const { data, error } = await supabase
      .from('time_logs')
      .insert({
        user_id: userId,
        activity_id: activityId,
        minutes: minutes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDailyMinutes(userId: string, totalMinutes: number, usedMinutes: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // UPSERT daily snapshot
    const { data, error } = await supabase
      .from('daily_minutes')
      .upsert({
        user_id: userId,
        date: today,
        total_planned: totalMinutes,
        total_executed: usedMinutes
      }, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRecentLogs(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*, activities(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getWeeklySnapshots(userId: string) {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const { data, error } = await supabase
      .from('daily_minutes')
      .select('date, total_planned, total_executed')
      .eq('user_id', userId)
      .gte('date', last7Days.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTimeDistributionByCategory(userId: string) {
    // This requires a join with activities and goals/objectives
    // For simplicity in the MVP, we can fetch all logs for last 7 days and aggregate in client
    // or use a more complex SQL query if needed. 
    // Let's fetch logs with activity info.
    const { data, error } = await supabase
      .from('time_logs')
      .select(`
        minutes,
        activity_id,
        activities (
          objective_id,
          objectives (
            goal_id,
            goals (
              category,
              title
            )
          )
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;
    return data;
  }
};
