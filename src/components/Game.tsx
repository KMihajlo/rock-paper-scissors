import { useState, useEffect, useRef } from 'react';
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

  // countdown / duel animation (2s total: 3-2-1-GO at 500ms steps)
  const COUNTDOWN_STEPS = ['3', '2', '1', 'GO'];
  const COUNTDOWN_INTERVAL_MS = 500; // 4 steps * 500ms = 2000ms
  const ANIMATION_DURATION_MS = COUNTDOWN_STEPS.length * COUNTDOWN_INTERVAL_MS;
  const [countdown, setCountdown] = useState<string | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // NEW: duel hands that shuffle while counting down
  const [duelLeftEmoji, setDuelLeftEmoji] = useState<string>('✊');
  const [duelRightEmoji, setDuelRightEmoji] = useState<string>('✊');
  const duelShuffleIntervalRef = useRef<number | null>(null);

  // consecutive wins + celebration state (no confetti pieces)
  const [, setConsecutiveWins] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const celebrationTimerRef = useRef<number | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);

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

  // NEW helper to map a choice to its emoji
  const emojiForChoice = (k: Choice) => CHOICES.find((c) => c.key === k)?.emoji ?? '✊';

  useEffect(() => {
    if (player == null) return;

    setIsWaiting(true);

    // clear prior timers
    if (resultTimeoutRef.current) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (duelShuffleIntervalRef.current) {
      window.clearInterval(duelShuffleIntervalRef.current);
      duelShuffleIntervalRef.current = null;
    }

    // start duel: left = player's actual choice, right = random and shuffles
    const randEmoji = () => CHOICES[Math.floor(Math.random() * CHOICES.length)].emoji;
    setDuelLeftEmoji(emojiForChoice(player));
    setDuelRightEmoji(randEmoji());

    // shuffle only the RIGHT (computer) emoji every ~180ms
    duelShuffleIntervalRef.current = window.setInterval(() => {
      setDuelRightEmoji(randEmoji());
    }, 180);

    // start countdown (3-2-1-GO)
    let idx = 0;
    setCountdown(COUNTDOWN_STEPS[0]);
    countdownIntervalRef.current = window.setInterval(() => {
      idx++;
      if (idx < COUNTDOWN_STEPS.length) {
        setCountdown(COUNTDOWN_STEPS[idx]);
      } else {
        // stop interval once GO has been displayed
        if (countdownIntervalRef.current) {
          window.clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, COUNTDOWN_INTERVAL_MS);

    // conclude after 2s: pick computer, compute result, clear countdown and stop shuffling
    resultTimeoutRef.current = window.setTimeout(() => {
      const comp = getRandomChoice();
      setComputer(comp);
      const r = player ? decide(player, comp) : null;
      setResult(r);
      if (r) {
        setScore((s) => ({
          wins: s.wins + (r === 'win' ? 1 : 0),
          losses: s.losses + (r === 'lose' ? 1 : 0),
          draws: s.draws + (r === 'draw' ? 1 : 0),
        }));
      }
      setCountdown(null);
      if (duelShuffleIntervalRef.current) {
        window.clearInterval(duelShuffleIntervalRef.current);
        duelShuffleIntervalRef.current = null;
      }
      setIsWaiting(false);
    }, ANIMATION_DURATION_MS);

    return () => {
      if (resultTimeoutRef.current) {
        window.clearTimeout(resultTimeoutRef.current);
        resultTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (duelShuffleIntervalRef.current) {
        window.clearInterval(duelShuffleIntervalRef.current);
        duelShuffleIntervalRef.current = null;
      }
    };
  }, [player]);

  // react to result changes to update consecutiveWins and trigger celebration
  useEffect(() => {
    if (result === 'win') {
      setConsecutiveWins((c) => {
        const next = c + 1;
        // trigger celebration at 3 wins in a row
        if (next >= 3) {
          triggerCelebration();
          return 0; // reset after triggering
        }
        return next;
      });
    } else if (result === 'lose' || result === 'draw') {
      setConsecutiveWins(0);
    }
    // nothing to do for null
  }, [result]);

  function triggerCelebration() {
    // show only the popup message (no confetti)
    setShowCelebration(true);

    // clear any existing celebration timer
    if (celebrationTimerRef.current) {
      window.clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = null;
    }
    // hide celebration after 4s
    celebrationTimerRef.current = window.setTimeout(() => {
      setShowCelebration(false);
      celebrationTimerRef.current = null;
    }, 4000);
  }

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) window.clearTimeout(celebrationTimerRef.current);
      if (resultTimeoutRef.current) window.clearTimeout(resultTimeoutRef.current);
      if (countdownIntervalRef.current) window.clearInterval(countdownIntervalRef.current);
      if (duelShuffleIntervalRef.current) window.clearInterval(duelShuffleIntervalRef.current);
    };
  }, []);

  function onChoose(choice: Choice) {
    if (isWaiting) return;
    setPlayer(choice);
    setComputer(null);
    setResult(null);
  }

  function resetRound() {
    // clear timers and states
    if (resultTimeoutRef.current) {
      window.clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (duelShuffleIntervalRef.current) {
      window.clearInterval(duelShuffleIntervalRef.current);
      duelShuffleIntervalRef.current = null;
    }
    setCountdown(null);
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
        <div className="brand">
          <img
            className="brand__logo"
            src={
              theme === 'dark'
                  ? `${import.meta.env.BASE_URL}rps-favicon-light.svg`
                  : `${import.meta.env.BASE_URL}rps-favicon.svg`
            }
            alt=""
            aria-hidden="true"
            width={26}
            height={26}
          />
          <h1>Rock · Paper · Scissors</h1>
        </div>

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
          {player && (
            <div className="duel" aria-live="polite">
              <div className="duel__block">
                {isWaiting ? (
                  <div className="duel__countdown">{countdown}</div>
                ) : (
                  computer && (
                    <div className="duel__labels">
                      <span className="duel__label duel__label--left">Player</span>
                      <span className="duel__label duel__label--right">Computer</span>
                    </div>
                  )
                )}

                {isWaiting ? (
                  <div className="duel__hands">
                    <div className="hand hand--left hand--animating">{duelLeftEmoji}</div>
                    <div className="duel__vs">VS</div>
                    <div className="hand hand--right hand--animating">{duelRightEmoji}</div>
                  </div>
                ) : (
                  computer && (
                    <div className="duel__choices">
                      <span className="duel__emoji duel__emoji--player" title="You">
                        {CHOICES.find((c) => c.key === player)?.emoji}
                      </span>
                      <span className="duel__vs">VS</span>
                      <span className="duel__emoji duel__emoji--computer" title="Computer">
                        {CHOICES.find((c) => c.key === computer)?.emoji}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

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

      {/* Celebration overlay (popup only) */}
      {showCelebration && (
        <div className="celebration-overlay" role="status" aria-live="polite">
          <div className="celebration__message">
            <strong>Triple Win! 🎉</strong>
            <div className="celebration__subtitle">Three wins in a row — nice run!</div>
          </div>
        </div>
      )}

      <footer className="game__footer">
        <small>Built with React (TypeScript) + SCSS + Copilot</small>
        <br/>
        <small>made by: Mihajlo Kragujevski</small>
      </footer>
    </div>
  );
}
