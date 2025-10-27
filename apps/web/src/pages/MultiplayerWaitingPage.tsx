interface MultiplayerWaitingPageProps {
  roomId: string | null;
}

export function MultiplayerWaitingPage({ roomId }: MultiplayerWaitingPageProps) {
  return (
    <main className="game-container pre-game-container">
      <h2>Room ID: {roomId}</h2>
      <p>Waiting for opponent to join and start the game...</p>
      <p>Share this ID with your friend!</p>
    </main>
  );
}