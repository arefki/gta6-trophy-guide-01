// Rendering for the Leonida trophy guide: trophy cards, the 100% checklist
// and the sticky progress bar. All text from the data files is escaped before
// it reaches the page; source links come from the sources file only.

import { esc, gradeIcon, GRADE_LABELS, KIND_LABELS, countLabel } from './format.js';
import { isSpoilerMasked, nextUp } from './filters.js';
import { isEarned, setEarned, isChecklistDone, setChecklistDone, earnedCount, checklistCount } from './store.js';

function sourceLinks(trophy, sources) {
  const parts = [];
  for (const key of trophy.sources || []) {
    const source = sources[key];
    if (!source) continue;
    parts.push(
      '<a href="' + esc(source.url) + '" target="_blank" rel="noopener">' + esc(source.name) + '</a>'
    );
  }
  if (parts.length === 0) return '';
  return '<p class="card-sources">Sources: ' + parts.join(' · ') + '</p>';
}

function badgeRow(trophy) {
  const pills = [];
  pills.push('<span class="pill grade-' + trophy.grade + '">' + esc(GRADE_LABELS[trophy.grade]) + '</span>');
  pills.push('<span class="pill gscore">' + trophy.gamerscore + 'G</span>');
  pills.push('<span class="pill">' + esc(KIND_LABELS[trophy.kind] || trophy.kind) + '</span>');
  if (trophy.hidden) pills.push('<span class="pill hidden-flag">Hidden</span>');
  if (trophy.missable) pills.push('<span class="pill missable">Possibly missable</span>');
  if (trophy.unconfirmed) pills.push('<span class="pill unconfirmed">Trigger unconfirmed</span>');
  const tracked = countLabel(trophy);
  if (tracked) pills.push('<span class="pill">' + esc(tracked) + '</span>');
  return '<div class="card-meta">' + pills.join('') + '</div>';
}

function trophyCard(trophy, state, sources) {
  const earned = isEarned(state, trophy.id);
  const masked = isSpoilerMasked(trophy, state);
  const classes = ['card', 'grade-' + trophy.grade];
  if (earned) classes.push('earned');

  let body = '';
  if (masked) {
    const chapter = trophy.chapter ? ' — Chapter ' + trophy.chapter : '';
    body +=
      '<p class="spoiler-mask">Story trophy' + esc(chapter) + '. Its name and description are hidden until you earn it — tick “Earned” below, or turn spoilers on, to reveal them.</p>';
  } else {
    body += '<p class="card-desc">' + esc(trophy.description) + '</p>';
    body += '<p class="card-guide">' + esc(trophy.guide) + '</p>';
    body += sourceLinks(trophy, sources);
  }

  const name = masked ? 'Hidden story trophy' : trophy.name;
  return (
    '<article class="' + classes.join(' ') + '" data-trophy-id="' + trophy.id + '">' +
    '<div class="card-top">' +
    '<span class="grade-badge">' + gradeIcon(trophy.grade) + '</span>' +
    '<h3 class="card-name">' + esc(name) + '</h3>' +
    '</div>' +
    badgeRow(trophy) +
    body +
    '<div class="card-foot">' +
    '<label class="earn-check"><input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? ' checked' : '') + '> Earned</label>' +
    '<span class="diff">Difficulty <b>' + esc(trophy.difficulty) + ' (estimate)</b></span>' +
    '</div>' +
    '</article>'
  );
}

export function renderTrophies(container, trophies, state, sources) {
  if (trophies.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><p><b>No trophies match those filters.</b></p>' +
      '<p>Loosen a filter or clear the search to see the full list of 55.</p></div>';
    return;
  }
  container.innerHTML = trophies.map((trophy) => trophyCard(trophy, state, sources)).join('');
}

export function wireEarnedCheckboxes(container, state, onChange) {
  container.querySelectorAll('input[data-earn]').forEach((box) => {
    box.addEventListener('change', () => {
      setEarned(state, box.getAttribute('data-earn'), box.checked);
      onChange();
    });
  });
}

export function renderChecklist(container, groups, state) {
  let html = '';
  for (const group of groups) {
    let done = 0;
    for (const item of group.items) {
      if (isChecklistDone(state, item.id)) done += 1;
    }
    html += '<div class="check-group">';
    html += '<div class="check-group-head"><h3>' + esc(group.title) + '</h3>' +
      '<span class="group-count">' + done + ' / ' + group.items.length + '</span></div>';
    if (group.note) html += '<p>' + esc(group.note) + '</p>';
    html += '<div class="check-items">';
    for (const item of group.items) {
      const checked = isChecklistDone(state, item.id);
      html +=
        '<label class="check-item' + (checked ? ' done' : '') + '">' +
        '<input type="checkbox" data-check="' + esc(item.id) + '"' + (checked ? ' checked' : '') + '>' +
        '<span>' + esc(item.label) + '</span>' +
        '<span class="target">' + esc(item.target) + '</span>' +
        '</label>';
    }
    html += '</div></div>';
  }
  container.innerHTML = html;
}

export function wireChecklistBoxes(container, state, onChange) {
  container.querySelectorAll('input[data-check]').forEach((box) => {
    box.addEventListener('change', () => {
      setChecklistDone(state, box.getAttribute('data-check'), box.checked);
      onChange();
    });
  });
}

// Refresh every progress readout on the page from the current state: the
// sticky header bar, the "next up" hint and the 100% checklist summary.
export function refreshProgress(state, trophies, groups, els) {
  const earned = earnedCount(state, trophies);
  const totalScore = trophies.reduce((sum, t) => sum + (t.gamerscore || 0), 0);
  const pct = trophies.length === 0 ? 0 : Math.round((earned.count / trophies.length) * 100);
  els.fill.style.width = pct + '%';
  els.label.innerHTML = '<b>' + earned.count + ' / ' + trophies.length + '</b> trophies earned';
  els.meta.textContent = earned.score + ' / ' + totalScore + 'G · ' + pct + '%';
  const next = nextUp(trophies, state);
  if (!next) {
    els.nextUp.innerHTML = 'Every trophy is ticked. <b>Vice got a price — and you paid it.</b>';
  } else if (isSpoilerMasked(next, state)) {
    // Never spoil a story trophy's name in the header: say only its chapter.
    els.nextUp.innerHTML =
      'Next up: a story trophy in Chapter ' + (next.chapter || '?') + ' — keep playing the story.';
  } else {
    els.nextUp.innerHTML = 'Next up: <b>' + esc(next.name) + '</b> — ' + esc(next.description);
  }
  const checked = checklistCount(state, groups);
  const checkPct = checked.total === 0 ? 0 : Math.round((checked.done / checked.total) * 100);
  els.checkFill.style.width = checkPct + '%';
  els.checkSummary.innerHTML =
    '<b>' + checked.done + ' / ' + checked.total + '</b> checklist items done (' + checkPct + '%). ' +
    'Finish all 35 to unlock <b>A Long Road</b>.';
}
