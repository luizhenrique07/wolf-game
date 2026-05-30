export type Role = 'wolf' | 'villager' | 'hunter' | 'oracle';

export type Team = 'wolves' | 'village';

export const ROLE_TEAM: Record<Role, Team> = {
  wolf: 'wolves',
  villager: 'village',
  hunter: 'village',
  oracle: 'village',
};

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  role: Role;
  isAlive: boolean;
  hasUsedAbility: boolean;
}

export type NightActionType = 'wolf_kill' | 'hunter_kill' | 'oracle_check';

export interface NightTurn {
  actorId: PlayerId;
  actionType: NightActionType;
  targetId: PlayerId | null;
}

export interface OracleReveal {
  targetId: PlayerId;
  isWolf: boolean;
}

export interface NightSummary {
  killed: PlayerId | null;
  oracleReveal: OracleReveal | null;
}

export type VoteTally = Record<PlayerId, PlayerId | null>;

export type Winner = 'wolves' | 'village' | null;

export type Phase =
  | 'lobby'
  | 'role_reveal'
  | 'night_action'
  | 'night_summary'
  | 'discussion'
  | 'vote'
  | 'game_over';

export interface GameState {
  phase: Phase;
  players: Player[];
  round: number;
  revealIndex: number;
  nightTurns: NightTurn[];
  nightTurnIndex: number;
  lastNightSummary: NightSummary | null;
  votes: VoteTally;
  winner: Winner;
}

export type GameAction =
  | { type: 'START_ROLE_REVEAL'; players: Player[] }
  | { type: 'NEXT_REVEAL' }
  | { type: 'START_NIGHT' }
  | { type: 'SUBMIT_NIGHT_ACTION'; targetId: PlayerId }
  | { type: 'ACKNOWLEDGE_NIGHT_SUMMARY' }
  | { type: 'DISCUSSION_ENDED' }
  | { type: 'CAST_VOTE'; voterId: PlayerId; targetId: PlayerId | null }
  | { type: 'SUBMIT_VOTES' }
  | { type: 'RESET_GAME' };
