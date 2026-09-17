// ========================================================
// mimi.js — STUB. Recruitment mechanic not decided yet.
// She's excluded from the win condition until you set requireMimi = true
// in main.js's requiredCharacters list.
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const mimi = {
  id: 'mimi',
  name: 'Mimi',
  position: { top: '10%', left: '45%' },
  portraitNeutral: '../assets/mimi_neutral.png',
  portraitHappy: '../assets/mimi_happy.png',
  emojiFallback: '❓',

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
