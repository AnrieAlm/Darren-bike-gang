// ========================================================
// grace.js — recruited by finding all her hidden grape juice cartons (1 at a time)
// ========================================================
import { showDialog, hideDialog, promptGiveItem } from '../ui.js';
import { getChoreProgress } from '../room.js';

const JUICE_NEEDED = 2;
let juicesGiven = 0;

// All three — juice, sweeping, and dishes — must be fully done before
// Grace will actually join. Juice alone used to be enough; now Darren
// has to help clean up too.
function tryRecruit(game) {
  if (game.isRecruited('grace')) return;
  const sweep = getChoreProgress('grace', 'sweep');
  const dishes = getChoreProgress('grace', 'dishes');
  const ready = juicesGiven >= JUICE_NEEDED && sweep.done >= sweep.total && dishes.done >= dishes.total;
  if (ready) {
    game.recruit('grace');
    showDialog({
      portraitUrl: grace.portraitHappy,
      text: `${grace.name}: The flat's spotless and I've got my juice — you're a legend, I'm in!`,
      buttons: [{ label: 'Close', onClick: hideDialog }],
      autoHideMs: 2500
    });
  }
}

const grace = {
  id: 'grace',
  name: 'Grace',
  position: { top: '66%', left: '90%' },
  portraitNeutral: 'assets/grace_neutral.png',
  portraitHappy: 'assets/grace_happy.png',
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

  // Called by main.js whenever one of Grace's chores gets completed —
  // lets her check whether juice + sweeping + dishes are ALL done now,
  // in case the last chore finishes after she already has enough juice.
  onChoreProgress(game) {
    tryRecruit(game);
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

        const sweep = getChoreProgress('grace', 'sweep');
        const dishes = getChoreProgress('grace', 'dishes');
        const stillNeeded = [];
        if (juicesGiven < JUICE_NEEDED) stillNeeded.push(`${JUICE_NEEDED - juicesGiven} more juice`);
        if (sweep.done < sweep.total) stillNeeded.push('sweeping the floor');
        if (dishes.done < dishes.total) stillNeeded.push('the dishes');

        if (stillNeeded.length === 0) {
          tryRecruit(game);
        } else {
          showDialog({
            portraitUrl: grace.portraitNeutral,
            text: `${grace.name}: Thanks! Still need: ${stillNeeded.join(', ')}.`,
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