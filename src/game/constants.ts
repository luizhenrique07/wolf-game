import type { Role, Team } from './types';

export const DISCUSSION_DURATION_MS = 90_000;

export const ROLE_LABELS: Record<Role, string> = {
  wolf: 'Wolf',
  villager: 'Villager',
  hunter: 'Hunter',
  oracle: 'Oracle',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  wolf: 'Each night, you secretly eliminate one player. Win by equaling or outnumbering the village.',
  villager: 'You have no special power — but your vote and deduction are your weapons.',
  hunter: 'Once per game, you may eliminate a player. Use it wisely.',
  oracle: 'Once per game, you may learn whether a chosen player is the Wolf.',
};

export const ROLE_EMOJI: Record<Role, string> = {
  wolf: '🐺',
  villager: '🧑‍🌾',
  hunter: '🏹',
  oracle: '🔮',
};

export const TEAM_LABELS: Record<Team, string> = {
  wolves: 'Wolf Pack',
  village: 'Village',
};

export const TEAM_EMOJI: Record<Team, string> = {
  wolves: '🐺',
  village: '🏘️',
};

export const NIGHT_ACTION_INSTRUCTIONS: Record<string, string> = {
  wolf_kill: 'Choose a player to eliminate tonight.',
  hunter_kill: 'You have one shot. Choose a player to eliminate.',
  oracle_check: 'Choose a player to investigate. You will learn if they are the Wolf.',
};
