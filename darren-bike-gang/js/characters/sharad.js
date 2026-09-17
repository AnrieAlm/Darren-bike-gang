// ========================================================
// sharad.js — every 50s he says "Yo bro!" and you must say it back
// in time. 10 successful replies = recruited.
// 3 MISSED replies IN A ROW = he starts crying = security called = game over.
// ========================================================
import { showDialog, hideDialog } from '../ui.js';

const YO_BRO_INTERVAL_MS = 50000;   // how often he says it
const REPLY_WINDOW_MS = 8000;       // how long you have to reply
const SUCCESSES_NEEDED = 10;
const MAX_CONSECUTIVE_MISSES = 3;

let intervalId = null;
let replyTimeoutId = null;
let successCount = 0;
let consecutiveMisses = 0;
let awaitingReply = false;

const sharad = {
  id: 'sharad',
  name: 'Sharad',
  position: { top: '60%', left: '10%' },
  portraitNeutral: '../assets/sharad_neutral.png',
  portraitHappy: '../assets/sharad_happy.png',
  emojiFallback: '🧢',

  // Starts his periodic "yo bro" calls. Call once when the game starts.
  start(game) {
    this.stop(); // clear any previous timers first
    intervalId = setInterval(() => triggerYoBro(game), YO_BRO_INTERVAL_MS);
  },

  stop() {
    if (intervalId) clearInterval(intervalId);
    if (replyTimeoutId) clearTimeout(replyTimeoutId);
    intervalId = null;
    replyTimeoutId = null;
    successCount = 0;
    consecutiveMisses = 0;
    awaitingReply = false;
  },

  // Clicking Sharad directly just shows status — the real interaction
  // happens through the timed popup triggered by triggerYoBro().
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
      text: `${sharad.name}: (${successCount}/${SUCCESSES_NEEDED} yo bros so far — wait for him to say it!)`,
      buttons: [{ label: 'Close', onClick: hideDialog }]
    });
  }
};

function triggerYoBro(game) {
  if (game.isRecruited('sharad') || game.isGameOver()) return;

  awaitingReply = true;
  showDialog({
    portraitUrl: sharad.portraitNeutral,
    text: `${sharad.name}: Yo bro!! 🗣️`,
    buttons: [{
      label: 'Yo bro back!',
      onClick: () => handleReply(game, true)
    }]
  });

  // If the player doesn't click in time, count it as a miss.
  replyTimeoutId = setTimeout(() => {
    if (awaitingReply) handleReply(game, false);
  }, REPLY_WINDOW_MS);
}

function handleReply(game, replied) {
  if (!awaitingReply) return;
  awaitingReply = false;
  clearTimeout(replyTimeoutId);
  hideDialog();

  if (replied) {
    successCount++;
    consecutiveMisses = 0;
    if (successCount >= SUCCESSES_NEEDED) {
      sharad.stop();
      game.recruit('sharad');
      showDialog({
        portraitUrl: sharad.portraitHappy,
        text: `${sharad.name}: Yooo bro you're solid, I'm in the gang!`,
        buttons: [{ label: 'Close', onClick: hideDialog }],
        autoHideMs: 2500
      });
    }
  } else {
    consecutiveMisses++;
    if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) {
      sharad.stop();
      game.endGame('lose', `${sharad.name} started crying because you kept ignoring him. Security is here.`);
    }
  }
}

export default sharad;
