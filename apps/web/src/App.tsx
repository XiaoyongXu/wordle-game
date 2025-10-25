import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Board } from './components/Board';
import { startNewGame, submitGuess } from './api-client.ts';
import type { LetterState, GameStatus } from './api-client.ts';

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<GameStatus | 'loading' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'normal' | 'cheating' | null>(null);

  // Configurable game settings, fetched from server
  const [wordLength, setWordLength] = useState(5);
  const [maxGuesses, setMaxGuesses] = useState(6);

  const handleNewGame = useCallback(async (isCheating: boolean) => {
    setStatus('loading');
    setError(null);
    setGuesses([]);
    setResults([]);
    setCurrentGuess('');
    setAnswer(null);
    setGameMode(isCheating ? 'cheating' : 'normal');
    try {
      const newGame = await startNewGame(isCheating);
      setGameId(newGame.gameId);
      setWordLength(newGame.wordLength);
      setMaxGuesses(newGame.maxGuesses);
      setStatus('playing');
    } catch (err) {
      setError('Failed to start a new game. Please try again.');
      // Reset gameMode if the API call fails
      setGameMode(null);
    }
  }, []);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (status !== 'playing') return;

    if (e.key === 'Enter') {
      if (currentGuess.length === wordLength) {
        handleGuessSubmit();
      }
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (
      currentGuess.length < wordLength &&
      /^[a-zA-Z]$/.test(e.key)
    ) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    }
  };

  const handleGuessSubmit = async () => {
    if (!gameId) return;
    const response = await submitGuess(gameId, currentGuess);
    // This "in" check is a type guard. It tells TypeScript that if 'message'
    // exists, 'response' is of type 'ErrorResponse'.
    if ('message' in response) {
      setError(response.message);
      return;
    }

    // If the above check fails, TypeScript now knows 'response' is a 'GameStateResponse'.
    setError(null);
    setGuesses(response.guesses);
    setResults(response.results);
    setStatus(response.status);
    setCurrentGuess('');
    setAnswer(response.answer ?? null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
  return (
    <div className="app-container">
      <header>
        <h1>{gameMode === 'cheating' ? 'Cheating Wordle' : 'Wordle'}</h1>
      </header>
      {gameId ? (
        <main className="game-container">
          <Board
            guesses={guesses}
            results={results}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />
          {error && <div className="error-message">{error}</div>}
          {status === 'win' && <div className="game-over-message">You won!</div>}
          {status === 'loss' && <div className="game-over-message">You lost! The word was: {answer?.toUpperCase()}</div>}
          {(status === 'win' || status === 'loss') &&
            <button onClick={() => {
              setGameId(null);
              setGameMode(null);
            }}>Play Again</button>
          }
        </main>
      ) : (
        <main className="game-container pre-game-container">
          <p>Select a mode to start!</p>
          {status === 'loading' ? (
            <p>Loading...</p>
          ) : (
            <div className="button-group">
              <button onClick={() => handleNewGame(false)}>Normal Wordle</button>
              <button onClick={() => handleNewGame(true)}>Cheating Wordle</button>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </main>
      )}
    </div>
  );
}

export default App;
