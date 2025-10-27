interface MultiplayerMenuPageProps {
  mpWord: string;
  setMpWord: (word: string) => void;
  isJoiningRoom: boolean;
  setIsJoiningRoom: (isJoining: boolean) => void;
  roomIdInput: string;
  setRoomIdInput: (roomId: string) => void;
  handleJoinRoom: () => void;
  handleCreateRoom: () => void;
  error: string | null;
  onBackToMenu: () => void;
}

export function MultiplayerMenuPage({ mpWord, setMpWord, isJoiningRoom, setIsJoiningRoom, roomIdInput, setRoomIdInput, handleJoinRoom, handleCreateRoom, error, onBackToMenu }: MultiplayerMenuPageProps) {
  return (
    <main className="game-container pre-game-container">
      <div className="mp-section" style={{ textAlign: 'left' }}>
        <h2>Multiplayer Game</h2>
        <p>
          Enter a 5-letter word for your opponent to guess. (Leave blank for
          a random word)
        </p>
        <input
          type="text"
          placeholder="Your Word"
          maxLength={5}
          value={mpWord}
          onChange={(e) => setMpWord(e.target.value)}
          style={{ textTransform: 'uppercase' }}
        />
        <label>
          <input
            type="checkbox"
            checked={isJoiningRoom}
            onChange={(e) => setIsJoiningRoom(e.target.checked)}
          />
          Join an existing room
        </label>
        {isJoiningRoom && (
          <input type="text" placeholder="Room ID" value={roomIdInput} onChange={(e) => setRoomIdInput(e.target.value)} />
        )}
        <button onClick={isJoiningRoom ? handleJoinRoom : handleCreateRoom}>
          {isJoiningRoom ? 'Join Room' : 'Create Room'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={onBackToMenu}>Back to Menu</button>
    </main>
  );
}