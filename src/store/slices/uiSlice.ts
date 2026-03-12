import { StateCreator } from "zustand";
import { AppState, UISlice } from "../types";
import { AchievementState, UserQuote, Activity } from "../../types";
import { achievementRules } from "../../config/achievements";
import { profilesService } from "../../services/profilesService";
import { supabase } from "../../lib/supabaseClient";
import { generateId } from "../../utils/uuid";

export const createUISlice: StateCreator<
  AppState,
  [],
  [],
  UISlice
> = (set, get) => ({
  userQuotes: [],
  achievements: {
    stars: 0,
    medals: 0,
    trophies: 0,
    totalMinutesInvested: 0,
    unlockedIds: [],
  },
  rewardNotification: null,

  clearReward: () => set({ rewardNotification: null }),

  addQuote: (text) => {
    const newQuote: UserQuote = {
      id: generateId(),
      text,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ userQuotes: [...state.userQuotes, newQuote] }));
  },

  updateQuote: (id, text) => {
    set((state) => ({
      userQuotes: state.userQuotes.map((q) => q.id === id ? { ...q, text } : q),
    }));
  },

  removeQuote: (id) => {
    set((state) => ({
      userQuotes: state.userQuotes.filter((q) => q.id !== id),
    }));
  },

  updateAchievements: async (minutes, updatedActivities) => {
    const state = get();
    const newTotalMinutes = state.achievements.totalMinutesInvested + minutes;
    const completedCount = updatedActivities.filter(a => (a.minutesSpentToday || 0) >= (a.plannedMinutesPerSession || 0)).length;

    let rewardNotification = null;
    let newUnlockedIds = [...state.achievements.unlockedIds];
    let newStars = state.achievements.stars;
    let newMedals = state.achievements.medals;
    let newTrophies = state.achievements.trophies;

    achievementRules.forEach((rule) => {
      if (newUnlockedIds.includes(rule.id)) return;

      let unlocked = false;
      if (rule.condition.type === "activity_count" && completedCount >= (rule.condition.threshold || 0)) {
        unlocked = true;
      } else if (rule.condition.type === "total_minutes" && newTotalMinutes >= (rule.condition.threshold || 0)) {
        unlocked = true;
      }

      if (unlocked) {
        newUnlockedIds.push(rule.id);
        if (rule.rewardType === "star") newStars++;
        if (rule.rewardType === "medal") newMedals++;
        if (rule.rewardType === "trophy") newTrophies++;
        rewardNotification = { id: rule.id, title: rule.title, type: rule.rewardType };
      }
    });

    set({ 
      achievements: {
        stars: newStars,
        medals: newMedals,
        trophies: newTrophies,
        totalMinutesInvested: newTotalMinutes,
        unlockedIds: newUnlockedIds,
      },
      rewardNotification: rewardNotification || state.rewardNotification
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        await profilesService.updateProfile(session.user.id, {
          stars: newStars,
          medals: newMedals,
          trophies: newTrophies,
          total_minutes_invested: newTotalMinutes,
          unlocked_ids: newUnlockedIds
        });
      } catch (error) { console.error("Cloud Achievement Sync Error:", error); }
    }
  },
});
