// ========================================================
// main.js — the game controller. Wires together room.js, ui.js,
// and every character file. Character-specific rules live in
// their own files under js/characters/ — this file just manages
// shared state (inventory, recruits, security) and hands control
// to each character's onInteract() when clicked.
// ========================================================

import esgi from './characters/esgi.js';
import sharad from './characters/sharad.js';
import grace from './characters/grace.js';
import boris from './characters/boris.js';
import maya from './characters/maya.js';
import mimi from './characters/mimi.js';
import {
  hiddenItems, windowItem, getItemAtSpot, setWindowOpened, windowOpened,
  completeChore
} from './room.js';
import {
  showDialog, hideDialog, setSecurityMeter,
  setRecruitedCount, renderInventory, showWinScreen, showLoseScreen,
  renderHappinessBars
} from './ui.js';

// All playable characters. Add/remove ids here to change who's required.
const ALL_CHARACTERS = [esgi, sharad, grace, boris, maya, mimi];

// Characters that must be recruited to win. Mimi is left out until her
// mechanic is built — add 'mimi' here once js/characters/mimi.js is ready.
const requiredCharacters = ['esgi', 'sharad', 'grace', 'boris', 'maya'];

// ---------------- Game state ----------------
let inventory = [];           // array of { owner, type, label }
let recruited = new Set();    // set of character ids
let security = 0;             // 0-100
let over = false;

const game = {
  getInventoryCount(owner, type) {
    return inventory.filter(i => i.owner === owner && i.type === type).length;
  },
  addInventory(item) {
    inventory.push(item);
    renderInventory(inventory.map(i => i.label));
    refreshHappiness();
  },
  removeInventory(owner, type, count) {
    let removed = 0;
    inventory = inventory.filter(i => {
      if (removed < count && i.owner === owner && i.type === type) {
        removed++;
        return false;
      }
      return true;
    });
    renderInventory(inventory.map(i => i.label));
    refreshHappiness();
  },

  isRecruited(id) { return recruited.has(id); },
  recruit(id) {
    recruited.add(id);
    setRecruitedCount(recruited.size, requiredCharacters.length);
    updateSpriteState(id);
    refreshHappiness();
    checkWinCondition();
  },
  // Chore tasks (sweeping, dishes) — no inventory involved, just marks
  // the task done and refreshes whichever character owns it.
  completeChore(taskId) {
    const chore = completeChore(taskId);
    if (chore) refreshHappiness();
    return chore;
  },
  increaseSecurity(amount) {
    security = Math.min(100, security + amount);
    setSecurityMeter(security);
    if (security >= 100) {
      game.endGame('lose', 'Security got too suspicious. Game over.');
    }
  },
  isGameOver() { return over; },
  endGame(result, message) {
    if (over) return;
    over = true;
    stopAllTimers();
    if (result === 'win') {
      showWinScreen(message);
    } else {
      showLoseScreen(message);
    }
  }
};

// ---------------- Happiness bars ----------------
// Every character exposes an optional getProgress(game) -> {done, total}.
// Called after anything that could change a character's progress
// (inventory changes, recruiting, chores). Characters without
// getProgress (nothing decided yet, e.g. Mimi) are just skipped.
function refreshHappiness() {
  const entries = ALL_CHARACTERS
    .filter(c => typeof c.getProgress === 'function')
    .map(c => ({ id: c.id, name: c.name, ...c.getProgress(game) }));
  renderHappinessBars(entries);
}

function checkWinCondition() {
  const allIn = requiredCharacters.every(id => recruited.has(id));
  if (allIn) {
    startHeistSequence();
  }
}

// A short beat before the win screen — customize this however you like
// (e.g. swap in a bike animation, extra dialog, etc.)
function startHeistSequence() {
  showDialog({
    text: `The whole gang is assembled. Time to steal every bike in Dublin... 🚲🚲🚲`,
    buttons: [{
      label: 'GO!',
      onClick: () => {
        hideDialog();
        game.endGame('win', 'Darren and the gang stole every bike in Dublin. Darren is now a millionaire. 💰');
      }
    }]
  });
}

function stopAllTimers() {
  sharad.stop();
}

// ---------------- Rendering character sprites ----------------
function renderCharacterSprites() {
  const layer = document.getElementById('characters-layer');
  layer.innerHTML = '';
  ALL_CHARACTERS.forEach(character => {
    const el = document.createElement('div');
    el.className = 'character-sprite';
    el.id = `sprite-${character.id}`;
    el.style.top = character.position.top;
    el.style.left = character.position.left;
    el.textContent = character.emojiFallback || '🙂';
    el.title = character.name;

    const nameTag = document.createElement('div');
    nameTag.className = 'sprite-name';
    nameTag.textContent = character.name;
    el.appendChild(nameTag);

    el.addEventListener('click', () => character.onInteract(game));
    layer.appendChild(el);
  });
}

