import { useState, useEffect } from 'react';
import './App.css';
import { Board } from './components/Board';
import { startNewGame, submitGuess } from './api-client.ts';
import type { LetterState, GameStatus } from './api-client.ts';

function App() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<GameStatus | 'loading'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  // Configurable game settings, fetched from server
  const [wordLength, setWordLength] = useState(5);
  const [maxGuesses, setMaxGuesses] = useState(6);

  const handleNewGame = async () => {
    setStatus('loading');
    setError(null);
    setGuesses([]);
    setResults([]);
    setCurrentGuess('');
    setAnswer(null);
    try {
      const newGame = await startNewGame();
      setGameId(newGame.gameId);
      setWordLength(newGame.wordLength);
      setMaxGuesses(newGame.maxGuesses);
      setStatus('playing');
    } catch (err) {
      setError('Failed to start a new game. Please try again.');
    }
  };

  useEffect(() => {
    handleNewGame();
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
  }, [currentGuess, status]);
  return (
    <div className="app-container">
      <header>
        <h1>Wordle</h1>
      </header>
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
        {status === 'loss' && <div className="game-over-message">You lost! The word was: {answer}</div>}
        {(status === 'win' || status === 'loss') && <button onClick={handleNewGame}>New Game</button>}
      </main>
    </div>
  );
}

export default App;
