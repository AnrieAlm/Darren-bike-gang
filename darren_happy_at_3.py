import sys

path = "js/main.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = '''  recruit(id) {
    recruited.add(id);
    setRecruitedCount(recruited.size, requiredCharacters.length);
    updateSpriteState(id);
    refreshHappiness();
    const character = ALL_CHARACTERS.find(c => c.id === id);
    if (character) showRecruitToast(character.name);
    checkWinCondition();
  },'''

new = '''  recruit(id) {
    recruited.add(id);
    setRecruitedCount(recruited.size, requiredCharacters.length);
    updateSpriteState(id);
    refreshHappiness();
    const character = ALL_CHARACTERS.find(c => c.id === id);
    if (character) showRecruitToast(character.name);
    if (recruited.size >= 3) {
      const darrenEl = document.getElementById('darren-sprite');
      if (darrenEl) darrenEl.style.backgroundImage = "url('../assets/darren_happy.png')";
    }
    checkWinCondition();
  },'''

if old not in content:
    print("ERROR: could not find the recruit(id) block — file may differ from expected. No changes made.")
    sys.exit(1)

content = content.replace(old, new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done: Darren switches to his happy portrait once 3 characters are recruited.")