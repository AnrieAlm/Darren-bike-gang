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
let pendingGiveCallback = null;

// NEW: Prompts the player to select an item from their inventory
export function promptGiveItem(characterName, onConfirm) {
    showDialog({
        text: `Select an item to give to ${characterName}.`,
        buttons: [{ 
            label: 'Cancel', 
            onClick: () => {
                hideDialog();
                cancelGiveItem();
            }
        }]
    });
    
    pendingGiveCallback = (item, slotEl) => {
        // Highlight the selected slot
        document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('glowing'));
        slotEl.classList.add('glowing');
        
        // Change notification to confirm
        showDialog({
            text: `Give ${item.label} to ${characterName}?`,
            buttons: [
                { label: 'Yes', onClick: () => {
                    hideDialog();
                    pendingGiveCallback = null;
                    inventoryBar.classList.remove('selectable');
                    document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('glowing'));
                    onConfirm(item);
                }},
                { label: 'No', onClick: () => {
                    hideDialog();
                    pendingGiveCallback = null;
                    inventoryBar.classList.remove('selectable');
                    document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('glowing'));
                }}
            ]
        });
    };
    
    inventoryBar.classList.add('selectable');
}

export function cancelGiveItem() {
    pendingGiveCallback = null;
    inventoryBar.classList.remove('selectable');
    document.querySelectorAll('.inventory-slot').forEach(s => s.classList.remove('glowing'));
}

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
            slot.title = item.label; 
            slot.textContent = ITEM_EMOJI[item.type] || '❔';
            
            // NEW: Handle item selection for giving
            slot.onclick = () => {
                if (pendingGiveCallback) {
                    pendingGiveCallback(item, slot);
                }
            };
        } else {
            slot.className = 'inventory-slot empty';
        }
        inventoryBar.appendChild(slot);
    }
}

const happinessContainer = document.getElementById('happiness-bars');
export function renderHappinessBars(entries) {
    if (!happinessContainer) return;
    happinessContainer.innerHTML = '';
    entries.forEach(({ id, name, done, total }) => {
        const pct = total ? Math.round((done / total) * 100) : 0;
        const row = document.createElement('div');
        row.className = 'happy-row';
        row.innerHTML = `<span class="happy-name">${name}</span> <div class="happy-bar-track"><div class="happy-bar-fill" style="width:${pct}%"></div></div>`;
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

export function showTimesUpScreen(names) {
    const text = names.length > 0
        ? `Time's up! Your gang: ${names.join(', ')}.`
        : `Time's up! You didn't recruit anyone this round — try again?`;
    document.getElementById('timesup-text').textContent = text;
    document.getElementById('timesup-screen').classList.remove('hidden');
}

const gameTimerEl = document.getElementById('game-timer');
export function setGameTimer(text, urgent = false) {
    if (!gameTimerEl) return;
    gameTimerEl.textContent = text;
    gameTimerEl.classList.toggle('urgent', urgent);
}

const recruitToastEl = document.getElementById('recruit-toast');
let recruitToastTimeout = null;
export function showRecruitToast(name) {
    if (!recruitToastEl) return;
    recruitToastEl.textContent = `🎉 ${name} is part of your gang!`;
    recruitToastEl.classList.add('show');
    clearTimeout(recruitToastTimeout);
    recruitToastTimeout = setTimeout(() => recruitToastEl.classList.remove('show'), 2400);
}

const contextMenuEl = document.getElementById('context-menu');
function closeContextMenuOnOutsideClick(e) {
    if (contextMenuEl && !contextMenuEl.contains(e.target)) {
        hideContextMenu();
    }
}

export function showContextMenu(x, y, options, title) {
    if (!contextMenuEl) return;
    contextMenuEl.innerHTML = '';
    if (title) {
        const heading = document.createElement('div');
        heading.className = 'context-menu-title';
        heading.textContent = title;
        contextMenuEl.appendChild(heading);
    }
    options.forEach(opt => {
        const btn = document.createElement('button');
        const labelEl = document.createElement('span');
        labelEl.className = 'context-menu-label';
        labelEl.textContent = opt.label;
        btn.appendChild(labelEl);
        if (opt.hint) {
            const hintEl = document.createElement('span');
            hintEl.className = 'context-menu-hint';
            hintEl.textContent = opt.hint;
            btn.appendChild(hintEl);
        }
        btn.onclick = () => { opt.onClick(); };
        contextMenuEl.appendChild(btn);
    });
    
    const menuWidth = 230;
    const menuHeight = options.length * 46 + (title ? 30 : 0) + 12;
    const left = Math.min(x, window.innerWidth - menuWidth - 10);
    const top = Math.min(y, window.innerHeight - menuHeight - 10);
    contextMenuEl.style.left = `${Math.max(10, left)}px`;
    contextMenuEl.style.top = `${Math.max(10, top)}px`;
    contextMenuEl.classList.remove('hidden');
    
    setTimeout(() => document.addEventListener('click', closeContextMenuOnOutsideClick), 0);
}

export function hideContextMenu() {
    if (!contextMenuEl) return;
    contextMenuEl.classList.add('hidden');
    document.removeEventListener('click', closeContextMenuOnOutsideClick);
}