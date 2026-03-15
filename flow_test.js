/**
 * 1440 App - Complete Functional Flow Test
 * =========================================
 * Paste this ENTIRE script into the browser DevTools Console
 * while on any page of the app (http://localhost:5173)
 *
 * It will automatically:
 * 1. Create a Goal
 * 2. Create an Objective under the Goal
 * 3. Create a Project under the Objective
 * 4. Create an Activity
 * 5. Execute the Activity (log 15 min)
 * 6. Report persistence instructions
 * 7. Delete the Goal and verify cascading
 */

(async () => {
  console.clear();
  console.log('%c🧪 1440 FLOW TEST STARTING...', 'color: #6366f1; font-size: 16px; font-weight: bold;');

  const store = window.useAppStore?.getState?.();
  if (!store) {
    console.error('❌ Store not found. Make sure you are on http://localhost:5173 and the app is loaded.');
    return;
  }

  const results = {
    goalCreated: false,
    objectiveCreated: false,
    projectCreated: false,
    activityCreated: false,
    activityExecuted: false,
    cascadeDeleteWorked: false,
    errors: []
  };

  // ─────────────────────────────────────────────
  // STEP 1: Create Goal
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 1: Creating Goal...', 'color: #f59e0b; font-weight: bold;');
  const beforeGoals = store.goals.length;
  try {
    await store.addGoal({
      title: 'Flow Test Goal',
      description: 'Automated flow test',
      category: 'professional',
      period: 'annual',
      status: 'active',
      order: 0
    });
    const afterGoals = window.useAppStore.getState().goals;
    const newGoal = afterGoals.find(g => g.title === 'Flow Test Goal');
    if (newGoal) {
      results.goalCreated = true;
      console.log(`%c✅ Goal created: "${newGoal.title}" [id: ${newGoal.id}]`, 'color: #10b981;');
    } else {
      throw new Error('Goal not found in state after creation');
    }
  } catch (err) {
    results.errors.push(`Goal: ${err.message}`);
    console.error('❌ Goal creation failed:', err);
    return;
  }

  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────
  // STEP 2: Create Objective under Goal
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 2: Creating Objective...', 'color: #f59e0b; font-weight: bold;');
  const testGoal = window.useAppStore.getState().goals.find(g => g.title === 'Flow Test Goal');
  try {
    await store.addObjective({
      title: 'Objective Alpha',
      goalId: testGoal.id,
      period: 'monthly',
      status: 'active',
      order: 0
    });
    const newObj = window.useAppStore.getState().objectives.find(o => o.title === 'Objective Alpha');
    if (newObj) {
      results.objectiveCreated = true;
      console.log(`%c✅ Objective created: "${newObj.title}" [goalId: ${newObj.goalId}]`, 'color: #10b981;');
      if (newObj.goalId !== testGoal.id) {
        console.warn('⚠️ goalId mismatch! Expected:', testGoal.id, 'Got:', newObj.goalId);
      }
    } else {
      throw new Error('Objective not found in state after creation');
    }
  } catch (err) {
    results.errors.push(`Objective: ${err.message}`);
    console.error('❌ Objective creation failed:', err);
  }

  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────
  // STEP 3: Create Project under Objective
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 3: Creating Project...', 'color: #f59e0b; font-weight: bold;');
  const testObj = window.useAppStore.getState().objectives.find(o => o.title === 'Objective Alpha');
  try {
    if (!testObj) throw new Error('Objective not found — skipping');
    await store.addProject({
      title: 'Project Beta',
      objectiveId: testObj.id,
      period: 'monthly',
      status: 'active',
      order: 0
    });
    const newProj = window.useAppStore.getState().projects.find(p => p.title === 'Project Beta');
    if (newProj) {
      results.projectCreated = true;
      console.log(`%c✅ Project created: "${newProj.title}" [objectiveId: ${newProj.objectiveId}]`, 'color: #10b981;');
      if (newProj.objectiveId !== testObj.id) {
        console.warn('⚠️ objectiveId mismatch! Expected:', testObj.id, 'Got:', newProj.objectiveId);
      }
    } else {
      throw new Error('Project not found in state after creation');
    }
  } catch (err) {
    results.errors.push(`Project: ${err.message}`);
    console.error('❌ Project creation failed:', err);
  }

  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────
  // STEP 4: Create Activity under Objective
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 4: Creating Activity...', 'color: #f59e0b; font-weight: bold;');
  const latestObj = window.useAppStore.getState().objectives.find(o => o.title === 'Objective Alpha');
  try {
    if (!latestObj) throw new Error('Objective not found — skipping');
    const success = await store.addActivity({
      title: 'Activity Gamma',
      plannedMinutesPerSession: 30,
      objectiveId: latestObj.id,
      period: 'daily'
    });
    const newAct = window.useAppStore.getState().activities.find(a => a.title === 'Activity Gamma');
    if (newAct) {
      results.activityCreated = true;
      console.log(`%c✅ Activity created: "${newAct.title}" [objectiveId: ${newAct.objectiveId}] [${newAct.plannedMinutesPerSession} min]`, 'color: #10b981;');
    } else {
      throw new Error(success === false ? 'addActivity returned false (1440 limit exceeded?)' : 'Activity not found in state');
    }
  } catch (err) {
    results.errors.push(`Activity: ${err.message}`);
    console.error('❌ Activity creation failed:', err);
  }

  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────
  // STEP 5: Execute Activity (Log 15 min)
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 5: Executing Activity (logging 15 min)...', 'color: #f59e0b; font-weight: bold;');
  const testAct = window.useAppStore.getState().activities.find(a => a.title === 'Activity Gamma');
  try {
    if (!testAct) throw new Error('Activity not found — skipping');
    const execResult = await store.logActivityExecution(testAct.id, 15);
    if (execResult.success) {
      const updated = window.useAppStore.getState().activities.find(a => a.id === testAct.id);
      results.activityExecuted = true;
      const metrics = window.useAppStore.getState().getDailyMetrics();
      console.log(`%c✅ Activity executed: ${updated.minutesSpentToday}/${updated.plannedMinutesPerSession} min logged`, 'color: #10b981;');
      console.log(`%c📊 1440 Engine Metrics: planned=${metrics.plannedMinutes}min | executed=${metrics.executedMinutes}min | free=${metrics.freeMinutes}min | alignment=${metrics.alignmentPercent}%`, 'color: #818cf8;');
    } else {
      throw new Error(execResult.message);
    }
  } catch (err) {
    results.errors.push(`Execution: ${err.message}`);
    console.error('❌ Activity execution failed:', err);
  }

  await new Promise(r => setTimeout(r, 800));

  // ─────────────────────────────────────────────
  // STEP 6 & 7: Report Persistence Instructions
  // ─────────────────────────────────────────────
  console.log('\n%cSTEP 6 & 7: Persistence Test', 'color: #f59e0b; font-weight: bold;');
  const stateSnapshot = {
    goals: window.useAppStore.getState().goals.map(g => g.title),
    objectives: window.useAppStore.getState().objectives.map(o => o.title),
    projects: window.useAppStore.getState().projects.map(p => p.title),
    activities: window.useAppStore.getState().activities.map(a => ({ title: a.title, minutesSpentToday: a.minutesSpentToday }))
  };
  console.log('%cState BEFORE refresh:', 'color: #94a3b8;', JSON.stringify(stateSnapshot, null, 2));
  console.log('%c⚡ Now press F5 to refresh, then re-run ONLY STEP 8 below after reload.', 'color: #fbbf24; font-size: 14px; font-weight: bold;');
  console.log('   After refresh, run: verifyPersistence()');

  window.verifyPersistence = () => {
    const afterState = {
      goals: window.useAppStore.getState().goals.map(g => g.title),
      objectives: window.useAppStore.getState().objectives.map(o => o.title),
      projects: window.useAppStore.getState().projects.map(p => p.title),
      activities: window.useAppStore.getState().activities.map(a => ({ title: a.title, minutesSpentToday: a.minutesSpentToday }))
    };
    const goalsOk = afterState.goals.includes('Flow Test Goal');
    const objOk = afterState.objectives.includes('Objective Alpha');
    const projOk = afterState.projects.includes('Project Beta');
    const actOk = afterState.activities.some(a => a.title === 'Activity Gamma' && a.minutesSpentToday === 15);
    console.log('\n%c📦 PERSISTENCE CHECK:', 'color: #6366f1; font-size: 14px; font-weight: bold;');
    console.log(goalsOk ? '%c✅ Goal persisted' : '%c❌ Goal LOST', 'color: ' + (goalsOk ? '#10b981' : '#ef4444') + ';');
    console.log(objOk ? '%c✅ Objective persisted' : '%c❌ Objective LOST', 'color: ' + (objOk ? '#10b981' : '#ef4444') + ';');
    console.log(projOk ? '%c✅ Project persisted' : '%c❌ Project LOST', 'color: ' + (projOk ? '#10b981' : '#ef4444') + ';');
    console.log(actOk ? '%c✅ Activity persisted (with 15 min logged)' : '%c❌ Activity LOST or minutes reset', 'color: ' + (actOk ? '#10b981' : '#ef4444') + ';');
    return { goalsOk, objOk, projOk, actOk };
  };

  // ─────────────────────────────────────────────
  // STEP 8 & 9: Delete Goal + Cascading Deletes
  // ─────────────────────────────────────────────
  window.testCascadeDelete = async () => {
    const store = window.useAppStore.getState();
    const goal = store.goals.find(g => g.title === 'Flow Test Goal');
    if (!goal) { console.error('Goal not found! Maybe already deleted.'); return; }

    const beforeObjs = store.objectives.filter(o => o.goalId === goal.id).map(o => o.id);
    const beforeProjs = store.projects.filter(p => beforeObjs.includes(p.objectiveId)).map(p => p.id);
    const beforeActs = store.activities.filter(a => beforeObjs.includes(a.objectiveId)).map(a => a.id);

    console.log('\n%cSTEP 8 & 9: Cascade Delete Test', 'color: #f59e0b; font-weight: bold;');
    console.log(`📋 Before delete: ${beforeObjs.length} objectives, ${beforeProjs.length} projects, ${beforeActs.length} activities`);

    await store.removeGoal(goal.id);
    await new Promise(r => setTimeout(r, 500));

    const afterState = window.useAppStore.getState();
    const goalGone = !afterState.goals.find(g => g.title === 'Flow Test Goal');
    const objsGone = beforeObjs.every(id => !afterState.objectives.find(o => o.id === id));
    const projsGone = beforeProjs.every(id => !afterState.projects.find(p => p.id === id));
    const actsGone = beforeActs.every(id => !afterState.activities.find(a => a.id === id));

    console.log(goalGone ? '%c✅ Goal deleted' : '%c❌ Goal still exists', 'color: ' + (goalGone ? '#10b981' : '#ef4444') + ';');
    console.log(objsGone ? '%c✅ Objectives cascade-deleted' : '%c❌ Objectives still exist (LEAK!)', 'color: ' + (objsGone ? '#10b981' : '#ef4444') + ';');
    console.log(projsGone ? '%c✅ Projects cascade-deleted' : '%c❌ Projects still exist (LEAK!)', 'color: ' + (projsGone ? '#10b981' : '#ef4444') + ';');
    console.log(actsGone ? '%c✅ Activities cascade-deleted' : '%c❌ Activities still exist (LEAK!)', 'color: ' + (actsGone ? '#10b981' : '#ef4444') + ';');

    const allPass = goalGone && objsGone && projsGone && actsGone;
    console.log(allPass ? '%c\n🎉 CASCADE DELETE: ALL PASS' : '%c\n⚠️ CASCADE DELETE: PARTIAL FAIL', 'color: ' + (allPass ? '#10b981' : '#ef4444') + '; font-size: 16px; font-weight: bold;');
    return { goalGone, objsGone, projsGone, actsGone };
  };

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────
  console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #475569;');
  console.log('%c📋 FLOW TEST SUMMARY (Steps 1-5)', 'color: #6366f1; font-size: 15px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #475569;');
  console.log(`Step 1 - Goal Created:     ${results.goalCreated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 2 - Obj Created:      ${results.objectiveCreated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 3 - Project Created:  ${results.projectCreated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 4 - Activity Created: ${results.activityCreated ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Step 5 - Executed 15 min:  ${results.activityExecuted ? '✅ PASS' : '❌ FAIL'}`);
  if (results.errors.length > 0) {
    console.log('%c\n⚠️ Errors encountered:', 'color: #ef4444;');
    results.errors.forEach(e => console.error(' •', e));
  }
  console.log('\n%c📌 NEXT STEPS (run manually):', 'color: #fbbf24; font-weight: bold;');
  console.log('  6. Press F5 to refresh the page');
  console.log('  7. After reload, run: verifyPersistence()');
  console.log('  8 & 9. Then run: testCascadeDelete()');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #475569;');
})();
