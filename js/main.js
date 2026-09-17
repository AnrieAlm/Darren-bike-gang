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
  hiddenItems, windowItem, getItemAtSpot, peekItemAtSpot, ITEM_EMOJI, MAX_INVENTORY,
  setWindowOpened, windowOpened, completeChore
} from './room.js';
import {
  showDialog, hideDialog, setSecurityMeter,
  setRecruitedCount, renderInventory, showWinScreen, showLoseScreen,
  renderHappinessBars, showTimesUpScreen, setGameTimer, showRecruitToast
} from './ui.js';

// All playable characters. Add/remove ids here to change who's required.
const ALL_CHARACTERS = [esgi, sharad, grace, boris, maya, mimi];

// Characters that must be recruited to win.
const requiredCharacters = ['esgi', 'sharad', 'grace', 'boris', 'maya', 'mimi'];

// ---------------- Game state ----------------
let inventory = [];           // array of { owner, type, label }
let recruited = new Set();    // set of character ids
let security = 0;             // 0-100
let over = false;

// Darren — the player's avatar. Double-click/double-tap anywhere on
// the floor to walk him there; he has to be standing near a character
// before you can talk to (or give things to) them.
let darrenPos = { top: 80, left: 50 }; // % of #characters-layer, starting spot
const DARREN_PROXIMITY_PX = 150; // how close counts as "near", in screen pixels

// Overall game timer — when it runs out, the game ends and shows
// whoever's been recruited so far as the final gang (win or not).
// Change TIME_LIMIT_SECONDS to whatever length feels right.
const TIME_LIMIT_SECONDS = 300; // 5 minutes
let timeRemaining = TIME_LIMIT_SECONDS;
let gameTimerId = null;

const game = {
  getInventoryCount(owner, type) {
    return inventory.filter(i => i.owner === owner && i.type === type).length;
  },
  isInventoryFull() { return inventory.length >= MAX_INVENTORY; },
  addInventory(item) {
    if (inventory.length >= MAX_INVENTORY) return false; // backpack full — caller should check isInventoryFull() first
    inventory.push(item);
    renderInventory(inventory);
    refreshHappiness();
    return true;
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
    renderInventory(inventory);
    refreshHappiness();
  },

  isRecruited(id) { return recruited.has(id); },
  recruit(id) {
    recruited.add(id);
    setRecruitedCount(recruited.size, requiredCharacters.length);
    updateSpriteState(id);
    refreshHappiness();
    const character = ALL_CHARACTERS.find(c => c.id === id);
    if (character) showRecruitToast(character.name);
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
  },
  // Fired when the overall game timer hits zero — not a win or a loss,
  // just "here's how far you got."
  timeUp() {
    if (over) return;
    over = true;
    stopAllTimers();
    const names = ALL_CHARACTERS.filter(c => recruited.has(c.id)).map(c => c.name);
    showTimesUpScreen(names);
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
  if (gameTimerId) {
    clearInterval(gameTimerId);
    gameTimerId = null;
  }
}

// ---------------- Overall game timer ----------------
function startGameTimer() {
  timeRemaining = TIME_LIMIT_SECONDS;
  updateTimerDisplay();
  gameTimerId = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(gameTimerId);
      gameTimerId = null;
      game.timeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  const urgent = timeRemaining <= 30; // pulses red once 30s are left
  setGameTimer(`${m}:${s.toString().padStart(2, '0')}`, urgent);
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

    el.addEventListener('click', () => {
      if (!isDarrenNear(character)) {
        showDialog({
          text: `Get Darren closer to ${character.name} first! (double-click/double-tap the floor to move him)`,
          buttons: [{ label: 'Okay', onClick: hideDialog }],
          autoHideMs: 1800
        });
        return;
      }
      character.onInteract(game);
    });
    el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!isDarrenNear(character)) {
        showDialog({
          text: `Get Darren closer to ${character.name} first!`,
          buttons: [{ label: 'Okay', onClick: hideDialog }],
          autoHideMs: 1800
        });
        return;
      }
      if (typeof character.onRightClick === 'function') {
        character.onRightClick(game, e.clientX, e.clientY);
      }
    });
    layer.appendChild(el);
  });

  renderDarrenSprite();
  updateProximity();
}

