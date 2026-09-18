// ========================================================
// esgi.js — recruited by giving her Boots the Cat (found via the window)
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const esgi = {
  id: 'esgi',
  name: 'Esgi',
  position: { top: '38%', left: '30%' }, // standing on the floor below the window
  // TODO: swap in your generated portraits
  portraitNeutral: '../assets/esgi_neutral.png',
  portraitHappy: '../assets/esgi_happy.png',
  emojiFallback: '😿', // shown until portrait images exist

  getProgress(game) {
    if (game.isRecruited('esgi')) return { done: 1, total: 1 };
    return { done: game.getInventoryCount('esgi', 'cat') > 0 ? 1 : 0, total: 1 };
  },

  // Called whenever the player clicks Esgi's sprite in the room.
  onInteract(game) {
    if (game.isRecruited('esgi')) {
      showDialog({
        portraitUrl: esgi.portraitHappy,
        text: `${esgi.name}: Let's go steal some bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    const hasCat = game.getInventoryCount('esgi', 'cat') > 0;

    if (!hasCat) {
      showDialog({
        portraitUrl: esgi.portraitNeutral,
        text: `${esgi.name}: I miss Boots so much... 😢 (Try the window?)`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    game.removeInventory('esgi', 'cat', 1);
    game.recruit('esgi');
    showDialog({
      portraitUrl: esgi.portraitHappy,
      text: `${esgi.name}: I'm in! Anything for Boots. 🐱`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  },

  // Called when the player clicks the window hotspot.
  onWindowOpened(game) {
    showDialog({
      text: `You open the window — Boots the Cat is sitting right there on the ledge!`,
      buttons: [{
        label: 'Bring the cat in',
        onClick: () => {
          if (game.isInventoryFull()) {
            showDialog({
              text: `Your backpack is full! Give something away first, then come back for Boots.`,
              buttons: [{ label: 'Okay', onClick: hideDialog }],
              autoHideMs: 2000
            });
            return; // Boots stays on the ledge
          }
          document.getElementById('window-cat')?.classList.add('collected'); // disappears from the sill
          game.addInventory({ owner: 'esgi', type: 'cat', label: 'Boots the Cat' });
          hideDialog();
        }
      }]
    });
  }
};

export default esgi;
