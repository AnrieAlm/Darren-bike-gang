// ========================================================
// ui.js — everything that draws to the screen but isn't game logic.
// ========================================================

const dialogBox = document.getElementById('dialog-box');
const dialogPortrait = document.getElementById('dialog-portrait');
const dialogText = document.getElementById('dialog-text');
const dialogActions = document.getElementById('dialog-actions');
const securityFill = document.getElementById('security-fill');
const recruitedCount = document.getElementById('recruited-count');
const inventoryBar = document.getElementById('inventory-bar');

let dialogTimeout = null;

// Shows the dialog box with optional portrait image, text, and buttons.
// buttons = [{ label: 'Give Cat', onClick: () => {...} }, ...]
export function showDialog({ portraitUrl, text, buttons = [], autoHideMs = null }) {
  dialogPortrait.style.backgroundImage = portraitUrl ? `url('${portraitUrl}')` : 'none';
  dialogText.textContent = text;
  dialogActions.innerHTML = '';

  buttons.forEach(btn => {
    const el = document.createElement('button');
    el.textContent = btn.label;
    el.onclick = () => { btn.onClick(); };
    dialogActions.appendChild(el);
  });

  dialogBox.classList.remove('hidden');

  if (dialogTimeout) clearTimeout(dialogTimeout);
  if (autoHideMs) {
    dialogTimeout = setTimeout(hideDialog, autoHideMs);
  }
}

export function hideDialog() {
  dialogBox.classList.add('hidden');
  if (dialogTimeout) clearTimeout(dialogTimeout);
}

export function setSecurityMeter(percent) {
  securityFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

export function setRecruitedCount(current, total) {
  recruitedCount.textContent = `Recruited: ${current} / ${total}`;
}

// Renders the backpack: instead of one tag per item (which gets long
// fast once you're carrying 5 waffles), groups by label and shows a
// count, e.g. "🧇 Waffle x3". Pass the full inventory array (objects
// with a .label, same as what game.addInventory stores).
export function renderInventory(items) {
  inventoryBar.innerHTML = '';
  const counts = new Map();
  items.forEach(label => counts.set(label, (counts.get(label) || 0) + 1));

  if (counts.size === 0) {
    const empty = document.createElement('div');
    empty.className = 'inventory-empty';
    empty.textContent = 'Backpack empty';
    inventoryBar.appendChild(empty);
    return;
  }

  counts.forEach((count, label) => {
    const el = document.createElement('div');
    el.className = 'inventory-item';
    el.textContent = count > 1 ? `${label} x${count}` : label;
    inventoryBar.appendChild(el);
  });
}

// Renders one small happiness bar per character underneath the main
// HUD row. entries = [{ id, name, done, total }, ...] — see
// refreshHappiness() in main.js, which calls this after anything
// that could move the needle (items found, chores done, recruits).
const happinessContainer = document.getElementById('happiness-bars');
export function renderHappinessBars(entries) {
  if (!happinessContainer) return;
  happinessContainer.innerHTML = '';
  entries.forEach(({ id, name, done, total }) => {
    const pct = total ? Math.round((done / total) * 100) : 0;
    const row = document.createElement('div');
    row.className = 'happy-row';
    row.innerHTML = `
      <span class="happy-name">${name}</span>
      <div class="happy-bar-track"><div class="happy-bar-fill" style="width:${pct}%"></div></div>
    `;
    happinessContainer.appendChild(row);
  });
}

export function showWinScreen(text) {
  document.getElementById('win-text').textContent = text;
  document.getElementById('win-screen').classList.remove('hidden');
}

export function showLoseScreen(text) {
  document.getElementById('lose-text').textContent = text;
  document.getElementById('lose-screen').classList.remove('hidden');
}
