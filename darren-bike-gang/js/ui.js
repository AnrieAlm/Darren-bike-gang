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

// Renders the full inventory list (array of item label strings).
export function renderInventory(items) {
  inventoryBar.innerHTML = '';
  items.forEach(label => {
    const el = document.createElement('div');
    el.className = 'inventory-item';
    el.textContent = label;
    inventoryBar.appendChild(el);
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
