import type { GameStatus } from '../api-client';

interface MenuPageProps {
  status: GameStatus | 'loading' | null;
  error: string | null;
  onNewGame: (isCheating: boolean) => void;
  onGoToMultiplayerMenu: () => void;
}

export function MenuPage({ status, error, onNewGame, onGoToMultiplayerMenu }: MenuPageProps) {
  return (
    <main className="game-container pre-game-container">
      <p>Select a mode to start!</p>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : (
        <div className="button-group">
          <button onClick={() => onNewGame(false)}>
            Normal Wordle
          </button>
          <button onClick={() => onNewGame(true)}>
            Cheating Wordle
          </button>
          <button onClick={onGoToMultiplayerMenu}>
            Multiplayer
          </button>
        </div>
      )}
      <footer
        style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#888' }}
      >
        <p>
          Word list sourced from:
          https://darkermango.github.io/5-Letter-words/words.json
        </p>
      </footer>
      {error && <div className="error-message">{error}</div>}
    </main>
  );
}