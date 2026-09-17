// ========================================================
// ui.js — everything that draws to the screen but isn't game logic.
// ========================================================
import { ITEM_EMOJI, MAX_INVENTORY } from './room.js';

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

// Renders the backpack as a fixed grid of MAX_INVENTORY slots — one
// per actual item being carried, in the order picked up, plus empty
// (dashed) slots for whatever room is left. This is what makes the
// "only 5 items fit" cap visible: the player can see exactly how full
// they are and how much space picking something up would use.
// Pass the full inventory array (objects with .type and .label, same
// shape game.addInventory stores).
export function renderInventory(items) {
  inventoryBar.innerHTML = '';

  const capacity = document.createElement('div');
  capacity.className = 'inventory-capacity';
  capacity.textContent = `${items.length}/${MAX_INVENTORY}`;
  inventoryBar.appendChild(capacity);

  for (let i = 0; i < MAX_INVENTORY; i++) {
    const item = items[i];
    const slot = document.createElement('div');

    if (item) {
      slot.className = 'inventory-slot filled';
      slot.title = item.label; // hover tooltip with the full name
      slot.textContent = ITEM_EMOJI[item.type] || '❔';
    } else {
      slot.className = 'inventory-slot empty';
    }

    inventoryBar.appendChild(slot);
  }
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
