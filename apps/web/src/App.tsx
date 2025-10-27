import { useReducer } from 'react';
import "./App.css";
import { loadStats } from "./statsService";
import { StatsModal } from "./components/StatsModal";
import { Header } from './components/Header.tsx';
import { appReducer, initialState } from "./state.ts";
import { useGameController } from './hooks/useGameController.ts';
import { MenuPage } from "./pages/MenuPage.tsx";
import { SinglePlayerGamePage } from "./pages/SinglePlayerGamePage.tsx";
import { MultiplayerMenuPage } from "./pages/MultiplayerMenuPage.tsx";
import { MultiplayerWaitingPage } from "./pages/MultiplayerWaitingPage.tsx";
import { MultiplayerGamePage } from "./pages/MultiplayerGamePage.tsx";

function App() {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    stats: loadStats(), // Load initial stats
  });

  const {
    view,
    gameId,
    guesses,
    results,
    currentGuess,
    status,
    error,
    answer,
    gameMode,
    roomId,
    mpWord,
    isJoiningRoom,
    roomIdInput,
    playerId,
    mpGameState,
    stats,
    isStatsModalOpen,
    wordLength,
    maxGuesses,
  } = state;

  const {
    handleNewGame,
    handleCreateRoom,
    handleJoinRoom,
    handleVirtualKeyPress,
    sortedPlayers,
    keyStates,
  } = useGameController(state, dispatch);

  return (
    <div className="app-container">
      <Header
        gameMode={gameMode}
        onOpenStats={() => dispatch({ type: 'SET_STATS_MODAL_OPEN', payload: true })}
      />

      {view === "sp-game" && gameId && (
        <SinglePlayerGamePage
          guesses={guesses}
          results={results}
          currentGuess={currentGuess}
          maxGuesses={maxGuesses}
          wordLength={wordLength}
          keyStates={keyStates}
          onKeyPress={handleVirtualKeyPress}
          error={error}
          status={status}
          answer={answer}
          onBackToMenu={() => dispatch({ type: 'RESET_SP_GAME' })}
        />
      )}

      {view === "menu" && (
        <MenuPage
          status={status}
          error={error}
          onNewGame={handleNewGame}
          onGoToMultiplayerMenu={() => {
            dispatch({ type: 'SET_GAME_MODE', payload: 'multiplayer' });
            dispatch({ type: 'SET_VIEW', payload: 'mp-menu' });
          }}
        />
      )}

      {view === "mp-menu" && (
        <MultiplayerMenuPage
          mpWord={mpWord}
          setMpWord={(word) => dispatch({ type: 'SET_MP_WORD', payload: word })}
          isJoiningRoom={isJoiningRoom}
          setIsJoiningRoom={(isJoining) => dispatch({ type: 'SET_IS_JOINING_ROOM', payload: isJoining })}
          roomIdInput={roomIdInput}
          setRoomIdInput={(id) => dispatch({ type: 'SET_ROOM_ID_INPUT', payload: id })}
          handleJoinRoom={handleJoinRoom}
          handleCreateRoom={handleCreateRoom}
          error={error}
          onBackToMenu={() => dispatch({ type: 'SET_VIEW', payload: 'menu' })}
        />
      )}

      {isStatsModalOpen && (
        <StatsModal stats={stats} onClose={() => dispatch({ type: 'SET_STATS_MODAL_OPEN', payload: false })} />
      )}

      {view === "mp-waiting" && <MultiplayerWaitingPage roomId={roomId} />}

      {view === "mp-game" && mpGameState && (
        <MultiplayerGamePage
          mpGameState={mpGameState}
          error={error}
          sortedPlayers={sortedPlayers}
          playerId={playerId}
          currentGuess={currentGuess}
          maxGuesses={maxGuesses}
          wordLength={wordLength}
          keyStates={keyStates}
          onKeyPress={handleVirtualKeyPress}
          onBackToMenu={() => dispatch({ type: 'RESET_MP_GAME' })}
        />
      )}
    </div>
  );
}

export default App;
