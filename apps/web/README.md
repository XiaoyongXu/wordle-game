# Wordle Game - Frontend Architecture

This document outlines the architecture of the Wordle Game frontend application, built with React and TypeScript. The project has been refactored to emphasize a clean separation of concerns, making it more scalable and maintainable.

## Core Principles

The architecture is built around these key principles:

1.  **Centralized State Management**: A single `useReducer` hook in the root `App` component manages all application state. The state shape, all possible actions, and the reducer logic are co-located in `src/state.ts`.

2.  **Component-Based UI**: The UI is broken down into two categories:
    -   **Page Components** (`src/pages/`): Larger components that represent a specific view or screen in the application (e.g., `MenuPage`, `SinglePlayerGamePage`).
    -   **UI Components** (`src/components/`): Smaller, reusable, and often stateless components that form the building blocks of the UI (e.g., `Board`, `Keyboard`, `Header`).

3.  **Logic Encapsulation with Hooks**: All business logic, side effects, and derived state calculations are extracted from the UI and encapsulated within custom hooks in the `src/hooks/` directory. This keeps components clean and focused on rendering.

## Project Structure

The `src/` directory is organized as follows:

```
src/
├── App.tsx                 # The root component, orchestrates state and pages.
├── api-client.ts           # Functions for making HTTP requests to the backend.
├── state.ts                # Defines the app's state shape, actions, and reducer.
│
├── components/             # Reusable UI components.
│   ├── Board.tsx
│   ├── Header.tsx
│   ├── Keyboard.tsx
│   └── ...
│
├── hooks/                  # Custom hooks for all application logic.
│   ├── useGameController.ts  # The main controller hook, composes other hooks.
│   ├── useGameActions.ts     # Handles API calls for game actions.
│   ├── useKeyboardInput.ts   # Manages physical keyboard input.
│   └── useMultiplayerSocket.ts # Manages the WebSocket connection lifecycle.
│
├── pages/                  # Components for each application view.
│   ├── MenuPage.tsx
│   ├── MultiplayerGamePage.tsx
│   └── ...
│
├── utils/                  # Pure, reusable utility functions.
│   └── gameUtils.ts
│
└── ... (other files like main.tsx, index.css, etc.)
```

### Data Flow

The application follows a unidirectional data flow:

1.  **`App.tsx`** initializes the `useReducer` and the main `useGameController` hook.
2.  The `useGameController` hook consumes the current state and returns derived data (e.g., `keyStates`, `isGameActive`) and action handlers (e.g., `handleNewGame`, `handleVirtualKeyPress`).
3.  `App.tsx` passes the necessary state and handlers down to the currently active **Page Component**.
4.  User interactions in a Page or UI Component call an action handler.
5.  The handler (inside a hook) may perform side effects (like an API call) and eventually calls `dispatch` with an action.
6.  The **reducer** in `state.ts` processes the action and returns a new state object, triggering a re-render.