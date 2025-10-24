import { Row } from './Row';
import type { LetterState } from '../api-client';

interface BoardProps {
  guesses: string[];
  results: LetterState[][];
  currentGuess: string;
  maxGuesses: number;
  wordLength: number;
}

export function Board({
  guesses,
  results,
  currentGuess,
  maxGuesses,
  wordLength,
}: BoardProps) {
  const remainingGuesses = maxGuesses - guesses.length - 1;

  return (
    <div className="board">
      {guesses.map((guess, i) => (
        <Row key={i} guess={guess} result={results[i]} wordLength={wordLength} />
      ))}
      {guesses.length < maxGuesses && <Row guess={currentGuess} wordLength={wordLength} />}
      {Array.from({ length: remainingGuesses }).map((_, i) => (
        <Row key={i} wordLength={wordLength} />
      ))}
    </div>
  );
}