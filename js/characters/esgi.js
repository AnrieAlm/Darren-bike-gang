// ========================================================
// esgi.js — recruited by giving her Boots the Cat (found via the window)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';
import { setCatCollected } from '../room.js';
let catGiven = 0;

// --- PROXIMITY SETTINGS ---
// Matches the new center point we set in main.js
const WINDOW_POS = { top: 21, left: 24 }; 
// Increased to 100 so the joystick's wide radius isn't blocked by a strict distance check!
const PROXIMITY_THRESHOLD = 100; 
// --------------------------

const esgi = {
  id: 'esgi',
  name: 'Esgi',
  position: { top: '38%', left: '30%' }, 
  portraitNeutral: '../assets/esgi_neutral.png',
  portraitHappy: '../assets/esgi_happy.png',
  emojiFallback: '😿',

  getProgress(game) {
    if (game.isRecruited('esgi')) return { done: 1, total: 1 };
    return { done: catGiven, total: 1 };
  },

  onInteract(game) {
    if (game.isRecruited('esgi')) {
      showDialog({
        portraitUrl: esgi.portraitHappy,
        text: `${esgi.name}: Let's go steal some bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    promptGiveItem(esgi.name, (selectedItem) => {
      if (selectedItem.type === 'cat') {
        game.removeInventory('esgi', 'cat', 1);
        catGiven = 1;
        game.recruit('esgi');
        showDialog({
          portraitUrl: esgi.portraitHappy,
          text: `${esgi.name}: I'm in! Anything for Boots. 🐱`,
          buttons: [{ label: 'Close', onClick: hideDialog }],
          autoHideMs: 2500
        });
      } else {
        showDialog({
          portraitUrl: esgi.portraitNeutral,
          text: `${esgi.name}: I only want Boots the cat! 😢`,
          buttons: [{ label: 'Close', onClick: hideDialog }]
        });
      }
    });
  },

  onWindowOpened(game) {
    // Safely get Darren's position from the game object
    const darrenPos = game.getDarrenPos ? game.getDarrenPos() : { top: 80, left: 50 };
    const pTop = darrenPos.top;
    const pLeft = darrenPos.left;
    
    // Calculate the distance to the window
    const distance = Math.hypot(pTop - WINDOW_POS.top, pLeft - WINDOW_POS.left);

    // If Darren is too far away, stop him!
    if (distance > PROXIMITY_THRESHOLD) {
      showDialog({
        text: `Darren: It's too far! I need to walk closer to the window to reach Boots.`,
        buttons: [{ label: 'Okay', onClick: hideDialog }],
        autoHideMs: 2000
      });
      return; 
    }

    // If he's close enough, proceed with the original logic
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
            return; 
          }
          document.getElementById('window-cat')?.classList.add('collected'); 
          game.addInventory({ owner: 'esgi', type: 'cat', label: 'Boots the Cat' });
          setCatCollected();
          hideDialog();
        }
      }]
    });
  }
};

export default esgi;