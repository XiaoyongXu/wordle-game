import { useEffect } from 'react';

interface UseKeyboardInputOptions {
  isGameActive: boolean;
  onKeyPress: (key: string) => void;
}

/**
 * A custom hook to handle physical keyboard input for the game.
 * It attaches a 'keydown' event listener to the window.
 *
 * @param isGameActive - A boolean to determine if key presses should be processed.
 * @param onKeyPress - The callback function to execute with the pressed key.
 */
export function useKeyboardInput({ isGameActive, onKeyPress }: UseKeyboardInputOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameActive) return;

      const key = e.key.toUpperCase();
      if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && key >= 'A' && key <= 'Z')) {
        onKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameActive, onKeyPress]);
}