import { LetterState, type IGuessResult, type GameStateResponse, type GameStatus } from '../models/types.js';

export class WordleGame {
  private readonly answer: string;
  private readonly answerList: string[];

  // Configurable properties
  public readonly maxGuesses: number;
  public readonly wordLength: number = 5;

  // Game state
  private guesses: IGuessResult[] = [];
  private currentGuess: number = 0;
  private allValidWords: string[] = [];
  private status: GameStatus = 'playing';

  /**
   * Initializes a new Wordle game.
   * @param answerList The list of possible 5-letter answer words.
   * @param maxGuesses The maximum number of rounds before game over[cite: 36].
   */
  constructor(answerList: string[], maxGuesses: number = 6) {
    // We store the list for potential validation
    this.answerList = answerList;
    this.maxGuesses = maxGuesses;

    // Select a random answer
    this.answer = this.selectRandomWord();

    this.allValidWords = answerList;

  }

   // Selects a random word from the answer list.
  private selectRandomWord(): string {
    const index = Math.floor(Math.random() * this.answerList.length);
    return this.answerList[index];
  }

  // Returns the current game state.
  public getGameState(gameId: string): GameStateResponse & { id: string } {
    return {
      id: gameId,
      guesses: this.guesses.map(g => g.guess),
      results: this.guesses.map(g => g.score),
      status: this.status,
      // Only include the answer if the game is over
      answer: this.status !== 'playing' ? this.answer : undefined,
    };
  }

  /**
   * Submits a guess and updates the game state.
   * @param guess The 5-letter word to guess.
   * @returns An IGuessResult with the score, or throws an error.
   */
  public submitGuess(guess: string): IGuessResult {
    // 1. --- Validation ---
    if (this.status !== 'playing') {
      throw new Error("The game is already over.");
    }

    guess = guess.toLowerCase(); // Game is case-insensitive [cite: 28]

    if (guess.length !== this.wordLength) {
      throw new Error(`Guess must be ${this.wordLength} letters long.`);
    }

    // Add validation to check if `guess` is in a larger dictionary
    if (!this.allValidWords.includes(guess)) {
      throw new Error("Not a valid word.");
    }

    // 2. --- Scoring Logic ---
    const score = this.calculateScore(guess, this.answer);
    const result: IGuessResult = { guess, score };
    this.guesses.push(result);
    this.currentGuess++;

    // 3. --- Check Win/Lose State ---
    if (guess === this.answer) {
      this.status = 'win';
    } else if (this.currentGuess >= this.maxGuesses) {
      this.status = 'loss';
    }
    return result;
  }

  // Calculates the score for a guess against the answer.
  private calculateScore(guess: string, answer: string): LetterState[] {
    const score: LetterState[] = new Array(this.wordLength).fill(null);
      const answerChars: (string | null)[] = answer.split('');
    const guessChars: (string | null)[] = guess.split('');

    // 1st Pass: Check for 'Hits' (Correct spot)
    for (let i = 0; i < this.wordLength; i++) {
      if (guessChars[i] === answerChars[i]) {
        score[i] = 'hit';
        answerChars[i] = null; // Mark as "used"
        guessChars[i] = null;  // Mark as "used"
      }
    }

    // 2nd Pass: Check for 'Presents'
    for (let i = 0; i < this.wordLength; i++) {
      if (guessChars[i] !== null) { // If not already a 'Hit'
        const index = answerChars.indexOf(guessChars[i]);
        if (index !== -1) {
          score[i] = 'present';
          answerChars[index] = null; // Mark as "used"
        } else {
          // All remaining are 'Misses'
          score[i] = 'miss';
        }
      }
    }

    return score;
  }
}