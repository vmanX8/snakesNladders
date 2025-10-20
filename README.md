# 🐍🪜 Snakes & Ladders – React + TypeScript

An interactive, modern **Snakes & Ladders** web app built with **React**, **TypeScript**, **Vite**, and **CSS Modules**.  

---

## ✨ Features

- 🎲 **Animated Dice Roller** – smooth roll animation with emoji faces  
- 🏃‍♀️ **2-Player Local Mode** – alternating turns and live position tracking  
- 🐍🪜 **Dynamic Board** – random snakes & ladders each game  
- 🧩 **New Layout / Reset** buttons  
- 🎉 **Winning Modal + Confetti**  
- 🎯 **Arrow Overlay** to visualize ladders/snakes, with adjustable opacity  
- 🌙 **Dark/Light Theme** via `prefers-color-scheme`  
- ⚡ Built with **Vite + React + TypeScript** for fast dev & hot reloads

---

## 📸 Preview

![Snakes & Ladders Screenshot](docs/screenshot.png)

---

## 🛠️ Tech Stack

| Category | Tools |
|-----------|-------|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Bundler   | [Vite](https://vitejs.dev/) |
| Styling   | CSS Modules + global tokens (`index.css`, `App.css`) |
| Deploy    | [Vercel](https://vercel.com/) |
| Animation | Custom hooks + canvas confetti (`ConfettiBurst.tsx`) |

---

### 🧩 Project Structure
src/
 ├─ App.tsx / App.css             # Root layout and main logic
 ├─ index.css / main.tsx          # Entry and global styles
 ├─ components/
 │   ├─ GameBoard.tsx / .module.css
 │   ├─ GameInfo.tsx / .module.css
 │   ├─ GameModal.tsx / .module.css
 │   ├─ DiceRoller.tsx
 │   └─ ConfettiBurst.tsx
 └─ utils/
     ├─ dice.ts
     └─ snakeLaddersRules.ts

---

### ⚙️ Environment & Scripts
Command	| Description
npm run dev |	Start dev server
npm run build |	Build production bundle
npm run preview	| Preview production build locally
npm run lint (optional) |	Run linter if configured

---

### 🧠 How It Works

Board Generation: generateSnakesAndLadders() creates random snake/ladder mappings.
Movement Logic: Each dice roll updates a player's position, applying snakes/ladders via getNewPosition().
Win Condition: First to reach the last cell wins and triggers GameModal + confetti.
UI State: Controlled by React hooks (useState, useCallback).
Accessibility: Keyboard-friendly buttons, semantic roles, and aria labels.

---

### 🧑‍💻 Author

Vangelis Manouhos
Frontend Engineer – React
🔗 https://my-portfolio-l4ej.vercel.app/

---

### 📄 License

This project is open-source under the MIT License.