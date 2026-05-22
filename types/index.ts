export type Role = "ADMIN" | "VIEWER";
export type MatchStatus = "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";
export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type EventType =
  | "TWO_POINTER"
  | "THREE_POINTER"
  | "FREE_THROW"
  | "FOUL"
  | "TECHNICAL_FOUL"
  | "UNSPORTSMANLIKE_FOUL"
  | "SUBSTITUTION"
  | "QUARTER_END"
  | "TIMEOUT";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  color: string;
  logoUrl: string | null;
  captainId: number | null;
  coach: string | null;
  players?: Player[];
  standing?: TeamStanding;
}

export interface Player {
  id: number;
  name: string;
  jerseyNumber: number;
  position: Position;
  photoUrl: string | null;
  isActive: boolean;
  teamId: number;
  team?: Team;
  matchStats?: PlayerMatchStat[];
}

export interface Match {
  id: number;
  matchNumber: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  venue: string;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  currentQuarter: number;
  leg: number;
  mvpPlayerId: number | null;
  homeTeam: Team;
  awayTeam: Team;
  quarters?: QuarterScore[];
  playerStats?: PlayerMatchStat[];
  events?: MatchEvent[];
}

export interface QuarterScore {
  id: number;
  matchId: number;
  quarter: number;
  homeScore: number;
  awayScore: number;
}

export interface PlayerMatchStat {
  id: number;
  playerId: number;
  matchId: number;
  teamId: number;
  points: number;
  twoPointers: number;
  threePointers: number;
  freeThrows: number;
  fouls: number;
  technicalFouls: number;
  isDisqualified: boolean;
  player?: Player;
  match?: Match;
}

export interface MatchEvent {
  id: number;
  matchId: number;
  quarter: number;
  minute: number;
  type: EventType;
  teamId: number | null;
  playerId: number | null;
  value: number | null;
  note: string | null;
  createdAt: string;
}

export interface TeamStanding {
  id: number;
  teamId: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
  team?: Team;
}

export interface TournamentSettings {
  id: number;
  name: string;
  season: number;
  quartersPerGame: number;
  quarterDuration: number;
  shotClock: number;
  foulLimit: number;
  teamFoulReset: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface LiveScoreUpdate {
  matchId: number;
  homeScore: number;
  awayScore: number;
  currentQuarter: number;
  quarters: QuarterScore[];
  event?: {
    type: EventType;
    teamId: number;
    playerId?: number;
    value?: number;
    quarter: number;
    minute: number;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PlayerAggregateStat {
  player: Player;
  totalPoints: number;
  totalTwoPointers: number;
  totalThreePointers: number;
  totalFreeThrows: number;
  totalFouls: number;
  matchesPlayed: number;
  ppg: number;
}
