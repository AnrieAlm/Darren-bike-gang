// ========================================================
// sharad.js — recruited through a dialogue menu. However you reach
// him (click, right-click, or the joystick's center button while
// standing next to him), you get the same 4 things you can say —
// each one's second line spells out exactly what it does, so you
// know before you pick it:
//   "How's your mum?"          -> just a reply, no effect
//   "Hi yourself"               -> just a reply, no effect
//   "Yo bro"                    -> +1 toward recruiting him
//   "I love you my best bro"    -> maxes him out and recruits him instantly
// ========================================================
import { showDialog, hideDialog, showContextMenu, hideContextMenu } from '../ui.js';

const SUCCESSES_NEEDED = 10;
let successCount = 0;

const sharad = {
  id: 'sharad',
  name: 'Sharad',
  position: { top: '60%', left: '10%' },
  portraitNeutral: '../assets/sharad_neutral.png',
  portraitHappy: '../assets/sharad_happy.png',
  emojiFallback: '🧢',

  getProgress(game) {
    if (game.isRecruited('sharad')) return { done: 1, total: 1 };
    return { done: successCount, total: SUCCESSES_NEEDED };
  },

  // Click (or the joystick center button when standing next to him):
  // opens the same menu as right-clicking. See openMenu() below.
  onInteract(game, x, y) {
    if (game.isRecruited('sharad')) {
      showDialog({
        portraitUrl: sharad.portraitHappy,
        text: `${sharad.name}: Yo bro, let's get these bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }
    openMenu(game, x, y);
  },

  // Right-click: same menu, kept as an extra way in for anyone used to it.
  onRightClick(game, x, y) {
    if (game.isRecruited('sharad')) return;
    openMenu(game, x, y);
  },

  // The actual "Yo bro" action — used by the menu option below. Kept
  // as its own method in case anything else wants to trigger it directly.
  sayYoBro(game) {
    if (game.isRecruited('sharad')) return;
    hideContextMenu();
    successCount = Math.min(SUCCESSES_NEEDED, successCount + 1);
    if (successCount >= SUCCESSES_NEEDED) {
      recruitNow(game);
    } else {
      reply(`Yo bro!! 🗣️ (${successCount}/${SUCCESSES_NEEDED})`);
    }
  },

  // Kept so main.js's stopAllTimers()/startGame() calls still work —
  // there's no background timer to run any more, it's all player-driven.
  start() {},
  stop() { successCount = 0; }
};

// Shared by onInteract and onRightClick so clicking, right-clicking,
// and the joystick center button all land on the exact same menu.
// The title line shows current progress; each option's hint spells
// out its effect before you click it.
function openMenu(game, x, y) {
  showContextMenu(x, y, [
    {
      label: `How's your mum?`,
      hint: `Just chatting — no effect`,
      onClick: () => reply(`She's grand, thanks for asking! 😄`)
    },
    {
      label: `Hi yourself`,
      hint: `Just chatting`,
      onClick: () => reply(`Haha, sound.`)
    },
    {
      label: `Yo bro`,
      hint: `You are a Bro now`,
      onClick: () => sharad.sayYoBro(game)
    },
    {
      label: `I love you my best bro`,
      hint: `Bros 4eva!`,
      onClick: () => {
        successCount = SUCCESSES_NEEDED;
        hideContextMenu();
        recruitNow(game);
      }
    }
  ], `Sharad — ${successCount}/${SUCCESSES_NEEDED}`);
}

function reply(text) {
  hideContextMenu();
  showDialog({
    portraitUrl: sharad.portraitNeutral,
    text: `${sharad.name}: ${text}`,
    buttons: [{ label: 'Close', onClick: hideDialog }],
    autoHideMs: 1600
  });
}

function recruitNow(game) {
  hideContextMenu();
  game.recruit('sharad');
  showDialog({
    portraitUrl: sharad.portraitHappy,
    text: `${sharad.name}: Yooo bro you're solid, I'm in the gang!`,
    buttons: [{ label: 'Close', onClick: hideDialog }],
    autoHideMs: 2500
  });
}

export default sharad;
