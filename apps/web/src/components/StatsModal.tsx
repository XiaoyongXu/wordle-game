import type { PlayerStats } from '../api-client';
import './StatsModal.css';

interface StatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export function StatsModal({ stats, onClose }: StatsModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.gamesPlayed}</div>
            <div className="stat-label">Played</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.winPercentage}</div>
            <div className="stat-label">Win %</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.maxStreak}</div>
            <div className="stat-label">Max Streak</div>
          </div>
        </div>
        <h3>Guess Distribution</h3>
        <div className="distribution-graph">
          {Object.entries(stats.guessDistribution).map(([guess, count]) => (
            guess !== 'fail' && (
              <div className="graph-row" key={guess}>
                <div className="graph-label">{guess}</div>
                <div className="graph-bar-container">
                  <div
                    className="graph-bar"
                    style={{ width: `${Math.max((count / (stats.gamesPlayed || 1)) * 100, 5)}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}