import type { GameStatus, LetterState } from '../api-client';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';

interface SinglePlayerGamePageProps {
  guesses: string[];
  results: LetterState[][];
  currentGuess: string;
  maxGuesses: number;
  wordLength: number;
  keyStates: { [key: string]: LetterState };
  onKeyPress: (key: string) => void;
  error: string | null;
  status: GameStatus | 'loading' | null;
  answer: string | null;
  onBackToMenu: () => void;
}

export function SinglePlayerGamePage({ guesses, results, currentGuess, maxGuesses, wordLength, keyStates, onKeyPress, error, status, answer, onBackToMenu }: SinglePlayerGamePageProps) {
  return (
    <main className="game-container">
      <div className="instructions">
        <p>Guess the 5-letter word in 6 tries.</p>
        <p>
          Tile colors show how close your guess was: <b>Hit (green)</b>,{' '}
          <b>Present (yellow)</b>, <b>Miss (gray)</b>.
        </p>
      </div>
      <Board
        guesses={guesses}
        results={results}
        currentGuess={currentGuess}
        maxGuesses={maxGuesses}
        wordLength={wordLength}
      />
      <Keyboard keyStates={keyStates} onKeyPress={onKeyPress} />
      {error && <div className="error-message">{error}</div>}
      {status === 'win' && (
        <div className="game-over-message">You won!</div>
      )}
      {status === 'loss' && (
        <div className="game-over-message">
          You lost! The word was: {answer?.toUpperCase()}
        </div>
      )}
      {(status === 'win' || status === 'loss') && (
        <button onClick={onBackToMenu}>Back to Menu</button>
      )}
    </main>
  );
}