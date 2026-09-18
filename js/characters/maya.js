// ========================================================
// maya.js — recruited by handing over 5 waffles (hers specifically,
// separate from Boris's lollipops — see room.js).
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
    return { done: Math.min(game.getInventoryCount('maya', 'waffle'), WAFFLES_NEEDED), total: WAFFLES_NEEDED };
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

    const have = game.getInventoryCount('maya', 'waffle');

    if (have < WAFFLES_NEEDED) {
      showDialog({
        portraitUrl: maya.portraitNeutral,
        text: `${maya.name}: Waffles would really help me decide... (${have}/${WAFFLES_NEEDED} found)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    game.removeInventory('maya', 'waffle', WAFFLES_NEEDED);
    game.recruit('maya');
    showDialog({
      portraitUrl: maya.portraitHappy,
      text: `${maya.name}: Okay, I'm in. Let's steal some bikes.`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  }
};

export default maya;
