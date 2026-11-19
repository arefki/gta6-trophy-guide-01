// Saved progress for the Leonida trophy guide. Everything lives in the
// browser's localStorage under one key; nothing is sent anywhere. The guide
// also exports progress to a file and imports it back, so a hunter can move
// their checklist between machines.

const STORAGE_KEY = 'leonida-trophy-guide-v1';

function blankState() {
  return { earned: {}, checklist: {}, spoilersHidden: true };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankState();
    const state = blankState();
    if (parsed.earned && typeof parsed.earned === 'object') state.earned = parsed.earned;
    if (parsed.checklist && typeof parsed.checklist === 'object') state.checklist = parsed.checklist;
    if (typeof parsed.spoilersHidden === 'boolean') state.spoilersHidden = parsed.spoilersHidden;
    return state;
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage can be full or disabled in a private window; the guide still
    // works for the session, it just cannot remember progress.
  }
}

export function isEarned(state, trophyId) {
  return state.earned[String(trophyId)] === true;
}

export function setEarned(state, trophyId, earned) {
  if (earned) {
    state.earned[String(trophyId)] = true;
  } else {
    delete state.earned[String(trophyId)];
  }
  saveState(state);
}

export function isChecklistDone(state, itemId) {
  return state.checklist[String(itemId)] === true;
}

export function setChecklistDone(state, itemId, done) {
  if (done) {
    state.checklist[String(itemId)] = true;
  } else {
    delete state.checklist[String(itemId)];
  }
  saveState(state);
}

export function earnedCount(state, trophies) {
  let count = 0;
  let score = 0;
  for (const trophy of trophies) {
    if (isEarned(state, trophy.id)) {
      count += 1;
      score += trophy.gamerscore || 0;
    }
  }
  return { count, score };
}

export function checklistCount(state, groups) {
  let done = 0;
  let total = 0;
  for (const group of groups) {
    for (const item of group.items) {
      total += 1;
      if (isChecklistDone(state, item.id)) done += 1;
    }
  }
  return { done, total };
}

// Download the current progress as a JSON file the hunter can keep or import
// on another machine. The file name carries a fixed date string, never today.
export function exportProgress(state) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exported: '19 November 2026',
    earned: Object.keys(state.earned).filter((id) => state.earned[id]),
    checklist: Object.keys(state.checklist).filter((id) => state.checklist[id]),
  };
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Read a progress file produced by exportProgress (or written by hand in the
// same shape) and fold it into the current state. Returns a short report the
// UI can show: how many trophies and checklist items were imported.
export function importProgress(state, fileText) {
  const parsed = JSON.parse(fileText);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a progress file.');
  let trophies = 0;
  let items = 0;
  if (Array.isArray(parsed.earned)) {
    for (const id of parsed.earned) {
      if (typeof id === 'string' || typeof id === 'number') {
        state.earned[String(id)] = true;
        trophies += 1;
      }
    }
  }
  if (Array.isArray(parsed.checklist)) {
    for (const id of parsed.checklist) {
      if (typeof id === 'string' || typeof id === 'number') {
        state.checklist[String(id)] = true;
        items += 1;
      }
    }
  }
  saveState(state);
  return { trophies, items };
}

export function resetProgress(state) {
  state.earned = {};
  state.checklist = {};
  saveState(state);
}
