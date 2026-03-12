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

export const getTaskStats = (taskId: string, activities: Activity[], workSessions: WorkSession[]) => {
    const relatedActivities = activities.filter(a => a.taskId === taskId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedActivities.forEach(act => {
        const stats = getActivityStats(act.id, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};

export const getProjectStats = (projectId: string, actionPlans: Task[], activities: Activity[], workSessions: WorkSession[]) => {
    const relatedTasks = actionPlans.filter(t => t.projectId === projectId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedTasks.forEach(task => {
        const stats = getTaskStats(task.id, activities, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};

export const getObjectiveStats = (objectiveId: string, projects: Project[], actionPlans: Task[], activities: Activity[], workSessions: WorkSession[]) => {
    const relatedProjects = projects.filter(p => p.objectiveId === objectiveId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedProjects.forEach(proj => {
        const stats = getProjectStats(proj.id, actionPlans, activities, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};

export const getGoalStats = (goalId: string, objectives: Objective[], projects: Project[], actionPlans: Task[], activities: Activity[], workSessions: WorkSession[]) => {
    const relatedObjectives = objectives.filter(o => o.goalId === goalId);

    let totalPlanned = 0;
    let totalActual = 0;

    relatedObjectives.forEach(obj => {
        const stats = getObjectiveStats(obj.id, projects, actionPlans, activities, workSessions);
        totalPlanned += stats.planned;
        totalActual += stats.actual;
    });

    return { planned: totalPlanned, actual: totalActual, progress: calculateProgress(totalPlanned, totalActual) };
};
