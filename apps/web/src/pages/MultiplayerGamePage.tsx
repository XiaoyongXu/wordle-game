import type { LetterState, MultiplayerGameState, PlayerState } from '../api-client';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { getMatchResult } from '../utils/gameUtils';

interface MultiplayerGamePageProps {
  mpGameState: MultiplayerGameState;
  error: string | null;
  sortedPlayers: PlayerState[] | undefined;
  playerId: string | null;
  currentGuess: string;
  maxGuesses: number;
  wordLength: number;
  keyStates: { [key: string]: LetterState };
  onKeyPress: (key: string) => void;
  onBackToMenu: () => void;
}

export function MultiplayerGamePage({ mpGameState, error, sortedPlayers, playerId, currentGuess, maxGuesses, wordLength, keyStates, onKeyPress, onBackToMenu }: MultiplayerGamePageProps) {
  return (
    <div>
      {/* Display error messages for multiplayer mode */}
      {error && (
        <div className="error-message" style={{ textAlign: 'center' }}>
          {error}
        </div>
      )}
      <div className="instructions">
        {mpGameState.gameType === 'race' ? (
          <>
            <p>
              <b>Race Mode:</b> You and your opponent are guessing the same
              word. The first player to find it wins!
            </p>
            <p>
              <b>Tie:</b> A tie occurs if you both run out of guesses.
            </p>
          </>
        ) : (
          <>
            <p>
              <b>Head-to-Head:</b> You are guessing your opponent's word.
              The player who uses fewer guesses wins.
            </p>
            <p>
              <b>Tie:</b> A tie occurs if you both solve it in the same
              number of rounds, or if you both fail.
            </p>
          </>
        )}
      </div>
      <div className="multiplayer-boards-container">
        {sortedPlayers?.map((player) => (
          <main className="game-container" key={player.id}>
            <h2>
              {player.id === playerId ? 'Your Board' : "Opponent's Board"}
            </h2>
            <Board
              guesses={player.guesses}
              results={player.results}
              // Only show the current typed guess on your own board
              currentGuess={player.id === playerId ? currentGuess : ''}
              maxGuesses={maxGuesses}
              wordLength={wordLength}
            />
          </main>
        ))}
      </div>
      <Keyboard keyStates={keyStates} onKeyPress={onKeyPress} />
      {mpGameState.status === 'finished' && (
        <div className="game-over-message">
          {getMatchResult(mpGameState, playerId)}
          <div>
            <button onClick={onBackToMenu}>Back to Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}