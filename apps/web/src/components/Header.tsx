import type { GameMode } from '../state';

interface HeaderProps {
  gameMode: GameMode;
  onOpenStats: () => void;
}

function getTitle(gameMode: GameMode): string {
  switch (gameMode) {
    case 'cheating':
      return 'Cheating Wordle';
    case 'multiplayer':
      return 'Multiplayer';
    default:
      return 'Wordle'; // Covers 'normal' and null
  }
}

export function Header({ gameMode, onOpenStats }: HeaderProps) {
  return (
    <header>
      <h1>{getTitle(gameMode)}</h1>
      <button className="stats-button" onClick={onOpenStats}>
        📊
      </button>
    </header>
  );
}