function updateSpriteState(id) {
  const el = document.getElementById(`sprite-${id}`);
  if (el) el.classList.add('recruited');
}

// ---------------- Darren (the player's avatar) ----------------
function renderDarrenSprite() {
  const layer = document.getElementById('characters-layer');
  const el = document.createElement('div');
  el.className = 'character-sprite darren-sprite';
  el.id = 'darren-sprite';
  el.style.top = `${darrenPos.top}%`;
  el.style.left = `${darrenPos.left}%`;
  el.textContent = '🧑';
  el.title = 'Darren (you)';

  const nameTag = document.createElement('div');
  nameTag.className = 'sprite-name';
  nameTag.textContent = 'Darren';
  el.appendChild(nameTag);

  layer.appendChild(el);
}

// Whether Darren is currently standing close enough to a character to
// interact with them — compared in real screen pixels (via the shared
// #characters-layer box) so it stays accurate whether zoomed in or not.
function isDarrenNear(character) {
  const layer = document.getElementById('characters-layer');
  if (!layer) return false;
  const rect = layer.getBoundingClientRect();
  const dx = (darrenPos.left - parseFloat(character.position.left)) / 100 * rect.width;
  const dy = (darrenPos.top - parseFloat(character.position.top)) / 100 * rect.height;
  return Math.hypot(dx, dy) <= DARREN_PROXIMITY_PX;
}

// Refreshes the glowing "in range" ring on every character sprite —
// call this after Darren moves, and once on game start.
function updateProximity() {
  ALL_CHARACTERS.forEach(character => {
    const el = document.getElementById(`sprite-${character.id}`);
    if (el) el.classList.toggle('in-range', isDarrenNear(character));
  });
}

// Double-click (desktop) / double-tap (touch, via the same dblclick
// event — touch-action: manipulation in style.css makes browsers fire
// it reliably for two quick taps) anywhere on the floor moves Darren
// there. Position is computed as a % of #characters-layer, matching
// exactly how every character's own position is defined.
// Moves Darren to an absolute position (% of #characters-layer) and
// refreshes who he's now close enough to interact with. Shared by
// double-click-to-walk and the joystick's step-by-step arrows.
function setDarrenPosition(leftPct, topPct) {
  darrenPos = {
    left: Math.max(2, Math.min(98, leftPct)),
    top: Math.max(2, Math.min(98, topPct))
  };
  const el = document.getElementById('darren-sprite');
  if (el) {
    el.style.left = `${darrenPos.left}%`;
    el.style.top = `${darrenPos.top}%`;
  }
  updateProximity();
}

function wireDarrenMovement() {
  const svg = document.getElementById('kitchen-svg');
  const layer = document.getElementById('characters-layer');
  if (!svg || !layer) return;

  svg.addEventListener('dblclick', (e) => {
    if (svg.classList.contains('broom-mode')) return; // don't fight with sweeping
    // Only "walk here" on genuinely empty floor/wall — if this landed
    // on a door/mess-spot/plate/broom/zoom-zone, that element's own
    // click handling is clearly what the player meant, not movement.
    if (e.target.closest('.hotspot, .mess-spot, .dirty-plate, .broom-pickup, .zoom-zone')) return;

    const rect = layer.getBoundingClientRect();
    const leftPct = ((e.clientX - rect.left) / rect.width) * 100;
    const topPct = ((e.clientY - rect.top) / rect.height) * 100;
    setDarrenPosition(leftPct, topPct);
  });
}

// ---------------- Joystick ----------------
const JOY_STEP = 6; // % of the room per arrow press

// Roughly where each hotspot sits, as a % of #characters-layer — used
// only to tell whether Darren is "at" that hotspot for the joystick's
// center button. Doesn't need to be pixel-perfect, just close enough
// to line up with DARREN_PROXIMITY_PX.
const HOTSPOT_POSITIONS = {
  fridge:  { left: 74, top: 50 },
  cabinet: { left: 62, top: 50 },
  oven:    { left: 52, top: 47 },
  table:   { left: 21, top: 65 },
};

function isDarrenNearPoint(point) {
  const layer = document.getElementById('characters-layer');
  if (!layer) return false;
  const rect = layer.getBoundingClientRect();
  const dx = (darrenPos.left - point.left) / 100 * rect.width;
  const dy = (darrenPos.top - point.top) / 100 * rect.height;
  return Math.hypot(dx, dy) <= DARREN_PROXIMITY_PX;
}

