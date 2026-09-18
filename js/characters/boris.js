// ========================================================
// boris.js — recruited by handing over 5 lollipops (1 at a time)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';

const LOLLIPOPS_NEEDED = 5;
let lollipopsGiven = 0; // Tracks how many Boris has received locally

const boris = {
  id: 'boris',
  name: 'Boris',
  position: { top: '75%', left: '60%' },
  portraitNeutral: 'assets/boris_neutral.png',
  portraitHappy: 'assets/boris_happy.png',
  emojiFallback: '🍭',

  getProgress(game) {
    if (game.isRecruited('boris')) return { done: 1, total: 1 };
    // Use the local counter so the bar stays full even after items leave the inventory
    return { done: Math.min(lollipopsGiven, LOLLIPOPS_NEEDED), total: LOLLIPOPS_NEEDED };
  },

  onInteract(game) {
    if (game.isRecruited('boris')) {
      showDialog({
        portraitUrl: boris.portraitHappy,
        text: `${boris.name}: Let's ride!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }

    // 1. Prompt the player to select an item (inventory glows)
    promptGiveItem(boris.name, (selectedItem) => {
      
      // 2. Check if the selected item is the right one
      if (selectedItem.type === 'lollipop') {
        
        // 3. THIS IS WHERE THE ITEM DISAPPEARS FROM THE INVENTORY (1 at a time)
        game.removeInventory('boris', 'lollipop', 1);
        lollipopsGiven++;
        
        // 4. Check if we've reached the goal
        if (lollipopsGiven >= LOLLIPOPS_NEEDED) {
          game.recruit('boris');
          showDialog({
            portraitUrl: boris.portraitHappy,
            text: `${boris.name}: Best gift ever. I'm in the gang!`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        } else {
          showDialog({
            portraitUrl: boris.portraitNeutral,
            text: `${boris.name}: Sweet! Need ${LOLLIPOPS_NEEDED - lollipopsGiven} more.`,
            buttons: [{ label: 'Close', onClick: hideDialog }]
          });
        }
      } else {
        // Wrong item selected
        showDialog({
          portraitUrl: boris.portraitNeutral,
          text: `${boris.name}: I only want lollipops!`,
          buttons: [{ label: 'Close', onClick: hideDialog }]
        });
      }
    });
  }
};

export default boris;