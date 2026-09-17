# Flat 037: The Bicycle Gang 🚲

A browser point-and-click game for Darren's birthday. Runs on any phone or
desktop browser, no install needed — built with plain HTML/CSS/JS so it
deploys straight to GitHub Pages.

## How to run it locally
Just open `index.html` in a browser — **but** because it uses ES modules
(`import`/`export`), some browsers block that on a `file://` path. Easiest
fix: run a tiny local server from this folder, e.g.
- VS Code: install the "Live Server" extension, right-click `index.html` → "Open with Live Server"
- or Python: `python3 -m http.server` then visit `http://localhost:8000`

## Folder structure
```
index.html          → page structure, loads js/main.js
style.css            → all styling, mobile-friendly touch targets
js/main.js           → game controller: state, hotspot clicks, win/lose
js/room.js           → WHERE items are hidden (edit this to move things around)
js/ui.js             → dialog box, meters, inventory bar rendering
js/characters/*.js   → one file per friend — recruitment logic lives here
assets/              → drop your generated images in here (see below)
```

## What's implemented right now
- ✅ Esgi — open the window, bring in Boots the cat, give to Esgi
- ✅ Sharad — says "Yo bro!" every 50s, reply in time 10x to recruit, 3 missed in a row = security called
- ✅ Grace — find all 4 hidden grape juice cartons, give them to her
- ✅ Boris — find 5 hidden waffles, give them to him
- ✅ Maya — find 5 hidden waffles, give them to her
- ⬜ Mimi — stub only (`js/characters/mimi.js`), excluded from the win condition for now
- ✅ Win screen once everyone required is recruited ("Darren is a millionaire")
- ✅ Lose screen if security hits 100 or Sharad cries

## Assets you still need to add
Generate these (see prompt guidance from earlier in our chat) and drop them
into `/assets/`, matching these exact filenames — the code already looks
for them:

- `room.jpg` (the flat background)
- `esgi_neutral.png`, `esgi_happy.png`
- `sharad_neutral.png`, `sharad_happy.png`
- `grace_neutral.png`, `grace_happy.png`
- `boris_neutral.png`, `boris_happy.png`
- `maya_neutral.png`, `maya_happy.png`
- `mimi_neutral.png`, `mimi_happy.png`

Until then, the game uses emoji placeholders and a plain color background
so it's fully playable as-is.

## Things you'll probably want to tune
- **Hotspot positions** — in `style.css`, the `#spot-*` rules use rough %
  positions. Once you add the real room background, nudge these to line
  up with the actual fridge/cabinet/table/oven in the image.
- **Character sprite positions** — same idea, in each character file's
  `position: { top, left }`.
- **Sharad's timing** — `YO_BRO_INTERVAL_MS` and `REPLY_WINDOW_MS` at the
  top of `js/characters/sharad.js`.
- **Grace/Boris/Maya item counts** — `JUICE_NEEDED` / `WAFFLES_NEEDED` in
  their files, must match how many entries you give them in `js/room.js`.
- **Mimi** — build out her `onInteract()` in `js/characters/mimi.js`,
  then add `'mimi'` to the `requiredCharacters` array in `js/main.js`.

## Deploying
Push this whole folder to your GitHub repo, then turn on GitHub Pages
(Settings → Pages → Deploy from branch → main → /root). Your link will be
`https://yourusername.github.io/your-repo-name/` and works on any phone.
