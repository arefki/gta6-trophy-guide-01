// Boot for the Leonida trophy guide. Loads the three data files, renders the
// trophy browser and the 100% checklist, and wires the toolbar: search,
// grade and kind filters, the spoiler switch, and progress export/import.
// The app fetches only its own files, never the network.

import { loadState, saveState, exportProgress, importProgress, resetProgress } from './store.js';
import { blankFilters, applyFilters } from './filters.js';
import { renderTrophies, wireEarnedCheckboxes, renderChecklist, wireChecklistBoxes, refreshProgress } from './render.js';

const DATA = {
  trophies: 'data/trophies.json',
  sources: 'data/sources.json',
  checklist: 'data/checklist.json',
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Could not load ' + path);
  return response.json();
}

function $(id) {
  return document.getElementById(id);
}

function setPressed(button, pressed) {
  button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
}

async function boot() {
  const [trophyDoc, sourceDoc, checklistDoc] = await Promise.all([
    loadJson(DATA.trophies),
    loadJson(DATA.sources),
    loadJson(DATA.checklist),
  ]);
  const trophies = trophyDoc.trophies;
  const sources = sourceDoc.sources;
  const groups = checklistDoc.groups;

  const state = loadState();
  const filters = blankFilters();

  const els = {
    fill: $('progress-fill'),
    label: $('progress-label'),
    meta: $('progress-meta'),
    nextUp: $('nextup'),
    checkFill: $('check-fill'),
    checkSummary: $('check-summary'),
  };
  const grid = $('trophy-grid');
  const count = $('result-count');
  const checkWrap = $('checklist-groups');

  function rerender() {
    const visible = applyFilters(trophies, filters, state);
    renderTrophies(grid, visible, state, sources);
    wireEarnedCheckboxes(grid, state, rerender);
    count.innerHTML = '<b>' + visible.length + '</b> of ' + trophies.length + ' trophies';
    renderChecklist(checkWrap, groups, state);
    wireChecklistBoxes(checkWrap, state, rerender);
    refreshProgress(state, trophies, groups, els);
  }

  // Search: filters by name, description, guide text, kind or grade.
  $('search-input').addEventListener('input', (event) => {
    filters.query = event.target.value;
    rerender();
  });

  // Single-choice chips: grade, kind and hidden/visible.
  document.querySelectorAll('[data-filter-group]').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.getAttribute('data-filter-group');
      const value = button.getAttribute('data-filter-value');
      filters[group] = value;
      document.querySelectorAll('[data-filter-group="' + group + '"]').forEach((other) => {
        setPressed(other, other === button);
      });
      rerender();
    });
  });

  // On/off toggles: missable only, unconfirmed only, unearned only, spoilers.
  const toggleMap = [
    ['toggle-missable', 'onlyMissable'],
    ['toggle-unconfirmed', 'onlyUnconfirmed'],
    ['toggle-unearned', 'onlyUnearned'],
  ];
  for (const [id, key] of toggleMap) {
    const button = $(id);
    button.addEventListener('click', () => {
      filters[key] = !filters[key];
      setPressed(button, filters[key]);
      rerender();
    });
  }

  const spoilerButton = $('toggle-spoilers');
  function paintSpoilerButton() {
    setPressed(spoilerButton, state.spoilersHidden);
    spoilerButton.textContent = state.spoilersHidden ? 'Spoilers hidden' : 'Spoilers shown';
  }
  spoilerButton.addEventListener('click', () => {
    state.spoilersHidden = !state.spoilersHidden;
    saveState(state);
    paintSpoilerButton();
    rerender();
  });

  // Progress tools: export to a file, import from a file, reset everything.
  $('export-btn').addEventListener('click', () => exportProgress(state));
  $('import-btn').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const report = importProgress(state, await file.text());
      alert('Imported ' + report.trophies + ' earned trophies and ' + report.items + ' checklist items.');
    } catch (err) {
      alert('That file could not be imported. It must be a progress file exported from this guide.');
    }
    event.target.value = '';
    rerender();
  });
  $('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies and checklist ticks?')) {
      resetProgress(state);
      rerender();
    }
  });

  paintSpoilerButton();
  rerender();
}

boot().catch((err) => {
  const grid = $('trophy-grid');
  if (grid) {
    grid.innerHTML =
      '<div class="empty-state"><p><b>The guide could not load its trophy data.</b></p>' +
      '<p>Open it from a static file server (for example <code>python3 -m http.server</code> in the app folder) rather than straight from disk.</p></div>';
  }
});
