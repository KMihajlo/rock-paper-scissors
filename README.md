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
  - A duel animation runs (countdown + hands), then the computer reveals a random choice.
  - Result is computed (win / lose / draw).
  - Scoreboard tracks wins, losses, draws.
- Modern UI with SCSS and CSS custom properties (light/dark themes).
- Theme toggle with a modern animated knob; choice is persisted (localStorage).
- Responsive layout for desktop, tablet and mobile (buttons scale, layout switches to single column).
- Duel sequence (new):
  - 2s countdown: “3 → 2 → 1 → GO”.
  - Hands bob during countdown; the left hand shows the player’s chosen emoji; the right hand (computer) shuffles randomly.
  - After “GO”, both choices are shown as emojis with “Player” and “Computer” labels above them.
- Triple‑win celebration (new): after 3 consecutive wins, show a centered popup message for 4s (no confetti).
- Accessible basics: buttons, aria-pressed, aria-live for duel updates, titles and labels.

---

## What changed recently
- Added duel animation above the result:
  - Countdown (3-2-1-GO) with pop animation.
  - Player’s emoji stays fixed; only the computer’s emoji shuffles during countdown.
  - Labels “Player” and “Computer” appear where the countdown was, once choices are revealed.
- Tightened vertical spacing so the duel is visually centered relative to the result.
- Light theme result colors adjusted for stronger contrast.
- Added triple‑win popup overlay (4s) after 3 wins in a row.

---

## Project structure (important files)
- src/main.tsx — React bootstrap (mounts App and imports styles).
- src/App.tsx — top-level wrapper that renders `<Game />`.
- src/components/Game.tsx — main component: game state, duel animation, theme toggle, header/footer, scoreboard, and board layout.
- src/components/ChoiceButton.tsx — button component for each choice with selection & winner styling.
- src/components/Scoreboard.tsx — small scoreboard UI for wins/losses/draws.
- src/styles/styles.scss — SCSS with CSS variables, theme variables, duel/animation styles, and responsive breakpoints.
- index.html — app entry (root div + module script).

---

## Component details

### Game (src/components/Game.tsx)
- State (key pieces):
  - `player: Choice | null`, `computer: Choice | null`, `result: Result`
  - `score: { wins, losses, draws }`
  - `isWaiting: boolean` — duel/countdown in progress
  - Duel: `countdown: string | null` (“3”, “2”, “1”, “GO”)
  - Duel hands: `duelLeftEmoji`, `duelRightEmoji` (left = player’s emoji, right shuffles)
  - Theme: `'dark' | 'light'` (persisted)
  - Celebration: `showCelebration` + internal timers
- Behavior:
  - On player select: sets `player`, clears previous `computer`/`result`, starts a 2s duel.
  - Countdown: 4 steps at 500ms each (“3, 2, 1, GO”).
  - During countdown: left hand shows player’s emoji; right hand (computer) shuffles ~every 180ms.
  - At 2s: computer choice locked, result computed, score updated, countdown removed; labels appear above choices.
  - Consecutive wins tracked; celebrate on 3-in‑a‑row with a popup message for 4s.
  - Theme toggle writes to localStorage and toggles `body.theme-light`/`body.theme-dark`.
  - All timers/intervals are cleaned on reset and unmount.

### ChoiceButton (src/components/ChoiceButton.tsx)
- Props include `choiceKey`, `label`, `emoji`, `onChoose`, and status flags (`isSelected`, `showResult`, `result`, `opponent`).
- When result is known, highlights the winning choice via `choice--winner`.

### Scoreboard (src/components/Scoreboard.tsx)
- Displays wins/losses/draws with themed colors.

---

## Styling & Theming (src/styles/styles.scss)
- CSS custom properties set theme tokens; light theme overrides via `body.theme-light`.
- Result colors use `--result-win`, `--result-lose`, `--result-draw`, with stronger hues in light theme.
- Duel styles:
  - `.duel`, `.duel__block` (stack countdown/labels above hands/choices).
  - `.duel__countdown` (pop animation), `.duel__hands` (bobbing hands), `.duel__choices` (revealed emojis).
  - `.duel__labels` shows “Player” / “Computer” after reveal in the same spot used by the countdown.
  - `.duel__vs` pulses subtly; hands/emoji have drop shadows.
- Spacing:
  - `.center` gap reduced; `.duel` min-height tightened for balanced space above/below the result.
- Celebration overlay (no confetti):
  - `.celebration-overlay` with a subtle backdrop and `.celebration__message` pop animation.
- Responsive:
  - Tablet: single-column layout, reduced paddings/sizes.
  - Mobile: choices wrap, UI scales down; duel min-height and gaps reduced.

---

## Behavior and flow
1. Player clicks a choice → starts the duel (2s).
2. Countdown shows 3 → 2 → 1 → GO while the right (computer) emoji shuffles and hands bob.
3. On “GO”, both emojis are revealed; “Player” and “Computer” labels appear above them.
4. Result text appears below; “Play again” resets the round.
5. After 3 consecutive wins, a popup celebration banner shows for 4s.

---

## Tuning knobs (where to tweak)
- Countdown duration: `COUNTDOWN_INTERVAL_MS` and `COUNTDOWN_STEPS` (Game.tsx).
- Shuffle speed: the interval that updates the right-hand emoji (Game.tsx).
- Result colors: `--result-*` variables in `:root` and `body.theme-light`.
- Duel spacing: `.center` gap, `.duel` min-height in styles.scss.
- Celebration duration: the 4000ms timeout in `triggerCelebration()` (Game.tsx).

---

## Deployment
- GitHub Pages (simplest):
  - Ensure `gh-pages` is installed and scripts exist in `package.json`:
    - `"predeploy": "npm run build"`, `"deploy": "gh-pages -d dist"`
  - Run: `npm run deploy`
  - Visit: `https://<your-username>.github.io/<repo-name>/`
- For custom domains, set it in the repo’s Pages settings (adds a CNAME).

---

## Accessibility notes
- Buttons are native `<button>` elements with `aria-pressed`.
- Duel area uses `aria-live="polite"` to announce changes without being intrusive.
- Emojis are presentational; textual labels provide context.

---

## Troubleshooting
- No styles? Ensure `sass` is installed and `src/styles/styles.scss` is imported in `src/main.tsx`.
- Timer cleanup issues (e.g., stuck countdown): verify all intervals/timeouts are cleared in the `useEffect` cleanup and `resetRound()`.
- Theme not persisting: check localStorage access (private mode can block it).

---

## Credits
- Built with React (TypeScript) and SCSS. UI inspiration: modern glass/glassy card UI with CSS variables and a simple animated toggle.
- Implemented collaboratively with Copilot-style guidance.