// The center button does whichever of these applies, in order:
//  1. Standing next to Sharad (not yet recruited) -> say "yo bro"
//  2. Standing next to any other character -> talk to them (opens
//     their normal dialogue, which offers a give button if you're
//     carrying enough of what they need — same as clicking them)
//  3. Standing at a hotspot with a revealed, not-yet-collected item
//     -> pick it up
//  4. Otherwise -> a small "nothing here" nudge
function pressCenterButton() {
  if (isDarrenNear(sharad) && !game.isRecruited('sharad') && typeof sharad.sayYoBro === 'function') {
    sharad.sayYoBro(game);
    return;
  }

  const nearCharacter = ALL_CHARACTERS.find(c => isDarrenNear(c));
  if (nearCharacter) {
    nearCharacter.onInteract(game);
    return;
  }

  for (const spotId of Object.keys(HOTSPOT_POSITIONS)) {
    if (!isDarrenNearPoint(HOTSPOT_POSITIONS[spotId])) continue;
    const el = document.querySelector(`.found-item-emoji[data-spot="${spotId}"]`);
    if (el && el.textContent && !el.classList.contains('collected')) {
      el.dispatchEvent(new Event('click', { bubbles: true })); // reuse the exact same pickup logic as tapping it directly
      return;
    }
  }

  showDialog({ text: `Nothing to do here.`, buttons: [{ label: 'Okay', onClick: hideDialog }], autoHideMs: 900 });
}

function wireJoystick() {
  const up = document.getElementById('joy-up');
  const down = document.getElementById('joy-down');
  const left = document.getElementById('joy-left');
  const right = document.getElementById('joy-right');
  const center = document.getElementById('joy-center');
  if (!up || !down || !left || !right || !center) return;

  up.addEventListener('click', () => setDarrenPosition(darrenPos.left, darrenPos.top - JOY_STEP));
  down.addEventListener('click', () => setDarrenPosition(darrenPos.left, darrenPos.top + JOY_STEP));
  left.addEventListener('click', () => setDarrenPosition(darrenPos.left - JOY_STEP, darrenPos.top));
  right.addEventListener('click', () => setDarrenPosition(darrenPos.left + JOY_STEP, darrenPos.top));
  center.addEventListener('click', pressCenterButton);
}

// ---------------- Room hotspot clicks (fridge/cabinet/table/oven/window) ----------------
// Opening a door/sash just reveals whatever's there (shown as an emoji
// sitting in the interior — see showFoundItem()); it does NOT collect
// it automatically. The player then taps that item specifically to
// actually pick it up, which is what removes it from the spot and
// adds it to the backpack. This mirrors how esgi's window already
// worked (open window -> see the cat -> tap "bring the cat in").
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

      const next = peekItemAtSpot(spotId);
      showFoundItem(spotId, next);
      if (!next) {
        showDialog({
          text: `Nothing else here.`,
          buttons: [{ label: 'Close', onClick: hideDialog }],
          autoHideMs: 1200
        });
      }
    });
  });

  // The item sitting in an opened spot is its own click target —
  // tapping it is the actual "pick it up" action.
  document.querySelectorAll('.found-item-emoji').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!el.textContent) return; // nothing currently shown here

      // Check capacity BEFORE claiming the item — otherwise a full
      // backpack would consume it from the world with nowhere to put
      // it, and it'd just vanish. Leave it sitting there instead.
      if (game.isInventoryFull()) {
        showDialog({
          text: `Backpack full (${MAX_INVENTORY}/${MAX_INVENTORY})! Give something to a friend before picking up more.`,
          buttons: [{ label: 'Okay', onClick: hideDialog }],
          autoHideMs: 1800
        });
        return;
      }

      const spotId = el.dataset.spot;
      const item = getItemAtSpot(spotId); // actually claims it this time
      if (!item) return;

      el.classList.add('collected'); // pop/fade out of the spot
      game.addInventory(item);
      showDialog({
        text: `You found: ${item.label}! It went in your backpack.`,
        buttons: [{ label: 'Nice', onClick: hideDialog }],
        autoHideMs: 1500
      });
      // A moment later, reveal whatever's next at that spot (if anything).
      setTimeout(() => showFoundItem(spotId, peekItemAtSpot(spotId)), 400);
    });
  });
}

