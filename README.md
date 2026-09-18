# 🚲 Flat 037: The Bicycle Gang

A browser-based point-and-click adventure game built for **Darren's Birthday!** 🎉  
Runs on any phone or desktop browser with no installation required. Built with plain HTML, CSS, and JavaScript, making it ready to deploy straight to GitHub Pages.

---

## 🎮 Features & Gameplay
- **Esgi**: Open the window, bring in Boots the cat, and give it to Esgi.
- **Sharad**: Says "Yo bro!" every 50s. Reply in time 10x to recruit him. Miss 3 times in a row, and security is called!
- **Grace**: Find all 4 hidden grape juice cartons and give them to her.
- **Boris**: Find 5 hidden waffles and give them to him.
- **Maya**: Find 5 hidden waffles and give them to her.
- **Win Condition**: Recruit all required characters to see the "Darren is a millionaire" win screen! 🏆
- **Lose Condition**: Security meter hits 100, or Sharad cries. 💀
- *(Note: Mimi is currently a stub and excluded from the win condition).*

---

## 💻 How to Run Locally
You can open `index.html` directly in a browser, **but** because the game uses ES modules (`import`/`export`), some browsers will block this on a `file://` path. 

The easiest fix is to run a tiny local server from this folder:

**Option 1: VS Code (Recommended)**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
2. Right-click `index.html` → **"Open with Live Server"**.

**Option 2: Python**
Open your terminal in this folder and run:
```bash
python3 -m http.server