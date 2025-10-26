import { useState, useEffect, useCallback, useMemo } from "react";
import "./App.css";
import { Board } from "./components/Board";
import {
  startNewGame,
  submitGuess,
  createMultiplayerGame,
  joinMultiplayerGame,
} from "./api-client.ts";
import type {
  LetterState,
  GameStatus,
  MultiplayerGameState,
  PlayerStats,
} from "./api-client.ts";
import { loadStats, saveStats, updateStats } from "./statsService";
import { StatsModal } from "./components/StatsModal";
import { Keyboard } from "./components/Keyboard.tsx";

function App() {
  // 'menu' | 'sp-game' | 'mp-menu' | 'mp-waiting' | 'mp-game'
  const [view, setView] = useState("menu");
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterState[][]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus | "loading" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<
    "normal" | "cheating" | "multiplayer" | null
  >(null);

  // State for multiplayer
  const [roomId, setRoomId] = useState<string | null>(null);
  const [mpWord, setMpWord] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomIdInput, setRoomIdInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [mpGameState, setMpGameState] = useState<MultiplayerGameState | null>(
    null
  );
  const [stats, setStats] = useState<PlayerStats>(loadStats());
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Configurable game settings, fetched from server
  const [wordLength, setWordLength] = useState(5);
  const [maxGuesses, setMaxGuesses] = useState(6);

  const handleNewGame = useCallback(async (isCheating: boolean) => {
    setStatus("loading");
    setError(null);
    setGuesses([]);
    setResults([]);
    setCurrentGuess("");
    setAnswer(null);
    setGameMode(isCheating ? "cheating" : "normal");
    try {
      const newGame = await startNewGame(isCheating);
      setGameId(newGame.gameId);
      setWordLength(newGame.wordLength);
      setMaxGuesses(newGame.maxGuesses);
      setView("sp-game");
      setStatus("playing");
    } catch (err) {
      setError("Failed to start a new game. Please try again.");
      // Reset gameMode if the API call fails
      setGameMode(null);
    }
  }, []);

  const handleCreateRoom = async () => {
    setError(null);
    try {
      const { roomId } = await createMultiplayerGame(mpWord.toLowerCase());
      setRoomId(roomId);
      setView("mp-waiting");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleJoinRoom = async () => {
    setError(null);
    if (!roomIdInput) return;
    try {
      // First, validate the room via HTTP
      await joinMultiplayerGame(roomIdInput, mpWord.toLowerCase());
      // If successful, set the real roomId to trigger the WebSocket connection
      setRoomId(roomIdInput);
      setView("mp-waiting");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleVirtualKeyPress = (key: string) => {
    // Determine if the game is active, for either mode.
    const isSpPlaying = view === "sp-game" && status === "playing";
    const myMpPlayer = mpGameState?.players.find((p) => p.id === playerId);
    const isMpPlaying = view === "mp-game" && myMpPlayer?.status === "playing";

    if (!isSpPlaying && !isMpPlaying) {
      return;
    }

    if (key === "ENTER") {
      if (currentGuess.length === wordLength) {
        if (isSpPlaying) {
          handleGuessSubmit();
        } else if (isMpPlaying) {
          // In multiplayer, send the guess over the WebSocket
          if (socket) {
            socket.send(
              JSON.stringify({
                type: "guess",
                payload: { guess: currentGuess.toLowerCase() },
              })
            );
            setCurrentGuess(""); // Clear guess immediately
          }
        }
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < wordLength && /^[a-zA-Z]$/.test(key)) {
      setCurrentGuess(currentGuess + key.toUpperCase());
      setError(null); // Clear error on new input
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    // Remap physical keyboard events to virtual key presses
    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || (key.length === 1 && key >= 'A' && key <= 'Z')) {
      handleVirtualKeyPress(key);
    }
  };

  const handleGuessSubmit = async () => {
    if (!gameId) return;
    const response = await submitGuess(gameId, currentGuess);
    // This "in" check is a type guard. It tells TypeScript that if 'message'
    // exists, 'response' is of type 'ErrorResponse'.
    if ("message" in response) {
      setError(response.message);
      return;
    }

    // If the above check fails, TypeScript now knows 'response' is a 'GameStateResponse'.
    setError(null);
    setGuesses(response.guesses);
    setResults(response.results);
    setStatus(response.status);
    setCurrentGuess("");
    setAnswer(response.answer ?? null);
  };

  // Effect to update stats when a single-player game ends
  useEffect(() => {
    if (view === 'sp-game' && (status === 'win' || status === 'loss')) {
      const newStats = updateStats(stats, status === 'win', guesses.length);
      setStats(newStats);
      saveStats(newStats);
      // Show stats modal after a short delay
      setTimeout(() => setIsStatsModalOpen(true), 1500);
    }
  }, [status, view]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleVirtualKeyPress, status, view, mpGameState]);

  useEffect(() => {
    // This effect manages the WebSocket connection
    // It should only depend on the roomId, not the view.
    if (!roomId) {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      return; // No room, no socket.
    }

    // Connect to the WebSocket server
    const ws = new WebSocket(`ws://localhost:3001?roomId=${roomId}`);
    setSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "connected") {
        setPlayerId(message.playerId);
      }

      if (message.type === "game-update") {
        setMpGameState(message.payload);
        // No need to change view, we are already in 'mp-game'
      }

      if (message.type === "game-start") {
        setMpGameState(message.payload);
        setView("mp-game");
      } else if (message.type === "error") {
        setError(message.message);
      }
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, [roomId]);

  // Sort players to ensure "Your Board" is always first.
  const sortedPlayers = mpGameState?.players.slice().sort((a, b) => {
    if (a.id === playerId) return -1;
    if (b.id === playerId) return 1;
    return 0;
  });

  const keyStates = useMemo(() => {
    const states: { [key: string]: LetterState } = {};
    const allResults = view === 'sp-game' ? results : (mpGameState?.players.find(p => p.id === playerId)?.results || []);
    const allGuesses = view === 'sp-game' ? guesses : (mpGameState?.players.find(p => p.id === playerId)?.guesses || []);

    for (let i = 0; i < allResults.length; i++) {
      for (let j = 0; j < allResults[i].length; j++) {
        const char = allGuesses[i][j];
        const result = allResults[i][j];

        // Green ('hit') is the highest priority
        if (states[char] === 'hit') continue;
        // Yellow ('present') is the next highest
        if (states[char] === 'present' && result !== 'hit') continue;

        states[char] = result;
      }
    }

    return states;
  }, [results, mpGameState, playerId, view, guesses]);

  const getMatchResult = () => {
    if (!mpGameState || mpGameState.status !== "finished" || !playerId) {
      return null;
    }

    const myPlayer = mpGameState.players.find((p) => p.id === playerId);
    const opponentPlayer = mpGameState.players.find((p) => p.id !== playerId);

    if (!myPlayer || !opponentPlayer) return "Game Over";

    const iWon = myPlayer.status === "win";
    const opponentWon = opponentPlayer.status === "win";

    // Scenario 1: Tie Conditions
    if (
      (iWon &&
        opponentWon &&
        myPlayer.guesses.length === opponentPlayer.guesses.length) ||
      (!iWon && !opponentWon)
    ) {
      return "It's a Tie!";
    }

    // Scenario 2: Win/Loss Conditions
    if (iWon && !opponentWon) {
      return "You Win!";
    }
    if (!iWon && opponentWon) {
      return `You Lose! The word was: ${myPlayer.answer?.toUpperCase()}`;
    }

    // Scenario 3: Both won, but in different rounds
    if (iWon && opponentWon) {
      return myPlayer.guesses.length < opponentPlayer.guesses.length
        ? "You Win!"
        : "You Lose!";
    }

    return "Game Over"; // Fallback
  };

  return (
    <div className="app-container">
      <header>
        <h1>
          {gameMode === "cheating" && "Cheating Wordle"}
          {gameMode === "normal" && "Wordle"}
          {gameMode === "multiplayer" && "Multiplayer Wordle"}
          {!gameMode && "Wordle"}
        </h1>
        <button className="stats-button" onClick={() => setIsStatsModalOpen(true)}>
          📊
        </button>
      </header>

      {view === "sp-game" && gameId && (
        <main className="game-container">
          <div className="instructions">
            <p>Guess the 5-letter word in 6 tries.</p>
            <p>
              Tile colors show how close your guess was: <b>Hit (green)</b>,{" "}
              <b>Present (yellow)</b>, <b>Miss (gray)</b>.
            </p>
          </div>
          <Board
            guesses={guesses}
            results={results}
            currentGuess={currentGuess}
            maxGuesses={maxGuesses}
            wordLength={wordLength}
          />
          <Keyboard keyStates={keyStates} onKeyPress={handleVirtualKeyPress} />
          {error && <div className="error-message">{error}</div>}
          {status === "win" && (
            <div className="game-over-message">You won!</div>
          )}
          {status === "loss" && (
            <div className="game-over-message">
              You lost! The word was: {answer?.toUpperCase()}
            </div>
          )}
          {(status === "win" || status === "loss") && (
            <button
              onClick={() => {
                // Reset all game-related state
                setGameId(null);
                setGameMode(null);
                setGuesses([]);
                setResults([]);
                setCurrentGuess("");
                setStatus(null);
                setAnswer(null);
                setView("menu");
              }}
            >
              Back to Menu
            </button>
          )}
        </main>
      )}

      {view === "menu" && (
        <main className="game-container pre-game-container">
          <p>Select a mode to start!</p>
          {status === "loading" ? (
            <p>Loading...</p>
          ) : (
            <div className="button-group">
              <button onClick={() => handleNewGame(false)}>
                Normal Wordle
              </button>
              <button onClick={() => handleNewGame(true)}>
                Cheating Wordle
              </button>
              <button
                onClick={() => {
                  setGameMode("multiplayer");
                  setView("mp-menu");
                  setError(null);
                }}
              >
                Multiplayer
              </button>
            </div>
          )}
          <footer
            style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#888" }}
          >
            <p>
              Word list sourced from:
              https://darkermango.github.io/5-Letter-words/words.json
            </p>
          </footer>
          {error && <div className="error-message">{error}</div>}
        </main>
      )}

      {view === "mp-menu" && (
        <main className="game-container pre-game-container">
          <div className="mp-section" style={{ textAlign: "left" }}>
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
              style={{ textTransform: "uppercase" }}
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
              <input
                type="text"
                placeholder="Room ID"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
              />
            )}
            <button onClick={isJoiningRoom ? handleJoinRoom : handleCreateRoom}>
              {isJoiningRoom ? "Join Room" : "Create Room"}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button onClick={() => setView("menu")}>Back to Menu</button>
        </main>
      )}

      {isStatsModalOpen && (
        <StatsModal stats={stats} onClose={() => setIsStatsModalOpen(false)} />
      )}

      {view === "mp-waiting" && (
        <main className="game-container pre-game-container">
          <h2>Room ID: {roomId}</h2>
          <p>Waiting for opponent to join and start the game...</p>
          <p>Share this ID with your friend!</p>
        </main>
      )}

      {view === "mp-game" && mpGameState && (
        <div>
          {/* Display error messages for multiplayer mode */}
          {error && (
            <div className="error-message" style={{ textAlign: "center" }}>
              {error}
            </div>
          )}
          <div className="instructions">
            {mpGameState.gameType === "race" ? (
              <>
                <p>
                  <b>Race Mode:</b> You and your opponent are guessing the same
                  word. The first player to find it wins!
                </p>
                <p>
                  <b>Tie:</b> A tie occurs if you both run out of guesses.
                </p>
              </>
            ) : (
              <>
                <p>
                  <b>Head-to-Head:</b> You are guessing your opponent's word.
                  The player who uses fewer guesses wins.
                </p>
                <p>
                  <b>Tie:</b> A tie occurs if you both solve it in the same
                  number of rounds, or if you both fail.
                </p>
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {sortedPlayers?.map((player) => (
              <main className="game-container" key={player.id}>
                <h2>
                  {player.id === playerId ? "Your Board" : "Opponent's Board"}
                </h2>
                <Board
                  guesses={player.guesses}
                  results={player.results}
                  // Only show the current typed guess on your own board
                  currentGuess={player.id === playerId ? currentGuess : ""}
                  maxGuesses={maxGuesses}
                  wordLength={wordLength}
                />
                {player.id === playerId && <Keyboard keyStates={keyStates} onKeyPress={handleVirtualKeyPress} />}
              </main>
            ))}
          </div>
          {mpGameState.status === "finished" && (
            <div className="game-over-message">
              {getMatchResult()}
              <div>
                <button
                  onClick={() => {
                    // Reset all multiplayer and view state
                    setView("menu");
                    setRoomId(null);
                    setRoomIdInput("");
                    setMpWord("");
                    setIsJoiningRoom(false);
                    setPlayerId(null);
                    setMpGameState(null);
                    setError(null);
                    setGameMode(null);
                  }}
                >
                  Back to Menu
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
