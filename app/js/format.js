// Small pure helpers for the Leonida trophy guide: grade icons and text safety.
// No network, no dates, no randomness — everything here is deterministic.

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export const GRADE_COLORS = {
  platinum: '#bfe9ff',
  gold: '#e8b64c',
  silver: '#c3c9cf',
  bronze: '#c98b5e',
};

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side quests',
  activities: 'Activities',
  crime: 'Crime',
  collectibles: 'Collectibles',
  combat: 'Combat',
  money: 'Money',
  misc: 'Misc',
};

// One trophy-cup outline, tinted per grade. The same cup shape is used for
// every grade so the colour, not the drawing, carries the meaning.
export function gradeIcon(grade) {
  const color = GRADE_COLORS[grade] || GRADE_COLORS.bronze;
  const label = GRADE_LABELS[grade] || grade;
  return (
    '<svg viewBox="0 0 40 40" role="img" aria-label="' + label + ' trophy">' +
    '<title>' + label + ' trophy</title>' +
    '<desc>A trophy cup in ' + label.toLowerCase() + '</desc>' +
    '<path d="M11 4h18v6a9 9 0 0 1-18 0V4z" fill="' + color + '"/>' +
    '<path d="M11 7H5a6 6 0 0 0 6 7M29 7h6a6 6 0 0 1-6 7" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<rect x="18.4" y="19" width="3.2" height="7" fill="' + color + '"/>' +
    '<rect x="13" y="26" width="14" height="3.4" rx="1.4" fill="' + color + '"/>' +
    '<rect x="10.5" y="31" width="19" height="3.4" rx="1.4" fill="' + color + '"/>' +
    '</svg>'
  );
}

// Escape user-visible text before it is placed into the page. The trophy data
// is our own, but escaping keeps the renderer honest if a name ever carries a
// stray angle bracket.
export function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function plural(count, one, many) {
  return count === 1 ? one : many;
}

// A short, human-readable count label for a trophy PSN tracks numerically,
// for example "PSN tracks: 250 stunts". The caller supplies the unit.
export function countLabel(trophy) {
  if (trophy.count === null || trophy.count === undefined) return '';
  return 'PSN tracks: ' + trophy.count.toLocaleString('en-US');
}
