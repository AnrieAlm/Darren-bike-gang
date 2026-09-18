import sys

path = "js/main.js"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old1 = '''  el.style.top = `${darrenPos.top}%`;
  el.style.left = `${darrenPos.left}%`;
  el.textContent = '🧑';
  el.title = 'Darren (you)';'''

new1 = '''  el.style.top = `${darrenPos.top}%`;
  el.style.left = `${darrenPos.left}%`;
  el.style.backgroundImage = "url('../assets/darren_neutral.png')";
  el.title = 'Darren (you)';'''

if old1 not in content:
    print("ERROR: could not find the Darren sprite-creation block — file may differ from expected. No changes made.")
    sys.exit(1)

content = content.replace(old1, new1, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done: Darren now shows his neutral portrait.")