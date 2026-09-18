// ========================================================
// sharad.js — recruited through a dialogue menu. 
// Sharad now initiates contact: every 30s he sends a notification 
// giving you a 15s window to click him and reply. 
// Clicking him outside this 15s window does nothing.
// ========================================================
import { showDialog, hideDialog, showContextMenu, hideContextMenu } from '../ui.js';

const SUCCESSES_NEEDED = 5;
let successCount = 0;
let isWindowOpen = false;
let isRecruited = false; // Local flag to immediately stop notifications
let cycleInterval = null;
let windowTimeout = null;

const sharad = {
  id: 'sharad',
  name: 'Sharad',
  position: { top: '60%', left: '10%' },
  portraitNeutral: 'assets/sharad_neutral.png',
  portraitHappy: 'assets/sharad_happy.png',
  emojiFallback: '🧢',

  getProgress(game) {
    if (isRecruited || game.isRecruited('sharad')) return { done: 1, total: 1 };
    return { done: successCount, total: SUCCESSES_NEEDED };
  },

  // Click (or joystick center button): only opens menu if the 15s window is active
  onInteract(game, x, y) {
    if (isRecruited || game.isRecruited('sharad')) {
      showDialog({
        portraitUrl: sharad.portraitHappy,
        text: `${sharad.name}: Yo bro, let's get these bikes!`,
        buttons: [{ label: 'Close', onClick: hideDialog }]
      });
      return;
    }
    
    // If not within the 15s reply window, nothing happens (no menu appears)
    if (!isWindowOpen) {
      return;
    }
    
    openMenu(game, x, y);
  },

  // Right-click: same logic, restricted to the 15s window
  onRightClick(game, x, y) {
    if (isRecruited || game.isRecruited('sharad')) return;
    
    if (!isWindowOpen) {
      return;
    }
    
    openMenu(game, x, y);
  },

  // The actual "Yo bro" action
  sayYoBro(game) {
    if (isRecruited || game.isRecruited('sharad')) return;
    hideContextMenu();
    successCount = Math.min(SUCCESSES_NEEDED, successCount + 1);
    if (successCount >= SUCCESSES_NEEDED) {
      recruitNow(game);
    } else {
      reply(`Yo bro!! 🗣️ (${successCount}/${SUCCESSES_NEEDED})`);
    }
  },

  // Starts the 30-second notification cycle
  start(game) {
    this.stop(); // Clear any existing timers first
    
    cycleInterval = setInterval(() => {
      // Stop entirely if he's already recruited
      if (isRecruited || (game && game.isRecruited('sharad'))) {
        this.stop();
        return;
      }

      isWindowOpen = true;
      
      // Show the 15s notification
      showDialog({
        portraitUrl: sharad.portraitNeutral,
        text: `${sharad.name}: Yo bro! (You have 15s to reply!)`,
        buttons: [{ label: 'Close', onClick: hideDialog }],
        autoHideMs: 20000 // Disappears after 15 seconds
      });

      // Enforce the 15s window limit
      windowTimeout = setTimeout(() => {
        isWindowOpen = false;
        hideDialog();      // Ensure notification is gone
        hideContextMenu(); // Force-close menu if player left it open
      }, 15000);
    }, 30000); // Triggers every 30 seconds
  },

  // Cleans up all timers and resets state
  stop() {
    successCount = 0;
    isWindowOpen = false;
    
    if (cycleInterval) {
      clearInterval(cycleInterval);
      cycleInterval = null;
    }
    if (windowTimeout) {
      clearTimeout(windowTimeout);
      windowTimeout = null;
    }
    
    hideDialog();
    hideContextMenu();
  }
};

// Shared by onInteract and onRightClick
function openMenu(game, x, y) {
  // Safety check: if window closed right as they clicked, abort
  if (!isWindowOpen) {
    hideDialog();
    return;
  }

  showContextMenu(x, y, [
    {
      label: `How's your mum?`,
      hint: `What kind of bro are you?`,
      onClick: () => reply(`She's grand, thanks for asking! 😄`)
    },
    {
      label: `Hi yourself`,
      hint: `Just chatting`,
      onClick: () => reply(`Haha, sound.`)
    },
    {
      label: `Yo bro`,
      hint: `You are a Bro now (${successCount + 1}/${SUCCESSES_NEEDED})`,
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
  isRecruited = true; // Set flag to immediately halt the 30s notification cycle
  hideContextMenu();
  hideDialog(); // Clear the active notification if it's still on screen
  
  game.recruit('sharad');
  
  showDialog({
    portraitUrl: sharad.portraitHappy,
    text: `${sharad.name}: Yooo bro you're solid, I'm in the gang!`,
    buttons: [{ label: 'Close', onClick: hideDialog }],
    autoHideMs: 2500
  });
}

export default sharad;