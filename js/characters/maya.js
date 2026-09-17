// ========================================================
// maya.js — recruited by handing over 5 waffles. Waffles are a
// shared pool (see room.js) — any waffle found anywhere counts,
// it doesn't matter whether it was "meant" for her or Boris.
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const WAFFLES_NEEDED = 5;

const maya = {
  id: 'maya',
  name: 'Maya',
  position: { top: '75%', left: '25%' },
  portraitNeutral: '../assets/maya_neutral.png',
  portraitHappy: '../assets/maya_happy.png',
  emojiFallback: '🧇',

  getProgress(game) {
    if (game.isRecruited('maya')) return { done: 1, total: 1 };
    return { done: Math.min(game.getInventoryCount('shared', 'waffle'), WAFFLES_NEEDED), total: WAFFLES_NEEDED };
  },

  onInteract(game) {
    if (game.isRecruited('maya')) {
      showDialog({
        portraitUrl: maya.portraitHappy,
        text: `${maya.name}: Bike gang forever!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    const have = game.getInventoryCount('shared', 'waffle');

    if (have < WAFFLES_NEEDED) {
      showDialog({
        portraitUrl: maya.portraitNeutral,
        text: `${maya.name}: Waffles would really help me decide... (${have}/${WAFFLES_NEEDED} found)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    showDialog({
      portraitUrl: maya.portraitNeutral,
      text: `${maya.name}: You remembered my waffles!`,
      buttons: [{
        label: 'Give her the waffles',
        onClick: () => {
          game.removeInventory('shared', 'waffle', WAFFLES_NEEDED);
          game.recruit('maya');
          showDialog({
            portraitUrl: maya.portraitHappy,
            text: `${maya.name}: Okay, I'm in. Let's steal some bikes.`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        }
      }]
    });
  }
};

export default maya;
