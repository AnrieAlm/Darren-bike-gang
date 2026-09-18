import sys

# ---------------- room.js: remove 2 of Grace's 4 juice cartons ----------------
path1 = "js/room.js"
with open(path1, "r", encoding="utf-8") as f:
    c1 = f.read()

old1 = """  // Grace's grape juice cartons — spread across 4 spots
  { spotId: 'fridge',  owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'cabinet', owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'table',   owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'oven',    owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },"""

new1 = """  // Grace's grape juice cartons — only 2 now; she also requires her
  // chores (sweeping + dishes) to be done, see grace.js.
  { spotId: 'fridge',  owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },
  { spotId: 'cabinet', owner: 'grace', type: 'juice', label: 'Grape Juice Carton' },"""

if old1 not in c1:
    print("ERROR (room.js): juice carton block not found as expected. No changes made to room.js.")
    sys.exit(1)

c1 = c1.replace(old1, new1, 1)
with open(path1, "w", encoding="utf-8") as f:
    f.write(c1)
print("room.js: reduced juice cartons from 4 to 2.")

# ---------------- grace.js: require chores too ----------------
path2 = "js/characters/grace.js"
with open(path2, "r", encoding="utf-8") as f:
    c2 = f.read()

old2a = """const JUICE_NEEDED = 4;
let juicesGiven = 0;"""

new2a = """const JUICE_NEEDED = 2;
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
}"""

old2b = """    promptGiveItem(grace.name, (selectedItem) => {
      if (selectedItem.type === 'juice') {
        game.removeInventory('grace', 'juice', 1);
        juicesGiven++;
        
        if (juicesGiven >= JUICE_NEEDED) {
          game.recruit('grace');
          showDialog({
            portraitUrl: grace.portraitHappy,
            text: `${grace.name}: You're a legend, I'm in!`,
            buttons: [{ label: 'Close', onClick: hideDialog }],
            autoHideMs: 2500
          });
        } else {
          showDialog({
            portraitUrl: grace.portraitNeutral,
            text: `${grace.name}: Thanks! Need ${JUICE_NEEDED - juicesGiven} more.`,
            buttons: [{ label: 'Close', onClick: hideDialog }]
          });
        }
      } else {"""

new2b = """    promptGiveItem(grace.name, (selectedItem) => {
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
      } else {"""

old2c = """    return { done, total };
  },

  onInteract(game) {"""

new2c = """    return { done, total };
  },

  // Called by main.js whenever one of Grace's chores gets completed —
  // lets her check whether juice + sweeping + dishes are ALL done now,
  // in case the last chore finishes after she already has enough juice.
  onChoreProgress(game) {
    tryRecruit(game);
  },

  onInteract(game) {"""

missing = []
if old2a not in c2: missing.append("JUICE_NEEDED block")
if old2b not in c2: missing.append("promptGiveItem juice block")
if old2c not in c2: missing.append("getProgress/onInteract boundary")

if missing:
    print("ERROR (grace.js): could not find:", ", ".join(missing), "— No changes made to grace.js.")
    sys.exit(1)

c2 = c2.replace(old2a, new2a, 1)
c2 = c2.replace(old2b, new2b, 1)
c2 = c2.replace(old2c, new2c, 1)
with open(path2, "w", encoding="utf-8") as f:
    f.write(c2)
print("grace.js: recruit condition now requires juice + sweeping + dishes.")

# ---------------- main.js: re-check Grace after any chore completes ----------------
path3 = "js/main.js"
with open(path3, "r", encoding="utf-8") as f:
    c3 = f.read()

old3 = """  completeChore(taskId) {
    const chore = completeChore(taskId);
    if (chore) refreshHappiness();
    return chore;
  },"""

new3 = """  completeChore(taskId) {
    const chore = completeChore(taskId);
    if (chore) {
      refreshHappiness();
      if (chore.owner === 'grace' && typeof grace.onChoreProgress === 'function') {
        grace.onChoreProgress(game);
      }
    }
    return chore;
  },"""

if old3 not in c3:
    print("ERROR (main.js): completeChore method not found as expected. No changes made to main.js.")
    sys.exit(1)

c3 = c3.replace(old3, new3, 1)
with open(path3, "w", encoding="utf-8") as f:
    f.write(c3)
print("main.js: chore completion now re-checks Grace's recruit condition.")

print("ALL DONE.")