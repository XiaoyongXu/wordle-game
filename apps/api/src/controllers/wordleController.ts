import { LetterState, type IGuessResult, type GameStateResponse, type GameStatus } from '../models/types.js';

export class WordleGame {
  private readonly answer: string;
  private readonly isCheating: boolean;
  private readonly answerList: string[];
  private candidateWords: string[] = [];

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
   * @param maxGuesses The maximum number of rounds before game over.
   * @param isCheating If true, the game will not pick an answer and will actively try to make the game harder.
   */
  constructor(answerList: string[], maxGuesses: number = 6, isCheating: boolean = false) {
    // We store the list for potential validation
    this.answerList = answerList;
    this.maxGuesses = maxGuesses;
    this.isCheating = isCheating;
    this.allValidWords = answerList;

    if (this.isCheating) {
      this.candidateWords = [...answerList];
      this.answer = ''; // No answer is set in cheating mode initially
    } else {
      this.answer = this.selectRandomWord();
    }

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
      // Only include the answer if the game is over.
      // In cheating mode, the "answer" is one of the remaining candidates.
      answer: this.status !== 'playing'
        ? (this.isCheating && this.candidateWords.length > 0
            ? this.candidateWords[0]
            : this.answer)
        : undefined,
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

    guess = guess.toLowerCase(); // Game is case-insensitive

    if (guess.length !== this.wordLength) {
      throw new Error(`Guess must be ${this.wordLength} letters long.`);
    }

    // Add validation to check if `guess` is in a larger dictionary
    if (!this.allValidWords.includes(guess)) {
      throw new Error("Not a valid word.");
    }

    let result: IGuessResult;

    if (this.isCheating) {
      // 2. --- "Cheating" Scoring Logic ---
      const scoreGroups = new Map<string, string[]>();

      // Group all remaining candidates by the score they would produce.
      for (const candidate of this.candidateWords) {
        const score = this.calculateScore(guess, candidate);
        const scoreKey = score.join(','); // e.g., "hit,miss,present"

        if (!scoreGroups.has(scoreKey)) {
          scoreGroups.set(scoreKey, []);
        }
        scoreGroups.get(scoreKey)!.push(candidate);
      }

      // Find the group that is largest, to keep the most options open.
      let largestGroup: string[] = [];
      let bestScoreKey = '';

      for (const [scoreKey, group] of scoreGroups.entries()) {
        if (group.length > largestGroup.length) {
          largestGroup = group;
          bestScoreKey = scoreKey;
        }
      }
      // Update the candidate list to the chosen group.
      this.candidateWords = largestGroup;
      const finalScore = bestScoreKey.split(',') as LetterState[];
      result = { guess, score: finalScore };

    } else {
      // 2. --- Standard Scoring Logic ---
      const score = this.calculateScore(guess, this.answer);
      result = { guess, score };
    }

    this.guesses.push(result);
    this.currentGuess++;

    // 3. --- Check Win/Lose State ---
    let isWin = false;
    if (this.isCheating) {
      // A win in cheating mode is when the player's guess is the only word left.
      isWin = this.candidateWords.length === 1 && this.candidateWords[0] === guess;
    } else {
      // A win in normal mode is guessing the answer.
      isWin = guess === this.answer;
    }

    if (isWin) {
      this.status = 'win';
    } else if (this.currentGuess >= this.maxGuesses) {
      this.status = 'loss';
    }

    return result;
  }

  // Calculates the score for a guess against the answer.
  private calculateScore(guess: string, answer: string): LetterState[] {
    const score: LetterState[] = new Array(this.wordLength).fill('miss');
    const answerChars: (string | null)[] = answer.split('');
    const guessChars: (string | null)[] = guess.split('');

    // 1st Pass: Check for 'Hits' (Correct spot)
    for (let i = 0; i < this.wordLength; i++) {
      if (guessChars[i] === answerChars[i]) {
        score[i] = 'hit';
        answerChars[i] = null; // Mark as "used" for the present pass
        guessChars[i] = null;  // Mark as "used" so it's not checked again
      }
    }

    // 2nd Pass: Check for 'Presents'
    for (let i = 0; i < this.wordLength; i++) {
      if (guessChars[i] !== null) { // If it's not already a 'hit'
        const index = answerChars.indexOf(guessChars[i]);
        if (index !== -1) {
          score[i] = 'present';
          answerChars[index] = null; // Mark as "used"
        }
      }
    }

    return score;
  }
}