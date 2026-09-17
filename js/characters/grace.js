// ========================================================
// grace.js — recruited by finding all her hidden grape juice cartons
// (locations are defined in room.js, not here)
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const JUICE_NEEDED = 4; // must match the number of 'grace'/'juice' entries in room.js

const grace = {
  id: 'grace',
  name: 'Grace',
  position: { top: '50%', left: '85%' },
  portraitNeutral: '../assets/grace_neutral.png',
  portraitHappy: '../assets/grace_happy.png',
  emojiFallback: '🧃',

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

    showDialog({
      portraitUrl: grace.portraitNeutral,
      text: `${grace.name}: Is that all my grape juice?!`,
      buttons: [{
        label: 'Give her the juice',
        onClick: () => {
          game.removeInventory('grace', 'juice', JUICE_NEEDED);
          game.recruit('grace');
          showDialog({
            portraitUrl: grace.portraitHappy,
            text: `${grace.name}: You're a legend, I'm in!`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        }
      }]
    });
  }
};

export default grace;
