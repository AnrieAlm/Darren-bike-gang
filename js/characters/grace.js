// ========================================================
// grace.js — recruited by finding all her hidden grape juice cartons (1 at a time)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';
import { getChoreProgress } from '../room.js';

const JUICE_NEEDED = 4;
let juicesGiven = 0;

const grace = {
  id: 'grace',
  name: 'Grace',
  position: { top: '66%', left: '90%' },
  portraitNeutral: '../assets/grace_neutral.png',
  portraitHappy: '../assets/grace_happy.png',
  emojiFallback: '🧃',

  getProgress(game) {
    if (game.isRecruited('grace')) return { done: 1, total: 1 };
    
    const juice = Math.min(juicesGiven, JUICE_NEEDED);
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

    promptGiveItem(grace.name, (selectedItem) => {
      if (selectedItem.type === 'juice') {
        game.removeInventory('grace', 'juice', 1);
        juicesGiven++;
        
        if (juicesGiven >= JUICE_NEEDED) {
          game.recruit('grace');
          showDialog({
            portraitUrl: grace.portraitHappy,
            text: `${grace.name}: You're a legend, I'm in!`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        } else {
          showDialog({
            portraitUrl: grace.portraitNeutral,
            text: `${grace.name}: Thanks! Need ${JUICE_NEEDED - juicesGiven} more.`,
            buttons: [{ label: 'Close', onClick: hideDialog }]
          });
        }
      } else {
        showDialog({
          portraitUrl: grace.portraitNeutral,
          text: `${grace.name}: I only want grape juice!`,
          buttons: [{ label: 'Close', onClick: hideDialog }]
        });
      }
    });
  }
};

export default grace;