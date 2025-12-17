import { useState, useEffect } from 'react';
import ChoiceButton from './ChoiceButton';
import Scoreboard from './Scoreboard';

type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'draw' | null;

const CHOICES: { key: Choice; label: string; emoji: string }[] = [
  { key: 'rock', label: 'Rock', emoji: '✊' },
  { key: 'paper', label: 'Paper', emoji: '✋' },
  { key: 'scissors', label: 'Scissors', emoji: '✌️' },
];

function getRandomChoice(): Choice {
  const i = Math.floor(Math.random() * 3);
  return CHOICES[i].key;
}

function decide(p: Choice, c: Choice): Result {
  if (p === c) return 'draw';
  if (
    (p === 'rock' && c === 'scissors') ||
    (p === 'paper' && c === 'rock') ||
    (p === 'scissors' && c === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
}

export default function Game() {
  const [player, setPlayer] = useState<Choice | null>(null);
  const [computer, setComputer] = useState<Choice | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [isWaiting, setIsWaiting] = useState(false);

  // Theme: 'dark' | 'light' with localStorage + prefers-color-scheme fallback
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('rps-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light');
    document.body.classList.toggle('theme-dark', theme === 'dark');
    try {
      localStorage.setItem('rps-theme', theme);
    } catch (e) {}
  }, [theme]);

  useEffect(() => {
    if (player == null) return;
    setIsWaiting(true);
    const t = setTimeout(() => {
      const comp = getRandomChoice();
      setComputer(comp);
      const r = decide(player, comp);
      setResult(r);
      setScore((s) => ({
        wins: s.wins + (r === 'win' ? 1 : 0),
        losses: s.losses + (r === 'lose' ? 1 : 0),
        draws: s.draws + (r === 'draw' ? 1 : 0),
      }));
      setIsWaiting(false);
    }, 600);
    return () => clearTimeout(t);
  }, [player]);

  function onChoose(choice: Choice) {
    if (isWaiting) return;
    setPlayer(choice);
    setComputer(null);
    setResult(null);
  }

  function resetRound() {
    setPlayer(null);
    setComputer(null);
    setResult(null);
    setIsWaiting(false);
  }

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className="game">
      <header className="game__header">
        <h1>Rock · Paper · Scissors</h1>

        <div className="tools">
          <Scoreboard wins={score.wins} losses={score.losses} draws={score.draws} />

          <button
            className={`theme-toggle ${theme === 'dark' ? 'is-dark' : 'is-light'}`}
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label="Toggle light and dark theme"
            title="Toggle theme"
          >
            <span className="icon icon--sun" aria-hidden>☀️</span>
            <span className="icon icon--moon" aria-hidden>🌙</span>
            <span className="toggle__knob" />
          </button>
        </div>
      </header>

      <main className="game__board">
        <div className="choices">
          {CHOICES.map((c) => (
            <ChoiceButton
              key={c.key}
              choiceKey={c.key}
              label={c.label}
              emoji={c.emoji}
              onChoose={() => onChoose(c.key)}
              disabled={!!player}
              isSelected={player === c.key}
              showResult={!!result}
              result={result}
              opponent={computer ?? undefined}
            />
          ))}
        </div>

        <div className="center">
          {isWaiting && <div className="hint">Computer is choosing...</div>}
          {!isWaiting && result && (
            <>
              <div className={`result result--${result}`}>
                {result === 'win' && 'You Win 🎉'}
                {result === 'lose' && 'You Lose 💔'}
                {result === 'draw' && "It's a Draw 🤝"}
              </div>
              <button className="btn" onClick={resetRound}>
                Play again
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="game__footer">
        <small>Built with React + TypeScript + Copilot</small>
        <br/>
        <small>made by: Mihajlo Kragujevski</small>
      </footer>
    </div>
  );
}
