// ========================================================
// boris.js — recruited by handing over 5 waffles. Waffles are a
// shared pool (see room.js) — any waffle found anywhere counts,
// it doesn't matter whether it was "meant" for him or Maya.
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const WAFFLES_NEEDED = 5;

const boris = {
  id: 'boris',
  name: 'Boris',
  position: { top: '75%', left: '60%' },
  portraitNeutral: '../assets/boris_neutral.png',
  portraitHappy: '../assets/boris_happy.png',
  emojiFallback: '🧇',

  getProgress(game) {
    if (game.isRecruited('boris')) return { done: 1, total: 1 };
    return { done: Math.min(game.getInventoryCount('shared', 'waffle'), WAFFLES_NEEDED), total: WAFFLES_NEEDED };
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

    const have = game.getInventoryCount('shared', 'waffle');

    if (have < WAFFLES_NEEDED) {
      showDialog({
        portraitUrl: boris.portraitNeutral,
        text: `${boris.name}: I could really go for a waffle right now. (${have}/${WAFFLES_NEEDED} found)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    showDialog({
      portraitUrl: boris.portraitNeutral,
      text: `${boris.name}: Are those all for me?`,
      buttons: [{
        label: 'Give him the waffles',
        onClick: () => {
          game.removeInventory('shared', 'waffle', WAFFLES_NEEDED);
          game.recruit('boris');
          showDialog({
            portraitUrl: boris.portraitHappy,
            text: `${boris.name}: Best gift ever. I'm in the gang!`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        }
      }]
    });
  }
};

export default boris;
