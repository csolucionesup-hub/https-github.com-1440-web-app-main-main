export type RewardType = "star" | "medal" | "trophy";

export interface AchievementRule {
  id: string;
  title: string;
  description: string;
  rewardType: RewardType;
  condition: {
    type: "total_minutes" | "activity_count" | "goal_completed" | "streak";
    threshold?: number;
  };
}

export const achievementRules: AchievementRule[] = [
  // Stars (Everyday actions)
  {
    id: "first_activity",
    title: "Primer Paso",
    description: "Completa tu primera actividad planeada.",
    rewardType: "star",
    condition: { type: "activity_count", threshold: 1 }
  },
  {
    id: "active_day",
    title: "Día Activo",
    description: "Completa 5 actividades en un día.",
    rewardType: "star",
    condition: { type: "activity_count", threshold: 5 }
  },
  
  // Medals (Milestones)
  {
    id: "300_min_club",
    title: "Club de los 300",
    description: "Invierte 300 minutos acumulados en tus metas.",
    rewardType: "medal",
    condition: { type: "total_minutes", threshold: 300 }
  },
  {
    id: "1000_min_pro",
    title: "Pro 1440",
    description: "Invierte 1000 minutos acumulados en tus metas.",
    rewardType: "medal",
    condition: { type: "total_minutes", threshold: 1000 }
  },

  // Trophies (Big Achievements)
  {
    id: "goal_crusher",
    title: "Conquistador de Metas",
    description: "Completa una meta al 100%.",
    rewardType: "trophy",
    condition: { type: "goal_completed" }
  }
];
