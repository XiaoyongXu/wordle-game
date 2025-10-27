import type { MultiplayerGameState } from '../api-client';

/**
 * Calculates the display string for the result of a finished multiplayer match.
 * @param mpGameState - The state of the multiplayer game.
 * @param playerId - The ID of the current player.
 * @returns A string describing the match outcome, or null if the match is not finished.
 */
export function getMatchResult(
  mpGameState: MultiplayerGameState | null,
  playerId: string | null
): string | null {
  if (!mpGameState || mpGameState.status !== 'finished' || !playerId) {
    return null;
  }

  const myPlayer = mpGameState.players.find((p) => p.id === playerId);
  const opponentPlayer = mpGameState.players.find((p) => p.id !== playerId);

  if (!myPlayer || !opponentPlayer) return 'Game Over';

  const iWon = myPlayer.status === 'win';
  const opponentWon = opponentPlayer.status === 'win';

  // Scenario 1: Tie Conditions
  if (
    (iWon &&
      opponentWon &&
      myPlayer.guesses.length === opponentPlayer.guesses.length) ||
    (!iWon && !opponentWon)
  ) {
    return "It's a Tie!";
  }

  // Scenario 2: Clear Win/Loss
  if (iWon && !opponentWon) return 'You Win!';
  if (!iWon && opponentWon) return `You Lose! The word was: ${myPlayer.answer?.toUpperCase()}`;

  // Scenario 3: Both won, but in different rounds
  if (iWon && opponentWon) return myPlayer.guesses.length < opponentPlayer.guesses.length ? 'You Win!' : 'You Lose!';

  return 'Game Over'; // Fallback
}