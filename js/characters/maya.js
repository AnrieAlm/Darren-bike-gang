// ========================================================
// maya.js — recruited by handing over 5 waffles (1 at a time)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';

const WAFFLES_NEEDED = 5;
let wafflesGiven = 0;

const maya = {
  id: 'maya',
  name: 'Maya',
  position: { top: '75%', left: '25%' },
  portraitNeutral: '../assets/maya_neutral.png',
  portraitHappy: '../assets/maya_happy.png',
  emojiFallback: '🧇',

  getProgress(game) {
    if (game.isRecruited('maya')) return { done: 1, total: 1 };
    return { done: Math.min(wafflesGiven, WAFFLES_NEEDED), total: WAFFLES_NEEDED };
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

    promptGiveItem(maya.name, (selectedItem) => {
      if (selectedItem.type === 'waffle') {
        game.removeInventory('maya', 'waffle', 1);
        wafflesGiven++;
        
        if (wafflesGiven >= WAFFLES_NEEDED) {
          game.recruit('maya');
          showDialog({
            portraitUrl: maya.portraitHappy,
            text: `${maya.name}: Okay, I'm in. Let's steal some bikes.`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        } else {
          showDialog({
            portraitUrl: maya.portraitNeutral,
            text: `${maya.name}: Thanks! Need ${WAFFLES_NEEDED - wafflesGiven} more.`,
            buttons: [{ label: 'Close', onClick: hideDialog }]
          });
        }
      } else {
        showDialog({
          portraitUrl: maya.portraitNeutral,
          text: `${maya.name}: I only want waffles!`,
          buttons: [{ label: 'Close', onClick: hideDialog }]
        });
      }
    });
  }
};

export default maya;