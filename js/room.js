// ========================================================
// room.js — defines what's hidden where in the flat.
// Edit this file to move items around without touching game logic.
// ========================================================

// Each hidden item belongs to a character (by id, matching the
// character file's `id` field) and a "type" label just for flavour text.
// spotId must match a .hotspot element's data-spot in index.html.

export const hiddenItems = [
  // Grace's grape juice cartons — spread across 4 spots
  { spotId: 'fridge',  owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'cabinet', owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'table',   owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'oven',    owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },

  // Mimi's movie ticket (needs 1) — second thing you find in the
  // cabinet, ahead of the other items queued there so it doesn't take forever.
  { spotId: 'cabinet', owner: 'mimi', type: 'ticket', label: 'Movie Ticket' },

  // Maya's waffles (needs 5) — hers specifically, not shared with Boris.
  { spotId: 'fridge',  owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'cabinet', owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'table',   owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'oven',    owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'fridge',  owner: 'maya', type: 'waffle', label: 'Waffle' },

  // Boris's lollipops (needs 5) — his own item, separate from Maya's
  // waffles, so there's no mix-up about which is meant for whom.
  { spotId: 'cabinet', owner: 'boris', type: 'lollipop', label: 'Lollipop' },
  { spotId: 'table',   owner: 'boris', type: 'lollipop', label: 'Lollipop' },
  { spotId: 'oven',    owner: 'boris', type: 'lollipop', label: 'Lollipop' },
  { spotId: 'fridge',  owner: 'boris', type: 'lollipop', label: 'Lollipop' },
  { spotId: 'cabinet', owner: 'boris', type: 'lollipop', label: 'Lollipop' },
];

// Esgi's item isn't hidden in a spot — it's revealed by clicking the window.
export const windowItem = { owner: 'esgi', type: 'cat', label: 'Boots the Cat' };

// Tracks if the cat has been successfully collected (replaces windowOpened)
export let catCollected = false;
export function setCatCollected() { catCollected = true; }

// Tracks which specific item instances (by array index) have already
// been picked up, so clicking the same spot twice doesn't duplicate items.
export const pickedUpIndexes = new Set();
export let windowOpened = false;
export function setWindowOpened() { windowOpened = true; }

// Returns the next not-yet-collected item hidden at a given spot, or null.
export function getItemAtSpot(spotId) {
  const index = hiddenItems.findIndex(
    (item, i) => item.spotId === spotId && !pickedUpIndexes.has(i)
  );
  if (index === -1) return null;
  pickedUpIndexes.add(index);
  return hiddenItems[index];
}

// Same lookup as getItemAtSpot but does NOT mark it picked up — used to
// show what's currently sitting at a spot (so the player sees it before
// tapping it) without consuming it. Call getItemAtSpot() to actually claim it.
export function peekItemAtSpot(spotId) {
  const index = hiddenItems.findIndex(
    (item, i) => item.spotId === spotId && !pickedUpIndexes.has(i)
  );
  return index === -1 ? null : hiddenItems[index];
}

// Emoji shown in the inventory grid and at the spot an item is found —
// keyed by each item's `type` field.
export const ITEM_EMOJI = {
  juice: '🧃',
  waffle: '🧇',
  cat: '🐈‍⬛',
  ticket: '🎫',
  lollipop: '🍭',
};

// The backpack only holds this many items at once (regardless of mix —
// e.g. 2 waffles + 2 juices + 1 cat = full). Once full, the player has
// to give something to a character before picking up anything else.
// Shared by main.js (enforces it) and ui.js (renders exactly this many
// slots), so it only needs to change in one place.
export const MAX_INVENTORY = 5;

// ========================================================
// CHORE TASKS — Grace's happiness also goes up from tidying the flat:
// sweeping the floor and washing the dirty plates. These don't go
// through the inventory (nothing to carry/give), they just mark
// themselves done when clicked. Add/remove entries here to add more
// mess spots or plates without touching main.js.
// ========================================================
export const choreTasks = [
  { taskId: 'sweep-0', owner: 'grace', task: 'sweep',  label: 'Sweep the floor' },
  { taskId: 'sweep-1', owner: 'grace', task: 'sweep',  label: 'Sweep the floor' },
  { taskId: 'sweep-2', owner: 'grace', task: 'sweep',  label: 'Sweep the floor' },
  { taskId: 'sweep-3', owner: 'grace', task: 'sweep',  label: 'Sweep the floor' },
  { taskId: 'dish-0',  owner: 'grace', task: 'dishes', label: 'Wash the dirty plate' },
  { taskId: 'dish-1',  owner: 'grace', task: 'dishes', label: 'Wash the dirty plate' },
];

export const completedChores = new Set();

// Marks a chore done (no-op if already done). Returns the task, or null
// if the id doesn't exist / was already completed.
export function completeChore(taskId) {
  if (completedChores.has(taskId)) return null;
  const chore = choreTasks.find(c => c.taskId === taskId);
  if (!chore) return null;
  completedChores.add(taskId);
  return chore;
}

export function isChoreDone(taskId) {
  return completedChores.has(taskId);
}

// How many of a given owner's chores of a given task type are done,
// e.g. getChoreProgress('grace', 'sweep') -> { done: 2, total: 4 }
export function getChoreProgress(owner, task) {
  const matching = choreTasks.filter(c => c.owner === owner && c.task === task);
  const done = matching.filter(c => completedChores.has(c.taskId)).length;
  return { done, total: matching.length };
}