function updateSpriteState(id) {
  const el = document.getElementById(`sprite-${id}`);
  if (el) el.classList.add('recruited');
}

// ---------------- Room hotspot clicks (fridge/cabinet/table/oven/window) ----------------
// These are the "container" spots that open/close (door swings, sash
// slides) and may hold a hidden item. The CSS in style.css does the
// animation purely off the .open class — this just toggles it.
function wireHotspots() {
  document.querySelectorAll('.hotspot[data-spot]').forEach(spotEl => {
    spotEl.addEventListener('click', () => {
      const spotId = spotEl.dataset.spot;
      spotEl.classList.add('open'); // visual: door swings/sash slides open

      if (spotId === 'window') {
        if (!windowOpened) {
          setWindowOpened();
          esgi.onWindowOpened(game);
        } else {
          showDialog({ text: 'Nothing else out there right now.', buttons: [{ label: 'Close', onClick: hideDialog }] });
        }
        return;
      }

      const item = getItemAtSpot(spotId);
      if (item) {
        game.addInventory(item);
        showDialog({
          text: `You found: ${item.label}! It went in your backpack.`,
          buttons: [{ label: 'Nice', onClick: hideDialog }],
          autoHideMs: 1500
        });
      } else {
        showDialog({
          text: `Nothing else here.`,
          buttons: [{ label: 'Close', onClick: hideDialog }],
          autoHideMs: 1200
        });
      }
    });
  });
}

// ---------------- Chore hotspots (sweep the floor / wash a plate) ----------------
// Simple one-shot spots: click once, it's done, nothing to carry.
// Add more by adding entries to choreTasks in room.js and a matching
// [data-chore="taskId"] element in index.html.
function wireChoreSpots() {
  document.querySelectorAll('[data-chore]').forEach(el => {
    el.addEventListener('click', () => {
      const taskId = el.dataset.chore;
      const chore = game.completeChore(taskId);
      if (!chore) return; // already done, or unknown id
      el.classList.add('done'); // visual: mess fades / plate gets wiped
      setTimeout(() => el.classList.add('faded'), 700); // broom/soap icon fades a beat later
      showDialog({
        text: `${chore.label} — done! 🧹`,
        buttons: [{ label: 'Nice', onClick: hideDialog }],
        autoHideMs: 1200
      });
    });
  });
}

// ---------------- Zoom: tap a zone to get closer for fiddly hotspots ----------------
// Wrap the fiddly cluster of hotspots (e.g. the counter run) in
// <div class="zoom-zone" data-zoom-target="counter"> in index.html.
// Tapping it scales #room-zoom in, centered on that zone; the back
// button (#zoom-back) resets it. Add more zones the same way.
function wireZoom() {
  const zoomLayer = document.getElementById('room-zoom');
  const backBtn = document.getElementById('zoom-back');
  if (!zoomLayer) return;

  document.querySelectorAll('.zoom-zone').forEach(zone => {
    zone.addEventListener('click', (e) => {
      // Only zoom if not already zoomed (a second tap inside the zone
      // should just hit whatever hotspot is under it, not re-zoom).
      if (zoomLayer.classList.contains('zoomed')) return;
      // Center on the ZONE's own midpoint (fixed per zone via data
      // attributes), not the tap point — a wide zone like the counter
      // run would otherwise have its far edge pushed off-screen
      // depending on where inside it the player happened to tap.
      const originX = zone.dataset.originX || '50%';
      const originY = zone.dataset.originY || '50%';
      zoomLayer.style.transformOrigin = `${originX} ${originY}`;
      zoomLayer.classList.add('zoomed');
      backBtn?.classList.remove('hidden');
    });
  });

  backBtn?.addEventListener('click', () => {
    zoomLayer.classList.remove('zoomed');
    backBtn.classList.add('hidden');
  });
}

// ---------------- Start / restart ----------------
function startGame() {
  // Reset state
  inventory = [];
  recruited = new Set();
  security = 0;
  over = false;
  setSecurityMeter(0);
  setRecruitedCount(0, requiredCharacters.length);
  renderInventory([]);

  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('win-screen').classList.add('hidden');
  document.getElementById('lose-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('happiness-bars').classList.remove('hidden');
  document.getElementById('room').classList.remove('hidden');

  renderCharacterSprites();
  refreshHappiness();
  sharad.start(game);
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn-win').addEventListener('click', () => location.reload());
document.getElementById('restart-btn-lose').addEventListener('click', () => location.reload());

wireHotspots();
wireChoreSpots();
wireZoom();
