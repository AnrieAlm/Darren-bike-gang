// ========================================================
// sharad.js — recruited through a right-click dialogue menu. Right-
// click his sprite to get 4 things you can say:
//   "How's your mum?"          -> just a reply, no effect
//   "Hi yourself"               -> just a reply, no effect
//   "Yo bro"                    -> +1 toward recruiting him
//   "I love you my best bro"    -> maxes him out and recruits him instantly
// Left-clicking him just shows his current status.
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

  // Left-click: just a status check, doesn't do anything by itself —
  // the real interaction is the right-click menu below.
  onInteract(game) {
    if (game.isRecruited('sharad')) {
      showDialog({
        portraitUrl: sharad.portraitHappy,
        text: `${sharad.name}: Yo bro, let's get these bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }
    showDialog({
      portraitUrl: sharad.portraitNeutral,
      text: `${sharad.name}: (${successCount}/${SUCCESSES_NEEDED} — right-click me to chat!)`,
      buttons: [{ label: 'Close', onClick: hideDialog }]
    });
  },

  // Right-click: the dialogue menu that actually recruits him.
  onRightClick(game, x, y) {
    if (game.isRecruited('sharad')) return;

    showContextMenu(x, y, [
      {
        label: `How's your mum?`,
        onClick: () => reply(`She's grand, thanks for asking! 😄`)
      },
      {
        label: `Hi yourself`,
        onClick: () => reply(`Haha, sound.`)
      },
      {
        label: `Yo bro`,
        onClick: () => {
          successCount = Math.min(SUCCESSES_NEEDED, successCount + 1);
          if (successCount >= SUCCESSES_NEEDED) {
            recruitNow(game);
          } else {
            reply(`Yo bro!! 🗣️ (${successCount}/${SUCCESSES_NEEDED})`);
          }
        }
      },
      {
        label: `I love you my best bro`,
        onClick: () => {
          successCount = SUCCESSES_NEEDED;
          recruitNow(game);
        }
      }
    ]);
  },

  // Kept so main.js's stopAllTimers()/startGame() calls still work —
  // there's no background timer to run any more, it's all player-driven.
  start() {},
  stop() { successCount = 0; }
};

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
