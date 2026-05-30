@AGENTS.md

# Wolf Game — Project Context

## What this is
A single-device, pass-around Werewolf/Mafia-style social deduction game built in React Native Expo. Players physically share one phone; the app manages sequential private turns so each player only sees what they should.

## Game rules
- **Characters**: Wolf (kills one player per night), Villager (no action), Hunter (kills once, one-time use), Oracle (checks if someone is the Wolf, one-time use)
- **Teams**: Wolf vs. Village
- **Win conditions**: All wolves dead → Village wins. Wolves ≥ non-wolves (alive) → Wolves win
- **Role assignment**: Automatic. `wolves = floor(n/3)`, 1 Hunter, 1 Oracle, rest Villagers. Wolves always outnumbered at start. Role picker UI is commented out in `src/app/index.tsx` for future use.

## Game flow (per round)
```
Lobby → Role Reveal → Discussion (1m30s) → Vote → Night Action → Night Summary
                                                ↑                       ↓
                                         Discussion (1m30s) ←──────────┘
```
One discussion + one vote per round, forever, until a win condition is met.

- **Role Reveal**: each player privately sees their role on a gate screen (NightGate)
- **Discussion**: 1m30s countdown timer, skip button. Always leads to Vote.
- **Vote**: per-player private voting via NightGate — each alive player sees gate → casts vote → passes device. After last voter, majority eliminates; tie = no one dies. Always leads to Night Action.
- **Night Action**: all alive players cycle through a NightGate. Wolf/Oracle/Hunter can act or skip; Villagers (and used-ability players) see a "no action" screen. Round processes after last player.
- **Night Summary**: reveals who died at night. "Begin Discussion" → increments round → Discussion.

## Architecture
- **State machine**: `src/game/reducer.ts` (useReducer) + `src/game/context.tsx` (GameProvider/useGame hook)
- **Pure game logic**: `src/game/engine.ts` — `dealRoles`, `buildNightQueue`, `resolveNight`, `applyNightSummary`, `checkWinCondition`, `tallyVotes`
- **Types**: `src/game/types.ts` — all interfaces, `GameState` includes `discussionNextPhase: 'vote' | 'night_action'`
- **Constants/copy**: `src/game/constants.ts` — `DISCUSSION_DURATION_MS = 90_000`, role labels/descriptions
- **Navigation**: Expo Router Stack, all screens use `router.replace` (no back navigation during game). `_layout.tsx` wraps everything in `GameProvider`

## Key files
| Path | Purpose |
|---|---|
| `src/app/index.tsx` | Lobby — player name inputs, Start Game button |
| `src/app/game/role-reveal.tsx` | Each player sees their role via NightGate |
| `src/app/game/night-action.tsx` | Sequential private night actions (Wolf → Oracle → Hunter) |
| `src/app/game/night-summary.tsx` | Daytime results — who died |
| `src/app/game/discussion.tsx` | Shared timer screen (pre-night and day) |
| `src/app/game/vote.tsx` | Public voting |
| `src/app/game/result.tsx` | Game over, full role reveal |
| `src/components/game/night-gate.tsx` | Full-screen privacy gate; accepts optional `role` prop to show role info |
| `src/components/game/icons/index.tsx` | SVG icons for all 4 roles — `WolfIcon`, `VillagerIcon`, `HunterIcon`, `OracleIcon`, `RoleIcon` |
| `src/game/reducer.ts` | State machine with all phase transitions |

## Design conventions
- Dark purple/black color scheme (`#080510` background, `#E8D5FF` text, `#7C5CBF` accents)
- All game screens are full-screen, `headerShown: false`
- Back navigation is disabled during game to prevent state corruption
- `react-native-svg` is installed for the role icons
- `react-native-reanimated` is used for animations
