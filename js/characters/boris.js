// ========================================================
// boris.js — recruited by handing over 5 lollipops (his own item,
// separate from Maya's waffles — see room.js).
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const LOLLIPOPS_NEEDED = 5;

const boris = {
  id: 'boris',
  name: 'Boris',
  position: { top: '75%', left: '60%' },
  portraitNeutral: '../assets/boris_neutral.png',
  portraitHappy: '../assets/boris_happy.png',
  emojiFallback: '🍭',

  getProgress(game) {
    if (game.isRecruited('boris')) return { done: 1, total: 1 };
    return { done: Math.min(game.getInventoryCount('boris', 'lollipop'), LOLLIPOPS_NEEDED), total: LOLLIPOPS_NEEDED };
  },

  onInteract(game) {
    if (game.isRecruited('boris')) {
      showDialog({
        portraitUrl: boris.portraitHappy,
        text: `${boris.name}: Let's ride!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    const have = game.getInventoryCount('boris', 'lollipop');

    if (have < LOLLIPOPS_NEEDED) {
      showDialog({
        portraitUrl: boris.portraitNeutral,
        text: `${boris.name}: I could really go for a lollipop right now. (${have}/${LOLLIPOPS_NEEDED} found)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    game.removeInventory('boris', 'lollipop', LOLLIPOPS_NEEDED);
    game.recruit('boris');
    showDialog({
      portraitUrl: boris.portraitHappy,
      text: `${boris.name}: Best gift ever. I'm in the gang!`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  }
};

export default boris;
