// Search, kind filters and the spoiler rule for the trophy browser.
// The filter state is plain data; this module never touches the page.

export function blankFilters() {
  return {
    query: '',
    grade: 'all',
    kind: 'all',
    hidden: 'all',
    onlyMissable: false,
    onlyUnconfirmed: false,
    onlyUnearned: false,
  };
}

// A trophy counts as a story spoiler while the spoiler setting hides it: it
// is a story trophy, it has not been earned yet, and the reader asked for
// spoilers to stay hidden. Earned story trophies always show their names —
// the reader has already seen them in the game.
export function isSpoilerMasked(trophy, state) {
  if (!state.spoilersHidden) return false;
  if (trophy.kind !== 'story') return false;
  return state.earned[String(trophy.id)] !== true;
}

export function matchesFilters(trophy, filters, state) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.hidden === 'hidden' && !trophy.hidden) return false;
  if (filters.hidden === 'visible' && trophy.hidden) return false;
  if (filters.onlyMissable && !trophy.missable) return false;
  if (filters.onlyUnconfirmed && !trophy.unconfirmed) return false;
  if (filters.onlyUnearned && state.earned[String(trophy.id)] === true) return false;
  if (filters.query) {
    const needle = filters.query.trim().toLowerCase();
    if (needle) {
      const haystack = [
        trophy.name,
        trophy.description,
        trophy.guide,
        trophy.kind,
        trophy.grade,
      ].join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
  }
  return true;
}

export function applyFilters(trophies, filters, state) {
  return trophies.filter((trophy) => matchesFilters(trophy, filters, state));
}

// The "next up" hint: the first unearned trophy in guide order, skipping the
// platinum and the golds (they are long-term goals, not a next step) and
// skipping trophies whose trigger is still unconfirmed, since no one can
// chase those yet.
export function nextUp(trophies, state) {
  for (const trophy of trophies) {
    if (trophy.grade === 'platinum' || trophy.grade === 'gold') continue;
    if (trophy.unconfirmed) continue;
    if (state.earned[String(trophy.id)] === true) continue;
    return trophy;
  }
  return null;
}
