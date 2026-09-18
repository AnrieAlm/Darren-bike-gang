// ========================================================
// grace.js — recruited by finding all her hidden grape juice cartons
// (locations are defined in room.js, not here)
// ========================================================
import { showDialog, hideDialog } from '../ui.js';
import { getChoreProgress } from '../room.js';

const JUICE_NEEDED = 4; // must match the number of 'grace'/'juice' entries in room.js

const grace = {
  id: 'grace',
  name: 'Grace',
  position: { top: '66%', left: '90%' }, // standing on the floor by the fridge/end cabinet
  portraitNeutral: '../assets/grace_neutral.png',
  portraitHappy: '../assets/grace_happy.png',
  emojiFallback: '🧃',

  // Grace's happiness bar factors in the juice cartons (what actually
  // recruits her) PLUS the two flavour chores — sweeping and dishes —
  // so tidying the kitchen visibly makes her happier even before
  // she's fully recruited.
  getProgress(game) {
    if (game.isRecruited('grace')) return { done: 1, total: 1 };
    const juice = Math.min(game.getInventoryCount('grace', 'juice'), JUICE_NEEDED);
    const sweep = getChoreProgress('grace', 'sweep');
    const dishes = getChoreProgress('grace', 'dishes');
    const done = juice + sweep.done + dishes.done;
    const total = JUICE_NEEDED + sweep.total + dishes.total;
    return { done, total };
  },

  onInteract(game) {
    if (game.isRecruited('grace')) {
      showDialog({
        portraitUrl: grace.portraitHappy,
        text: `${grace.name}: Bike heist time! 🚲`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    const have = game.getInventoryCount('grace', 'juice');

    if (have < JUICE_NEEDED) {
      showDialog({
        portraitUrl: grace.portraitNeutral,
        text: `${grace.name}: I really need my grape juice... (${have}/${JUICE_NEEDED} found)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    // Carrying enough — hand it straight over, no extra confirm click.
    game.removeInventory('grace', 'juice', JUICE_NEEDED);
    game.recruit('grace');
    showDialog({
      portraitUrl: grace.portraitHappy,
      text: `${grace.name}: You're a legend, I'm in!`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  }
};

export default grace;
