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
import { hiddenItems, windowItem, getItemAtSpot, setWindowOpened, windowOpened } from './room.js';
import {
  showDialog, hideDialog, setSecurityMeter,
  setRecruitedCount, renderInventory, showWinScreen, showLoseScreen
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
  },
  isRecruited(id) { return recruited.has(id); },
  recruit(id) {
    recruited.add(id);
    setRecruitedCount(recruited.size, requiredCharacters.length);
    updateSpriteState(id);
    checkWinCondition();
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
function wireHotspots() {
  document.querySelectorAll('.hotspot').forEach(spotEl => {
    spotEl.addEventListener('click', () => {
      const spotId = spotEl.dataset.spot;

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
          text: `You found: ${item.label}!`,
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
  document.getElementById('room').classList.remove('hidden');

  renderCharacterSprites();
  sharad.start(game);
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn-win').addEventListener('click', () => location.reload());
document.getElementById('restart-btn-lose').addEventListener('click', () => location.reload());

wireHotspots();
