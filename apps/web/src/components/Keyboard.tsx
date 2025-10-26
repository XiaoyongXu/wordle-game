import type { LetterState } from '../api-client';
import './Keyboard.css';

const QWERTY_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

interface KeyboardProps {
  keyStates: { [key: string]: LetterState };
  onKeyPress: (key: string) => void;
}

export function Keyboard({ keyStates, onKeyPress }: KeyboardProps) {
  return (
    <div className="keyboard">
      {QWERTY_LAYOUT.map((row, i) => (
        <div className="keyboard-row" key={i}>
          {row.map((key) => {
            const state = keyStates[key.toLowerCase()] || '';
            const isSpecialKey = key === 'ENTER' || key === 'BACKSPACE';
            return (
              <button
                key={key}
                className={`key ${state} ${isSpecialKey ? 'special-key' : ''}`}
                onClick={() => onKeyPress(key)}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}