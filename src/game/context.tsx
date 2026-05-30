import React, { createContext, useContext, useReducer, useMemo, type PropsWithChildren } from 'react';
import type { GameState, GameAction, Player, NightTurn } from './types';
import { gameReducer, initialGameState } from './reducer';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  alivePlayers: Player[];
  currentNightTurn: NightTurn | undefined;
  currentNightActor: Player | undefined;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const value = useMemo<GameContextValue>(() => {
    const alivePlayers = state.players.filter((p) => p.isAlive);
    const currentNightTurn = state.nightTurns[state.nightTurnIndex];
    const currentNightActor = currentNightTurn
      ? state.players.find((p) => p.id === currentNightTurn.actorId)
      : undefined;

    return { state, dispatch, alivePlayers, currentNightTurn, currentNightActor };
  }, [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
