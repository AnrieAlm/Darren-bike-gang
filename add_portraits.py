import sys

path = "js/main.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old1 = '''    el.className = 'character-sprite';
    el.id = `sprite-${character.id}`;
    el.style.top = character.position.top;
    el.style.left = character.position.left;
    el.textContent = character.emojiFallback || '🙂';
    el.title = character.name;'''

new1 = '''    el.className = 'character-sprite';
    el.id = `sprite-${character.id}`;
    el.style.top = character.position.top;
    el.style.left = character.position.left;
    el.title = character.name;
    if (character.portraitNeutral) {
      el.style.backgroundImage = `url('${character.portraitNeutral}')`;
    } else {
      el.textContent = character.emojiFallback || '🙂';
    }'''

old2 = '''function updateSpriteState(id) {
  const el = document.getElementById(`sprite-${id}`);
  if (el) el.classList.add('recruited');
}'''

new2 = '''function updateSpriteState(id) {
  const el = document.getElementById(`sprite-${id}`);
  if (!el) return;
  el.classList.add('recruited');
  const character = ALL_CHARACTERS.find(c => c.id === id);
  if (character && character.portraitHappy) {
    el.style.backgroundImage = `url('${character.portraitHappy}')`;
  }
}'''

missing = []
if old1 not in content: missing.append("sprite-creation block")
if old2 not in content: missing.append("updateSpriteState block")

if missing:
    print("ERROR: could not find:", ", ".join(missing), "— file may differ from expected. No changes made.")
    sys.exit(1)

content = content.replace(old1, new1, 1)
content = content.replace(old2, new2, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done: character sprites now use portraitNeutral/portraitHappy images.")