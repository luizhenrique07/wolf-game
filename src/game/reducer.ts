import type { GameState, GameAction, Player } from './types';
import {
  buildNightQueue,
  resolveNight,
  applyNightSummary,
  checkWinCondition,
  tallyVotes,
} from './engine';

export const initialGameState: GameState = {
  phase: 'lobby',
  players: [],
  round: 0,
  revealIndex: 0,
  nightTurns: [],
  nightTurnIndex: 0,
  lastNightSummary: null,
  lastVoteEliminated: null,
  votes: {},
  winner: null,
};

function assertNever(action: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_ROLE_REVEAL': {
      return {
        ...initialGameState,
        phase: 'role_reveal',
        players: action.players,
        round: 1,
        revealIndex: 0,
      };
    }

    case 'NEXT_REVEAL': {
      const nextIndex = state.revealIndex + 1;
      if (nextIndex < state.players.length) {
        return { ...state, revealIndex: nextIndex };
      }
      // All players have seen their roles — start discussion for round 1
      return { ...state, phase: 'discussion' };
    }

    case 'START_NIGHT': {
      const nightTurns = buildNightQueue(state.players);
      return { ...state, phase: 'night_action', nightTurns, nightTurnIndex: 0 };
    }

    case 'SUBMIT_NIGHT_ACTION': {
      const updatedTurns = state.nightTurns.map((turn, idx) =>
        idx === state.nightTurnIndex ? { ...turn, targetId: action.targetId } : turn
      );
      const nextTurnIndex = state.nightTurnIndex + 1;

      if (nextTurnIndex < state.nightTurns.length) {
        return { ...state, nightTurns: updatedTurns, nightTurnIndex: nextTurnIndex };
      }

      const summary = resolveNight(updatedTurns, state.players);
      const updatedPlayers = applyNightSummary(state.players, summary, updatedTurns);
      const winner = checkWinCondition(updatedPlayers);

      return {
        ...state,
        nightTurns: updatedTurns,
        nightTurnIndex: nextTurnIndex,
        players: updatedPlayers,
        lastNightSummary: summary,
        phase: winner ? 'game_over' : 'night_summary',
        winner,
      };
    }

    case 'ACKNOWLEDGE_NIGHT_SUMMARY': {
      // Night is over — start a new round with discussion
      return {
        ...state,
        phase: 'discussion',
        round: state.round + 1,
        lastNightSummary: null,
        lastVoteEliminated: null,
      };
    }

    case 'DISCUSSION_ENDED': {
      // Discussion always leads to voting
      return { ...state, phase: 'vote', votes: {} };
    }

    case 'CAST_VOTE': {
      return {
        ...state,
        votes: { ...state.votes, [action.voterId]: action.targetId },
      };
    }

    case 'SUBMIT_VOTES': {
      const eliminatedId = tallyVotes(state.votes);
      let updatedPlayers: Player[] = state.players;

      if (eliminatedId) {
        updatedPlayers = state.players.map((p) =>
          p.id === eliminatedId ? { ...p, isAlive: false } : p
        );
      }

      const winner = checkWinCondition(updatedPlayers);

      if (winner) {
        return { ...state, players: updatedPlayers, phase: 'game_over', winner };
      }

      // Vote always leads to night action
      const nightTurns = buildNightQueue(updatedPlayers);
      return {
        ...state,
        players: updatedPlayers,
        phase: 'night_action',
        nightTurns,
        nightTurnIndex: 0,
        votes: {},
        lastVoteEliminated: eliminatedId,
      };
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    default:
      return assertNever(action);
  }
}
