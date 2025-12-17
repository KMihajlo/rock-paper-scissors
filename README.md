# Rock · Paper · Scissors

This document describes the implementation details for the Rock · Paper · Scissors app built with React (TypeScript), SCSS and Copilot. It explains project structure, how pieces interact, styling and theming, responsive behavior, and extension points so you can explore, test, and modify the app.

---

## Quick start (run locally)
1. Ensure Node 16+ is installed.
2. From the project root:
   - Install deps: `npm install`
   - Install Sass if not present: `npm install -D sass`
   - Start dev server: `npm run dev`
3. Open the URL printed by Vite (usually `http://localhost:5173`).

If you used a Vite template, `index.html` already loads `/src/main.tsx` and the app mounts to `<div id="root"></div>`.

---

## What this app does (features implemented)
- Core Rock · Paper · Scissors gameplay:
  - Player picks rock/paper/scissors.
  - Computer selects randomly after a short delay.
  - Result is computed (win / lose / draw).
  - Scoreboard tracks wins, losses, draws.
- Modern UI with SCSS and CSS custom properties.
- Light / dark theme toggle with animated knob and persistent selection (localStorage).
- Responsive layout for desktop, tablet and mobile (buttons scale, layout switches to single column).
- Accessible basics: button states, aria-pressed, titles and labels.

---

## Project structure (important files)
- src/main.tsx — React bootstrap (mounts App and imports styles).
- src/App.tsx — top-level wrapper that renders `<Game />`.
- src/components/Game.tsx — main component: game state, game flow, theme toggle, header/footer, and board layout.
- src/components/ChoiceButton.tsx — button component for each choice with selection & winner styling.
- src/components/Scoreboard.tsx — small scoreboard UI for wins/losses/draws.
- src/styles/styles.scss — SCSS with CSS variables, theme variables, responsive breakpoints, and toggle animation.
- index.html — app entry (root div + module script).

---

## Component details

### Game (src/components/Game.tsx)
- State:
  - `player: Choice | null` — current player choice
  - `computer: Choice | null` — computer choice
  - `result: Result` — 'win' | 'lose' | 'draw' | null
  - `score: { wins, losses, draws }` — accumulated scores
  - `isWaiting: boolean` — shows delay while computer "thinks"
  - `theme: 'dark' | 'light'` — theme persisted in localStorage
- Behavior:
  - When `player` is set, a 600ms timeout simulates the computer choosing a random option, then result is computed and score updated.
  - `toggleTheme()` flips theme, writes to localStorage, and toggles `body` classes `theme-light` / `theme-dark` so CSS custom properties adapt.
  - Renders header (title + scoreboard + theme toggle), choices, center area (hint/result/button), footer.

### ChoiceButton (src/components/ChoiceButton.tsx)
- Props include `choiceKey`, `label`, `emoji`, `onChoose`, and status flags.
- Computes `isWinner` using `showResult`, `result`, and `opponent`.
- Renders a button with classes:
  - `.choice` base
  - `.choice--<rock|paper|scissors>` per type
  - `.choice--selected` when player picked it
  - `.choice--winner` to highlight winning choice after result
- Accessible attributes: `aria-pressed` and `title`.

### Scoreboard (src/components/Scoreboard.tsx)
- Simple presentation of wins/losses/draws.
- Uses themed colors (via CSS variables) for each badge.

---

## Styling & Theming (src/styles/styles.scss)
- Uses CSS custom properties (variables) declared in `:root` with dark-theme defaults.
- Light theme overrides are applied when `body.theme-light` is present.
- Theme variables include `--text`, `--muted`, `--accent`, `--card`, and `--result-*` for result colors.
- The theme toggle is a CSS-only animated control:
  - `.theme-toggle` wrapper with `.toggle__knob` representing the knob.
  - `.is-dark` class moves knob to the right with a smooth transform.
  - Toggle is responsive (smaller on mobile).
- Responsive breakpoints:
  - At <=900px: layout turns single-column, paddings and sizes reduce.
  - At <=480px: choices wrap, button sizes shrink, font sizes reduced.
- Result colors (for header badges and in-game result) use `--result-win`, `--result-lose`, `--result-draw` and are overridden for the light theme to increase contrast.

---

## Accessibility notes
- Buttons use semantic `<button>` elements and `aria-pressed` to reflect toggle-like states.
- Theme toggle has `aria-pressed` and `aria-label`.
- Emojis are decorative and set with `aria-hidden` where appropriate, labels provide textual context.
- Keyboard navigation works by default for native buttons.

---

## Behavior and flow (quick)
1. Player clicks a choice — ChoiceButton `onChoose` triggers `Game.onChoose`.
2. Game sets `player`, clears previous `computer` & `result`, and sets `isWaiting`.
3. After 600ms, `computer` chosen at random, `decide(player, computer)` computes result.
4. `score` updated and `result` displayed; winning choice is highlighted via `choice--winner` class.
5. Player can click "Play again" to reset state.

---

## Where to change things (extension points)
- Change delay: modify the 600ms timeout in Game.tsx.
- Modify visuals:
  - Edit SCSS variables in `:root` / `body.theme-light` (colors, radii, shadows).
  - Update `.result` styles or `.choice--winner` highlight in styles.scss.
- Replace emoji with SVG icons: update CHOICES in Game.tsx and ChoiceButton to render SVG.
- Add sound effects: import audio and play on result update in the effect that handles result.
- Add best-of‑N: maintain extra state (rounds, currentRound) and compute match winner when rounds complete.
- Add animations: use CSS transitions or small libraries like Framer Motion for entrance/leave animations.

---

## Troubleshooting
- Blank page: ensure `index.html` includes `<div id="root"></div>` and `main.tsx` mounts App.
- SCSS not compiling: ensure `sass` devDependency is installed (`npm i -D sass`).
- Theme not persisting: check blocked cookies/localStorage or private mode.
- Type errors: ensure `tsconfig` references are intact and TypeScript version fits the template.

---

## Notes on code hygiene
- Components are small and focused — keep that pattern when adding features.
- Use TypeScript types for props and state to prevent regressions.
- Keep visual constants (colors, sizes) in SCSS variables so theme overrides are easy.

---

## Credits
- Built with React (TypeScript) and SCSS. UI inspiration: modern glassy card UI with CSS variables and a simple animated toggle.
- Implemented collaboratively with Copilot-style guidance.
