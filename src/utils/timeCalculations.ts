// ===============================
// 1440 MINUTES ENGINE
// ===============================

export const MINUTES_PER_DAY = 1440;

// --------------------------------
// Rutinas del día
// --------------------------------

export interface DailyRoutine {
  sleepMinutes: number;
  fixedRoutineMinutes: number;
}

// --------------------------------
// Work session
// --------------------------------

export interface WorkSession {
  startTime: number;
  endTime: number;
}

// --------------------------------
// Minutos disponibles del día
// --------------------------------

export function calculateAvailableMinutes(
  routine: DailyRoutine
): number {

  const used =
    routine.sleepMinutes +
    routine.fixedRoutineMinutes;

  return MINUTES_PER_DAY - used;
}

// --------------------------------
// Minutos planificados
// --------------------------------

export function calculatePlannedMinutes(
  sessions: WorkSession[]
): number {

  return sessions.reduce((total, s) => {

    const duration = s.endTime - s.startTime;

    return total + duration;

  }, 0);

}

// --------------------------------
// Validar exceso de minutos
// --------------------------------

export function exceedsAvailableMinutes(
  sessions: WorkSession[],
  routine: DailyRoutine
): boolean {

  const planned = calculatePlannedMinutes(sessions);

  const available = calculateAvailableMinutes(routine);

  return planned > available;

}

// --------------------------------
// Detectar solapamientos
// --------------------------------

export function detectOverlaps(
  sessions: WorkSession[]
): boolean {

  const sorted = [...sessions].sort(
    (a, b) => a.startTime - b.startTime
  );

  for (let i = 0; i < sorted.length - 1; i++) {

    const current = sorted[i];
    const next = sorted[i + 1];

    if (current.endTime > next.startTime) {

      return true;

    }

  }

  return false;

}
