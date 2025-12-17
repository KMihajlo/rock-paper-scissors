export default function Scoreboard({ wins, losses, draws }: { wins: number; losses: number; draws: number }) {
  return (
    <div className="scoreboard">
      <div className="scoreboard__item scoreboard__wins">Wins: {wins}</div>
      <div className="scoreboard__item scoreboard__losses">Losses: {losses}</div>
      <div className="scoreboard__item scoreboard__draws">Draws: {draws}</div>
    </div>
  );
}

