import type {
  Player,
  PlayerId,
  Role,
  NightTurn,
  NightSummary,
  VoteTally,
  Winner,
} from './types';
import { ROLE_TEAM } from './types';

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function dealRoles(names: string[], roleCounts: Record<Role, number>): Player[] {
  const roles: Role[] = [];
  for (const [role, count] of Object.entries(roleCounts) as [Role, number][]) {
    for (let i = 0; i < count; i++) {
      roles.push(role);
    }
  }

  const shuffled = shuffleArray(roles);

  return names.map((name, idx) => ({
    id: `p${idx + 1}`,
    name,
    role: shuffled[idx],
    isAlive: true,
    hasUsedAbility: false,
  }));
}

export function buildNightQueue(players: Player[]): NightTurn[] {
  const turns: NightTurn[] = [];

  // Wolf always acts
  const wolves = players.filter((p) => p.isAlive && p.role === 'wolf');
  for (const wolf of wolves) {
    turns.push({ actorId: wolf.id, actionType: 'wolf_kill', targetId: null });
  }

  // Oracle acts if alive and hasn't used ability
  const oracle = players.find((p) => p.isAlive && p.role === 'oracle' && !p.hasUsedAbility);
  if (oracle) {
    turns.push({ actorId: oracle.id, actionType: 'oracle_check', targetId: null });
  }

  // Hunter acts if alive and hasn't used ability
  const hunter = players.find((p) => p.isAlive && p.role === 'hunter' && !p.hasUsedAbility);
  if (hunter) {
    turns.push({ actorId: hunter.id, actionType: 'hunter_kill', targetId: null });
  }

  return turns;
}

export function resolveNight(turns: NightTurn[], players: Player[]): NightSummary {
  const wolfKill = turns.find((t) => t.actionType === 'wolf_kill');
  const hunterKill = turns.find((t) => t.actionType === 'hunter_kill');
  const oracleCheck = turns.find((t) => t.actionType === 'oracle_check');

  let killed: PlayerId | null = null;

  if (wolfKill?.targetId) {
    // Wolf kill stands regardless of hunter (hunter is a separate one-time action)
    killed = wolfKill.targetId;
  }

  // If hunter acted, their target also dies (separate kill)
  // If hunter targeted same person as wolf, the person is still just dead once
  if (hunterKill?.targetId && hunterKill.targetId !== killed) {
    // Hunter kills a different person — both die
    // Per design: track as a second kill; night summary shows only one kill slot
    // We'll report the wolf kill as primary; hunter kill as additional
    // For simplicity: both die — we handle in applyNightSummary via turns
  }

  const oracleReveal =
    oracleCheck?.targetId
      ? {
          targetId: oracleCheck.targetId,
          isWolf: players.find((p) => p.id === oracleCheck.targetId)?.role === 'wolf',
        }
      : null;

  return { killed, oracleReveal };
}

export function applyNightSummary(
  players: Player[],
  summary: NightSummary,
  turns: NightTurn[]
): Player[] {
  const killedIds = new Set<PlayerId>();
  if (summary.killed) killedIds.add(summary.killed);

  // Hunter kill may kill a different target
  const hunterKill = turns.find((t) => t.actionType === 'hunter_kill');
  if (hunterKill?.targetId) killedIds.add(hunterKill.targetId);

  const usedAbilityIds = new Set<PlayerId>(
    turns
      .filter((t) => t.actionType === 'oracle_check' || t.actionType === 'hunter_kill')
      .map((t) => t.actorId)
  );

  return players.map((p) => ({
    ...p,
    isAlive: killedIds.has(p.id) ? false : p.isAlive,
    hasUsedAbility: usedAbilityIds.has(p.id) ? true : p.hasUsedAbility,
  }));
}

export function checkWinCondition(players: Player[]): Winner {
  const alive = players.filter((p) => p.isAlive);
  const wolves = alive.filter((p) => ROLE_TEAM[p.role] === 'wolves');
  const nonWolves = alive.filter((p) => ROLE_TEAM[p.role] === 'village');

  if (wolves.length === 0) return 'village';
  if (wolves.length >= nonWolves.length) return 'wolves';
  return null;
}

export function tallyVotes(votes: VoteTally): PlayerId | null {
  const counts: Record<PlayerId, number> = {};

  for (const targetId of Object.values(votes)) {
    if (targetId === null) continue;
    counts[targetId] = (counts[targetId] ?? 0) + 1;
  }

  if (Object.keys(counts).length === 0) return null;

  const maxVotes = Math.max(...Object.values(counts));
  const topCandidates = Object.entries(counts)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => id);

  if (topCandidates.length > 1) return null;

  return topCandidates[0];
}

export function validateRoleCounts(
  playerCount: number,
  roleCounts: Record<Role, number>
): string | null {
  const total = Object.values(roleCounts).reduce((a, b) => a + b, 0);
  if (total !== playerCount) return `Role total (${total}) must equal player count (${playerCount})`;
  if (roleCounts.wolf < 1) return 'Need at least 1 Wolf';
  if (roleCounts.wolf >= playerCount) return 'Too many Wolves';
  const nonWolves = playerCount - roleCounts.wolf;
  if (roleCounts.wolf >= nonWolves) return 'Wolves must be outnumbered by the village to start';
  return null;
}