// Shows (or clears) the emoji for whatever's currently sitting at a
// spot's interior. item = the object from room.js, or null/undefined.
function showFoundItem(spotId, item) {
  const el = document.querySelector(`.found-item-emoji[data-spot="${spotId}"]`);
  if (!el) return;
  el.classList.remove('collected');
  el.textContent = item ? (ITEM_EMOJI[item.type] || '❔') : '';
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

// ---------------- Broom: pick it up, drag it across the mess ----------------
// Clicking the broom prop equips/unequips it. While equipped, the CSS
// in style.css disables clicks on doors/plates/mess-spots so a drag
// across the counter doesn't accidentally open the fridge — sweeping
// itself is done purely by distance from the pointer to each
// not-yet-done mess-spot's own translate(x,y), recomputed on every
// pointermove. This works correctly even while zoomed in, because
// getScreenCTM() reflects whatever CSS transform (including the zoom
// scale) is currently applied.
function wireBroom() {
  const svg = document.getElementById('kitchen-svg');
  const pickup = document.getElementById('broom-pickup');
  const cursor = document.getElementById('broom-cursor');
  if (!svg || !pickup || !cursor) return;

  const SWEEP_RADIUS = 55; // SVG units — how close the broom head needs to get
  let equipped = false;
  let dragging = false;

  function setEquipped(next) {
    equipped = next;
    pickup.classList.toggle('equipped', equipped);
    svg.classList.toggle('broom-mode', equipped);
    if (equipped) {
      showDialog({
        text: `Picked up the broom. Drag it across the floor mess to sweep!`,
        buttons: [{ label: 'Got it', onClick: hideDialog }],
        autoHideMs: 1800
      });
    }
  }

  pickup.addEventListener('click', (e) => {
    e.stopPropagation();
    setEquipped(!equipped);
  });

  function toSvgPoint(evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function sweepNear(pt) {
    document.querySelectorAll('.mess-spot:not(.done)').forEach(spot => {
      const m = (spot.getAttribute('transform') || '').match(/translate\(([-\d.]+)[,\s]+([-\d.]+)\)/);
      if (!m) return;
      const dx = pt.x - parseFloat(m[1]);
      const dy = pt.y - parseFloat(m[2]);
      if (Math.hypot(dx, dy) > SWEEP_RADIUS) return;

      const taskId = spot.dataset.chore;
      const chore = game.completeChore(taskId);
      if (!chore) return;
      spot.classList.add('done');
      setTimeout(() => spot.classList.add('faded'), 700);
    });

    // All done? Auto-drop the broom and let the player know.
    if (![...document.querySelectorAll('.mess-spot')].some(s => !s.classList.contains('done'))) {
      if (equipped) {
        setEquipped(false);
        showDialog({ text: `Floor's spotless! 🧹✨`, buttons: [{ label: 'Nice', onClick: hideDialog }], autoHideMs: 1500 });
      }
    }
  }

  svg.addEventListener('pointerdown', (e) => {
    if (!equipped) return;
    dragging = true;
    const pt = toSvgPoint(e);
    cursor.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    sweepNear(pt);
  });
  svg.addEventListener('pointermove', (e) => {
    if (!equipped) return;
    const pt = toSvgPoint(e);
    cursor.setAttribute('transform', `translate(${pt.x},${pt.y})`);
    if (dragging) sweepNear(pt);
  });
  window.addEventListener('pointerup', () => { dragging = false; });
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
  document.getElementById('timesup-screen').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('happiness-bars').classList.remove('hidden');
  document.getElementById('game-timer').classList.remove('hidden');
  document.getElementById('joystick').classList.remove('hidden');
  document.getElementById('room').classList.remove('hidden');

  renderCharacterSprites();
  refreshHappiness();
  sharad.start(game);
  startGameTimer();
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn-win').addEventListener('click', () => location.reload());
document.getElementById('restart-btn-lose').addEventListener('click', () => location.reload());
document.getElementById('restart-btn-timesup').addEventListener('click', () => location.reload());

wireHotspots();
wireChoreSpots();
wireZoom();
wireBroom();
wireDarrenMovement();
wireJoystick();
