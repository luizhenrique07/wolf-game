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
  votes: {},
  winner: null,
  discussionNextPhase: 'vote',
};

function assertNever(action: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
}

// Enter the pre-night discussion phase (1m30s before characters act).
function startPreNightDiscussion(state: GameState): GameState {
  const nightTurns = buildNightQueue(state.players);
  return {
    ...state,
    phase: 'discussion',
    discussionNextPhase: 'night_action',
    nightTurns,
    nightTurnIndex: 0,
  };
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
      // All players have seen their roles — discussion before night 1
      return startPreNightDiscussion(state);
    }

    case 'START_NIGHT': {
      return startPreNightDiscussion({ ...state, round: state.round + 1 });
    }

    case 'SUBMIT_NIGHT_ACTION': {
      const updatedTurns = state.nightTurns.map((turn, idx) =>
        idx === state.nightTurnIndex ? { ...turn, targetId: action.targetId } : turn
      );
      const nextTurnIndex = state.nightTurnIndex + 1;

      if (nextTurnIndex < state.nightTurns.length) {
        return {
          ...state,
          nightTurns: updatedTurns,
          nightTurnIndex: nextTurnIndex,
        };
      }

      // All night actions done — resolve
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
      return {
        ...state,
        phase: 'discussion',
        discussionNextPhase: 'vote',
      };
    }

    case 'DISCUSSION_ENDED': {
      if (state.discussionNextPhase === 'night_action') {
        // Pre-night discussion finished — begin night actions (queue already built)
        return {
          ...state,
          phase: 'night_action',
        };
      }
      // Day discussion finished — go to vote
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
        return {
          ...state,
          players: updatedPlayers,
          phase: 'game_over',
          winner,
        };
      }

      // After vote — pre-night discussion before next round
      return startPreNightDiscussion({
        ...state,
        players: updatedPlayers,
        round: state.round + 1,
        lastNightSummary: null,
        votes: {},
      });
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    default:
      return assertNever(action);
  }
}
