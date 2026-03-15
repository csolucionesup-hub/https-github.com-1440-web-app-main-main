import { Activity, Objective, Project, Goal, WorkSession, Task } from '../types';

export const calculateProgress = (plannedMinutes: number, actualMinutes: number): number => {
    if (plannedMinutes === 0) return 0;
    return Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100));
};

export const getActivityStats = (activityId: string, workSessions: WorkSession[]) => {
    const sessions = workSessions.filter(ws => ws.activityId === activityId);

    const planned = sessions.reduce((acc, curr) => acc + curr.plannedMinutes, 0);
    const actual = sessions.reduce((acc, curr) => acc + curr.actualMinutes, 0);

    return { planned, actual, progress: calculateProgress(planned, actual) };
};

export const getObjectiveStats = (objectiveId: string, activities: Activity[], workSessions: WorkSession[]) => {
    const relatedActivities = activities.filter(a => a.objectiveId === objectiveId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedActivities.forEach(act => {
        const stats = getActivityStats(act.id, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};

export const getProjectStats = (projectId: string, objectives: Objective[], activities: Activity[], workSessions: WorkSession[]) => {
    // Project -> relates to objectives in this hierarchy? 
    // Wait, in types.ts Project belongs to Objective: objectiveId.
    // So getProjectStats for a Project ID:
    const stats = getObjectiveStats(projectId, activities, workSessions); // If Project is synonymous with Objective in some views
    return stats;
};

export const getGoalStats = (goalId: string, projects: Project[], objectives: Objective[], activities: Activity[], workSessions: WorkSession[]) => {
    const relatedObjectives = objectives.filter(o => o.goalId === goalId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedObjectives.forEach(obj => {
        const stats = getObjectiveStats(obj.id, activities, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};

// Task (Action Plan) stats if needed, though they are usually just TODOs
export const getTaskStats = (taskId: string) => {
    return { progress: 0 }; // Placeholder if needed by old components
};
