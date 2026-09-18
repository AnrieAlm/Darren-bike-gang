// ========================================================
// mimi.js — recruited by giving her a movie ticket (1 at a time)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';

let ticketGiven = 0;

const mimi = {
  id: 'mimi',
  name: 'Mimi',
  position: { top: '66%', left: '47%' },
  portraitNeutral: 'assets/mimi_neutral.png',
  portraitHappy: 'assets/mimi_happy.png',
  emojiFallback: '🎬',

  getProgress(game) {
    if (game.isRecruited('mimi')) return { done: 1, total: 1 };
    return { done: ticketGiven, total: 1 };
  },

  onInteract(game) {
    if (game.isRecruited('mimi')) {
      showDialog({
        portraitUrl: mimi.portraitHappy,
        text: `${mimi.name}: Movie night was amazing — let's steal some bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    promptGiveItem(mimi.name, (selectedItem) => {
      if (selectedItem.type === 'ticket') {
        game.removeInventory('mimi', 'ticket', 1);
        ticketGiven = 1;
        game.recruit('mimi');
        showDialog({
          portraitUrl: mimi.portraitHappy,
          text: `${mimi.name}: Yesss! Okay, I'm in the gang!`,
          buttons: [{ label: 'Close', onClick: hideDialog }],
          autoHideMs: 2500
        });
      } else {
        showDialog({
          portraitUrl: mimi.portraitNeutral,
          text: `${mimi.name}: I really just want to catch a film... I need a ticket. 🎬`,
          buttons: [{ label: 'Close', onClick: hideDialog }]
        });
      }
    });
  }
};

export default mimi;