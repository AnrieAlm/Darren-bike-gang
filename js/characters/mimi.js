// ========================================================
// mimi.js — STUB. Recruitment mechanic not decided yet.
// She's excluded from the win condition until you set requireMimi = true
// in main.js's requiredCharacters list.
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const mimi = {
  id: 'mimi',
  name: 'Mimi',
  position: { top: '66%', left: '47%' }, // open floor between the table and counter
  portraitNeutral: '../assets/mimi_neutral.png',
  portraitHappy: '../assets/mimi_happy.png',
  emojiFallback: '❓',

  // TODO: once her mechanic is decided, add a getProgress(game) method
  // here like the other characters have (see grace.js/boris.js) —
  // main.js will automatically pick it up and give her a happiness bar.

  // TODO: replace with her real recruitment logic once you've decided it.
  onInteract(game) {
    showDialog({
      portraitUrl: mimi.portraitNeutral,
      text: `${mimi.name}: (Not sure what I need yet... coming soon!)`,
      buttons: [{ label: 'Close', onClick: hideDialog }]
    });
  }
};

export default mimi;
