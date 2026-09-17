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

  // Boris's waffles (needs 5) — reuse spots, multiple items per spot allowed
  { spotId: 'fridge',  owner: 'boris', type: 'waffle', label: 'Waffle' },
  { spotId: 'cabinet', owner: 'boris', type: 'waffle', label: 'Waffle' },
  { spotId: 'table',   owner: 'boris', type: 'waffle', label: 'Waffle' },
  { spotId: 'oven',    owner: 'boris', type: 'waffle', label: 'Waffle' },
  { spotId: 'fridge',  owner: 'boris', type: 'waffle', label: 'Waffle' },

  // Maya's waffles (needs 5)
  { spotId: 'cabinet', owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'table',   owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'oven',    owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'fridge',  owner: 'maya', type: 'waffle', label: 'Waffle' },
  { spotId: 'cabinet', owner: 'maya', type: 'waffle', label: 'Waffle' },
];

// Esgi's item isn't hidden in a spot — it's revealed by clicking the window.
export const windowItem = { owner: 'esgi', type: 'cat', label: 'Boots the Cat' };

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
