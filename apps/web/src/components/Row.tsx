import type { LetterState } from '../api-client';

interface RowProps {
  guess?: string;
  result?: LetterState[];
  wordLength: number;
}

export function Row({ guess = '', result = [], wordLength }: RowProps) {
  return (
    <div className="row">
      {Array.from({ length: wordLength }).map((_, i) => {

        const letter = guess[i] || '';
        const state = result[i] || (letter ? 'pending' : 'empty');
        return (
          <div key={i} className={`tile ${state}`}>
            {letter}
          </div>
        );
      })}
    </div>
  );
}