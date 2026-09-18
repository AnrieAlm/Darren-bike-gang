// ========================================================
// mimi.js — recruited by giving her a movie ticket, found hidden
// around the flat (see room.js — she's the second thing in the cabinet).
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const mimi = {
  id: 'mimi',
  name: 'Mimi',
  position: { top: '66%', left: '47%' }, // open floor, central
  portraitNeutral: '../assets/mimi_neutral.png',
  portraitHappy: '../assets/mimi_happy.png',
  emojiFallback: '🎬',

  getProgress(game) {
    if (game.isRecruited('mimi')) return { done: 1, total: 1 };
    return { done: game.getInventoryCount('mimi', 'ticket') > 0 ? 1 : 0, total: 1 };
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

    const hasTicket = game.getInventoryCount('mimi', 'ticket') > 0;

    if (!hasTicket) {
      showDialog({
        portraitUrl: mimi.portraitNeutral,
        text: `${mimi.name}: I really want to catch a film tonight... if only I had a ticket. 🎬`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    game.removeInventory('mimi', 'ticket', 1);
    game.recruit('mimi');
    showDialog({
      portraitUrl: mimi.portraitHappy,
      text: `${mimi.name}: Yesss! Okay, I'm in the gang!`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  }
};

export default mimi;
