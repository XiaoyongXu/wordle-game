import type { PlayerStats, GuessDistribution } from './api-client';

const STATS_KEY = 'wordle-game-stats';

export function loadStats(): PlayerStats {
  const statsJson = localStorage.getItem(STATS_KEY);
  if (statsJson) {
    return JSON.parse(statsJson);
  }
  // Return default stats if none are found
  return {
    gamesPlayed: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, fail: 0 },
  };
}

export function saveStats(stats: PlayerStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateStats(currentStats: PlayerStats, didWin: boolean, guessCount: number): PlayerStats {
  const newStats = { ...currentStats };
  newStats.gamesPlayed += 1;

  if (didWin) {
    const wins = (newStats.gamesPlayed * (newStats.winPercentage / 100)) + 1;
    newStats.winPercentage = Math.round((wins / newStats.gamesPlayed) * 100);
    newStats.currentStreak += 1;
    newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
    newStats.guessDistribution[guessCount as keyof GuessDistribution] += 1;
  } else {
    const wins = newStats.gamesPlayed * (newStats.winPercentage / 100);
    newStats.winPercentage = Math.round((wins / newStats.gamesPlayed) * 100);
    newStats.currentStreak = 0;
    newStats.guessDistribution.fail += 1;
  }

  return newStats;
}