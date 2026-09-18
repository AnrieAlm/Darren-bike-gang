import re, sys

path = "index.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

block = '''          <g id="pendant-light" transform="translate(420,-340)">
            <line x1="330" y1="360" x2="330" y2="430" stroke="#3a2a20" stroke-width="4"/>
            <circle cx="330" cy="452" r="9" fill="#5a4030"/>
            <ellipse cx="330" cy="452" rx="48" ry="40" fill="#fff6dd" opacity="0.3"/>
            <g stroke="#4a3626" stroke-width="3" fill="none" opacity="0.9">
              <polygon points="330,432 295,452 304,480 356,480 365,452"/>
              <line x1="330" y1="432" x2="330" y2="480"/>
              <line x1="295" y1="452" x2="365" y2="452"/>
              <line x1="304" y1="480" x2="356" y2="432"/>
              <line x1="356" y1="480" x2="304" y2="432"/>
            </g>
          </g>
'''

if block not in content:
    print("ERROR: exact pendant-light block not found — file may differ from expected. No changes made.")
    sys.exit(1)

content = content.replace(block, "", 1)

marker = "<!-- Dining chairs, grey with a dotted mesh back -->"
if marker not in content:
    print("ERROR: insertion point (Dining chairs comment) not found. No changes made.")
    sys.exit(1)

content = content.replace(marker, block + "\n          " + marker, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done: pendant-light moved to after the cabinets group.")
