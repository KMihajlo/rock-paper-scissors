type Props = {
  choiceKey: 'rock' | 'paper' | 'scissors';
  label: string;
  emoji: string;
  onChoose: () => void;
  disabled?: boolean;
  isSelected?: boolean;
  showResult?: boolean;
  result?: 'win' | 'lose' | 'draw' | null;
  opponent?: 'rock' | 'paper' | 'scissors';
};

export default function ChoiceButton({
  choiceKey,
  label,
  emoji,
  onChoose,
  disabled,
  isSelected,
  showResult,
  result,
  opponent,
}: Props) {
  const isWinner =
    showResult &&
    result &&
    ((result === 'win' && isSelected) || (result === 'lose' && opponent === choiceKey) || result === 'draw');

  return (
    <button
      className={[
        'choice',
        `choice--${choiceKey}`,
        isSelected ? 'choice--selected' : '',
        isWinner ? 'choice--winner' : '',
      ].join(' ')}
      onClick={onChoose}
      disabled={disabled}
      aria-pressed={!!isSelected}
      title={label}
    >
      <span className="choice__emoji" aria-hidden>
        {emoji}
      </span>
      <span className="choice__label">{label}</span>
    </button>
  );
}

